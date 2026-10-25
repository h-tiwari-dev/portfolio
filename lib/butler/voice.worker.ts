/// <reference lib="webworker" />
import { AutoConfig, AutoTokenizer, PreTrainedModel, Tensor, env, type PreTrainedTokenizer } from '@huggingface/transformers';
import { MODELS, type VoiceRequest, type VoiceResponse } from './protocol';

env.allowLocalModels = false;
if (env.backends.onnx) env.backends.onnx.logLevel = 'error';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const SAMPLE_RATE = 24000;
// Hugh: a middle-aged British voice with pitch movement, rather than Kokoro's flatter butler.
const VOICE_FILE = 'voices/YyKcxPG7iIgS3jsK.bin';

type PhononTensor = Tensor & { location?: string; dispose?: () => void; data: Float32Array | BigInt64Array };
type PhononModel = (inputs: Record<string, PhononTensor>) => Promise<Record<string, PhononTensor>>;
type State = Record<string, PhononTensor>;
type PhononConfig = {
  temperature: number;
  eos_threshold: number;
  frame_rate: number;
  latent_dim: number;
  voice_dim: number;
  flow_lm: { num_layers: number; num_heads: number; head_dim: number };
  mimi_decoder: {
    num_layers: number;
    num_heads: number;
    head_dim: number;
    conv_states: Record<string, number[]>;
  };
};

const loadModel = PreTrainedModel.from_pretrained.bind(PreTrainedModel) as (
  id: string,
  options: object
) => Promise<PhononModel>;

let flow: PhononModel | null = null;
let mimi: PhononModel | null = null;
let tokenizer: PreTrainedTokenizer | null = null;
let cfg: PhononConfig | null = null;
let voiceState: State | null = null;
const queue: Extract<VoiceRequest, { type: 'speak' }>[] = [];
let busy = false;
let current = -1;

function post(message: VoiceResponse, transfer: Transferable[] = []) {
  scope.postMessage(message, transfer);
}

function wanted(id: number) {
  return id < 0 || id === current;
}

function f32(dims: number[], data?: Float32Array) {
  const size = dims.reduce((a, b) => a * b, 1);
  return new Tensor('float32', data ?? new Float32Array(size), dims) as PhononTensor;
}

function i64(values: number[], dims: number[]) {
  return new Tensor('int64', BigInt64Array.from(values, BigInt), dims) as PhononTensor;
}

function emptyCache(shape: { num_layers: number; num_heads: number; head_dim: number }): State {
  const state: State = {};
  for (let layer = 0; layer < shape.num_layers; layer += 1) {
    state[`past_key_values.${layer}.key`] = f32([1, shape.num_heads, 0, shape.head_dim]);
    state[`past_key_values.${layer}.value`] = f32([1, shape.num_heads, 0, shape.head_dim]);
  }
  return state;
}

function nextState(outputs: Record<string, PhononTensor>): State {
  const state: State = {};
  for (const [name, value] of Object.entries(outputs)) {
    if (!name.startsWith('present')) continue;
    state[name.replace('present.', 'past_key_values.').replace('present_', 'past_')] = value;
  }
  return state;
}

function release(...states: State[]) {
  for (const state of states) {
    for (const tensor of Object.values(state)) {
      if (tensor.location === 'gpu-buffer') tensor.dispose?.();
    }
  }
}

function patchByteFallback(modelTokenizer: PreTrainedTokenizer) {
  const unigram = (
    modelTokenizer as unknown as {
      _tokenizer?: {
        model?: {
          byte_fallback?: boolean;
          tokens_to_ids: Map<string, number>;
          encode: (tokens: string[]) => string[];
        };
      };
    }
  )._tokenizer?.model;
  if (!unigram || unigram.byte_fallback) return;
  const encodePieces = unigram.encode.bind(unigram);
  unigram.encode = (tokens: string[]) =>
    encodePieces(tokens).flatMap((piece) => {
      if (unigram.tokens_to_ids.has(piece)) return [piece];
      const bytes = Array.from(new TextEncoder().encode(piece), (byte) => `<0x${byte.toString(16).toUpperCase().padStart(2, '0')}>`);
      return bytes.every((byte) => unigram.tokens_to_ids.has(byte)) ? bytes : [piece];
    });
}

