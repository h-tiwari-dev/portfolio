/// <reference lib="webworker" />
import {
  InterruptableStoppingCriteria,
  LogitsProcessor,
  LogitsProcessorList,
  env,
  pipeline,
  type PreTrainedTokenizer,
  type Tensor,
} from '@huggingface/transformers';
import { MODELS, type BrainRequest, type BrainResponse, type Part } from './protocol';

env.allowLocalModels = false;
if (env.backends.onnx) env.backends.onnx.logLevel = 'error';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const loadPipeline = pipeline as unknown as (task: string, model: string, options: object) => Promise<unknown>;
type Ears = ((
  audio: Float32Array,
  kwargs?: Record<string, unknown>
) => Promise<{ text: string } | { text: string }[]>) & {
  tokenizer: PreTrainedTokenizer;
};
type Mind = (
  messages: { role: string; content: string }[],
  options: Record<string, unknown>
) => Promise<unknown>;

let ears: Ears | null = null;
const QUIET = { logSeverityLevel: 3 };
let mind: Mind | null = null;
let mindId = '';
const stopper = new InterruptableStoppingCriteria();

// A handful of proper nouns Moonshine mishears often ("Both his work at wellness
// level" for "WellnessLiving", "kaso" for "Kusho", "carcelor" for "Castler"). This
// nudges decoding toward them, the same way Whisper's `initial_prompt` biases a
// transcript, without forcing them into speech that never mentioned them.
const BIAS_WORDS = ['Castler', 'Kusho', 'WellnessLiving', 'Wellness Living'];
const BIAS_VALUE = 4;

class SequenceBiasLogitsProcessor extends LogitsProcessor {
  private sequences: number[][];

  constructor(sequences: number[][]) {
    super();
    this.sequences = sequences;
  }

  _call(inputIds: bigint[][], logits: Tensor) {
    // The runtime Tensor supports per-row indexing (used the same way inside the
    // library's own NoBadWordsLogitsProcessor), but the public .d.ts only declares
    // Symbol.iterator, so index through an untyped view.
    const rows = logits as unknown as Tensor[];
    for (let i = 0; i < inputIds.length; i += 1) {
      const ids = inputIds[i];
      const data = rows[i].data as Float32Array;
      for (const sequence of this.sequences) {
        if (ids.length < sequence.length - 1) continue;
        let matches = true;
        for (let back = 1; back <= sequence.length - 1; back += 1) {
          if (BigInt(sequence[sequence.length - 1 - back]) !== ids[ids.length - back]) {
            matches = false;
            break;
          }
        }
        if (matches) data[sequence[sequence.length - 1]] += BIAS_VALUE;
      }
    }
    return logits;
  }
}

function buildBiasProcessor(tokenizer: PreTrainedTokenizer) {
  const seen = new Set<string>();
  const sequences: number[][] = [];
  for (const word of BIAS_WORDS) {
    for (const variant of [word, ` ${word}`, word.toLowerCase(), ` ${word.toLowerCase()}`]) {
      const ids = tokenizer.encode(variant, { add_special_tokens: false });
      // Skip single-token forms: biasing those unconditionally at every step is too blunt.
      if (ids.length < 2) continue;
      const key = ids.join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      sequences.push(ids);
    }
  }
  if (sequences.length === 0) return null;
  const list = new LogitsProcessorList();
  list.push(new SequenceBiasLogitsProcessor(sequences));
  return list;
}

let biasProcessor: InstanceType<typeof LogitsProcessorList> | null = null;

function post(message: BrainResponse) {
  scope.postMessage(message);
}

function progress(part: Part) {
  return (event: { status: string; file?: string; loaded?: number; total?: number }) => {
    if (event.status === 'progress' && event.file) {
      post({ type: 'progress', part, file: event.file, loaded: event.loaded ?? 0, total: event.total ?? 0 });
    }
  };
}

async function hasWebGpu() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

const WEIGHTS_FALLBACK = 'https://www.tiwariaiharsh.com';

async function hasLocalMind() {
  try {
    const config = await fetch('/models/butler-resume/config.json', { method: 'HEAD' });
    if (!config.ok) return false;
    const sameOrigin = await fetch('/models/butler-resume/onnx/model_q4f16.onnx', { method: 'HEAD' });
    if (sameOrigin.ok) return true;
    if (self.location.hostname === 'www.tiwariaiharsh.com') return false;
    const fallback = await fetch(`${WEIGHTS_FALLBACK}/models/butler-resume/onnx/model_q4f16.onnx`, { method: 'HEAD' });
    return fallback.ok;
  } catch {
    return false;
  }
}

function proxyMissingWeights() {
  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const parsed = new URL(raw, self.location.origin);
    const sameHost = parsed.origin === self.location.origin;
    if (sameHost && parsed.pathname.startsWith('/models/butler-resume/onnx/')) {
      const local = await original(input, init);
      if (local.ok || local.status === 206) return local;
      return original(`${WEIGHTS_FALLBACK}${parsed.pathname}${parsed.search}`, init);
    }
    return original(input, init);
  }) as typeof fetch;
}

async function load(useMind: boolean, mindModel?: string, mindDtype = 'q4f16', earsModel: string = MODELS.ears) {
  const gpu = await hasWebGpu();
  const localMind = !mindModel && (await hasLocalMind());
  const mindToLoad = mindModel ?? (localMind ? 'butler-resume' : MODELS.mind);
  if (localMind) {
    env.allowLocalModels = true;
    proxyMissingWeights();
  }
  const loadEars = (async () => {
    if (ears) return;
    const loadEarsModel = (device: 'webgpu' | 'wasm', dtype: 'q8' | Record<string, string>) =>
      loadPipeline('automatic-speech-recognition', earsModel, {
        dtype,
        device,
        progress_callback: progress('ears'),
        session_options: QUIET,
      }) as Promise<Ears>;
    // The quantized encoder is what muddies short names. On a GPU, keep that
    // encoder in fp16 and leave the decoder quantized. Fall back if fp16 is missing.
    try {
      ears = await loadEarsModel(
        gpu ? 'webgpu' : 'wasm',
        gpu ? { encoder_model: 'fp16', decoder_model_merged: 'q8' } : 'q8'
      );
    } catch (error) {
      if (!gpu) throw error;
      console.warn('[butler] fp16 ears failed, using the quantized model', error);
      ears = await loadEarsModel('wasm', 'q8');
    }
    biasProcessor = buildBiasProcessor(ears.tokenizer);
    await ears(new Float32Array(16000));
  })();

  const loadMind = (async () => {
    if (!useMind || !gpu || mind) return;
    const options = {
      dtype: mindDtype,
      device: 'webgpu',
      progress_callback: progress('mind'),
      session_options: QUIET,
    };
    try {
      mindId = mindToLoad === 'butler-resume' ? 'Qwen3-butler' : mindToLoad;
      mind = (await loadPipeline('text-generation', mindToLoad, options)) as Mind;
    } catch (error) {
      if (mindToLoad !== 'butler-resume') throw error;
      console.warn('[butler] local mind failed, using the hosted model', error);
      env.allowLocalModels = false;
      mindId = MODELS.mind;
      mind = (await loadPipeline('text-generation', MODELS.mind, options)) as Mind;
    }
    await mind([{ role: 'user', content: 'Hello' }], { max_new_tokens: 1, do_sample: false });
  })();

  await Promise.all([loadEars, loadMind]);
  post({ type: 'ready', mind: Boolean(mind), device: gpu ? 'webgpu' : 'wasm' });
}

let chain = Promise.resolve();

scope.onmessage = (event: MessageEvent<BrainRequest>) => {
  const message = event.data;
  if (message.type === 'abort') {
    stopper.interrupt();
    return;
  }
  chain = chain.then(() => handle(message));
};

function prepareHearing(audio: Float32Array) {
  let peak = 0;
  for (let i = 0; i < audio.length; i += 1) peak = Math.max(peak, Math.abs(audio[i]));
  // Quiet laptop mics land well below the level Moonshine was trained on.
  if (peak <= 0.012 || peak >= 0.55) return audio;
  const gain = Math.min(3, 0.85 / peak);
  const out = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i += 1) out[i] = Math.max(-1, Math.min(1, audio[i] * gain));
  return out;
}

async function handle(message: Exclude<BrainRequest, { type: 'abort' }>) {
  try {
    if (message.type === 'load') {
      await load(message.useMind, message.mindModel, message.mindDtype, message.earsModel);
      return;
    }
    if (message.type === 'transcribe') {
      if (!ears) throw new Error('Speech recognition is not loaded.');
      const audio = prepareHearing(message.audio);
      const started = performance.now();
      const output = await ears(audio, {
        ...(biasProcessor ? { logits_processor: biasProcessor } : {}),
        // The pipeline budgets 6 tokens per second, which clips a short question
        // before the last name is written. Keep that rate, but never below 16.
        max_new_tokens: Math.max(16, Math.ceil(audio.length / 16000) * 6),
      });
      const text = Array.isArray(output) ? output.map((item) => item.text).join(' ') : output.text;
      post({ type: 'transcript', id: message.id, text: text.trim(), ms: performance.now() - started });
      return;
    }
    if (message.type === 'think') {
      if (!mind) throw new Error('The language model is not loaded.');
      const started = performance.now();
      const messages = mindId.includes('Qwen3')
        ? message.messages.map((item, index, all) =>
            index === all.length - 1 ? { ...item, content: `${item.content} /no_think` } : item
          )
        : message.messages;
      stopper.reset();
      const output = await mind(messages, {
        max_new_tokens: 160,
        do_sample: false,
        stopping_criteria: stopper,
      });
      const first = (Array.isArray(output) ? output[0] : output) as { generated_text: unknown };
      const generated = first.generated_text;
      const text = Array.isArray(generated)
        ? String((generated.at(-1) as { content?: string } | undefined)?.content ?? '')
        : String(generated);
      const spoken = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<\/?think>/g, '').trim();
      post({ type: 'thought', id: message.id, text: spoken, ms: performance.now() - started });
    }
  } catch (error) {
    post({
      type: 'error',
      id: 'id' in message ? message.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