async function loadVoice(device: 'webgpu' | 'wasm', dtype: 'q4f16' | 'q4' | 'fp32', progress: (event: { status: string; file?: string; loaded?: number; total?: number }) => void) {
  const config = await AutoConfig.from_pretrained(MODELS.voice);
  const phonon = (config as unknown as { phonon: PhononConfig }).phonon;
  const [flowModel, mimiModel, modelTokenizer] = await Promise.all([
    loadModel(MODELS.voice, {
      config,
      model_file_name: 'flow_lm',
      dtype,
      device,
      progress_callback: progress,
    }),
    loadModel(MODELS.voice, {
      config,
      model_file_name: 'mimi_decoder',
      dtype,
      device,
      progress_callback: progress,
    }),
    AutoTokenizer.from_pretrained(MODELS.voice, { progress_callback: progress }),
  ]);
  patchByteFallback(modelTokenizer);
  const voiceResponse = await fetch(`https://huggingface.co/${MODELS.voice}/resolve/main/${VOICE_FILE}`);
  if (!voiceResponse.ok) throw new Error('The butler voice failed to download.');
  const voiceData = new Float32Array(await voiceResponse.arrayBuffer());
  const voice = f32([1, phonon.voice_dim, voiceData.length / phonon.voice_dim], voiceData);
  const runFlow = (past: State, inputs: { text?: number[]; voiceLatents?: PhononTensor; latent?: PhononTensor; noise?: PhononTensor }) =>
    flowModel({
      text_ids: i64(inputs.text ?? [], [1, inputs.text?.length ?? 0]),
      voice_latents: inputs.voiceLatents ?? f32([1, phonon.voice_dim, 0]),
      latent: inputs.latent ?? f32([1, 0, phonon.latent_dim]),
      noise: inputs.noise ?? f32([1, phonon.latent_dim]),
      num_speakers: i64([1], [1]),
      duration_delta: f32([1]),
      ...past,
    });
  const prompted = nextState(await runFlow(emptyCache(phonon.flow_lm), { voiceLatents: voice }));
  return { flowModel, mimiModel, modelTokenizer, phonon, prompted };
}

async function synthesize(text: string, id: number) {
  if (!flow || !mimi || !tokenizer || !cfg || !voiceState) throw new Error('The voice is not loaded.');
  let sentence = text.trim().replace(/\s+/g, ' ');
  if (!sentence) return new Float32Array();
  sentence = sentence[0].toUpperCase() + sentence.slice(1);
  if (/[\p{L}\p{N}]$/u.test(sentence)) sentence += '.';
  const ids = tokenizer.encode(sentence, { add_special_tokens: false });
  let state = nextState(
    await flow({
      text_ids: i64(ids, [1, ids.length]),
      voice_latents: f32([1, cfg.voice_dim, 0]),
      latent: f32([1, 0, cfg.latent_dim]),
      noise: f32([1, cfg.latent_dim]),
      num_speakers: i64([1], [1]),
      duration_delta: f32([1]),
      ...voiceState,
    })
  );
  const codec: State = { past_offset: i64([0], [1]), ...emptyCache(cfg.mimi_decoder) };
  for (const [name, dims] of Object.entries(cfg.mimi_decoder.conv_states)) codec[name] = f32(dims);
  let latent = f32([1, 1, cfg.latent_dim], new Float32Array(cfg.latent_dim).fill(Number.NaN));
  const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const chunks: Float32Array[] = [];
  let countdown: number | null = null;
  const frames = Math.ceil((ids.length / 3 + 2) * cfg.frame_rate);
  try {
    for (let frame = 0; frame < frames; frame += 1) {
      if (!wanted(id)) return null;
      const noise = f32(
        [1, cfg.latent_dim],
        Float32Array.from({ length: cfg.latent_dim }, () => randn() * Math.sqrt(cfg.temperature))
      );
      const step = await flow({
        text_ids: i64([], [1, 0]),
        voice_latents: f32([1, cfg.voice_dim, 0]),
        latent,
        noise,
        num_speakers: i64([1], [1]),
        duration_delta: f32([1]),
        ...state,
      });
      release(state, { latent });
      state = nextState(step);
      latent = step.latent_out;
      const decoded = await mimi({ latent, ...codec });
      release(codec);
      const audio = decoded.audio.data as Float32Array;
      chunks.push(new Float32Array(audio));
      Object.assign(codec, nextState(decoded));
      const eos = (step.eos_logit.data as Float32Array)[0];
      if (countdown === null && eos > cfg.eos_threshold) countdown = sentence.split(' ').length <= 4 ? 3 : 1;
      if (countdown !== null) {
        countdown -= 1;
        if (countdown < 0) break;
      }
    }
  } finally {
    release(state, codec, { latent });
  }
  const samples = new Float32Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    samples.set(chunk, offset);
    offset += chunk.length;
  }
  return samples;
}

async function drain() {
  if (busy || !flow) return;
  busy = true;
  while (queue.length) {
    const job = queue.shift()!;
    if (!wanted(job.id)) continue;
    try {
      const started = performance.now();
      const samples = await synthesize(job.text, job.id);
      if (!samples || !wanted(job.id)) continue;
      post(
        { type: 'audio', id: job.id, seq: job.seq, samples, rate: SAMPLE_RATE, ms: performance.now() - started },
        [samples.buffer]
      );
    } catch (error) {
      post({ type: 'error', id: job.id, seq: job.seq, message: error instanceof Error ? error.message : String(error) });
    }
  }
  busy = false;
}

scope.onmessage = async (event: MessageEvent<VoiceRequest>) => {
  const message = event.data;
  if (message.type === 'load') {
    if (flow) {
      post({ type: 'ready', device: 'cached' });
      return;
    }
    const progress = (update: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (update.status === 'progress' && update.file) {
        post({ type: 'progress', part: 'voice', file: update.file, loaded: update.loaded ?? 0, total: update.total ?? 0 });
      }
    };
    // Phonon's voice prompt uses empty tensors. This onnxruntime-web build fails that
    // graph on WebGPU, and a failed WebGPU session pins the wasm runtime so a later
    // fallback cannot run. WASM fp32 is faster than real time and matches the reference.
    const attempts: ['wasm', 'fp32'][] = [['wasm', 'fp32']];
    let loaded: Awaited<ReturnType<typeof loadVoice>> | null = null;
    let device: 'webgpu' | 'wasm' = 'wasm';
    for (const [attemptDevice, dtype] of attempts) {
      try {
        loaded = await loadVoice(attemptDevice, dtype, progress);
        device = attemptDevice;
        break;
      } catch (error) {
        console.warn(`[butler] ${dtype} voice on ${attemptDevice} failed`, error);
      }
    }
    if (!loaded) {
      post({ type: 'error', message: 'The voice failed to load.' });
      return;
    }
    flow = loaded.flowModel;
    mimi = loaded.mimiModel;
    tokenizer = loaded.modelTokenizer;
    cfg = loaded.phonon;
    voiceState = loaded.prompted;
    try {
      await synthesize('Ready.', -1);
      post({ type: 'ready', device });
    } catch (error) {
      post({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
    return;
  }
  if (message.type === 'cancel') {
    current = -1;
    queue.length = 0;
    return;
  }
  if (message.type === 'speak') {
    if (message.id >= 0 && message.id !== current) {
      current = message.id;
      queue.length = 0;
    }
    queue.push(message);
    void drain();
  }
};
