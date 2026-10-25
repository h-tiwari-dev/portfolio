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
  model: {
    generation_config: {
      prev_sot_token_id?: number;
      decoder_start_token_id?: number;
      no_timestamps_token_id?: number;
      is_multilingual?: boolean;
      lang_to_id?: Record<string, number>;
      task_to_id?: Record<string, number>;
    };
  };
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

// Proper nouns the recognizer still smears ("kaso" for Kusho, "carcelor" for
// Castler). This nudges decoding toward them once the start of the name is
// already there, without forcing them into speech that never mentioned them.
const BIAS_WORDS = ['Castler', 'Kusho', 'WellnessLiving', 'Wellness Living'];
const BIAS_VALUE = 4;
// Also nudge the very first token of each name, more gently, so the decoder
// leans toward starting the name rather than only finishing it once started.
const START_BIAS_VALUE = 1.5;

class SequenceBiasLogitsProcessor extends LogitsProcessor {
  private sequences: number[][];
  private startTokens: Set<number>;

  constructor(sequences: number[][]) {
    super();
    this.sequences = sequences;
    this.startTokens = new Set(sequences.map((sequence) => sequence[0]));
  }

  _call(inputIds: bigint[][], logits: Tensor) {
    // The runtime Tensor supports per-row indexing (used the same way inside the
    // library's own NoBadWordsLogitsProcessor), but the public .d.ts only declares
    // Symbol.iterator, so index through an untyped view.
    const rows = logits as unknown as Tensor[];
    for (let i = 0; i < inputIds.length; i += 1) {
      const ids = inputIds[i];
      const data = rows[i].data as Float32Array;
      for (const token of this.startTokens) data[token] += START_BIAS_VALUE;
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

// Whisper has no accent switch. A short prefix is its previous-context prior, so
// the decoder expects Indian English and the names on this page. The prefix is
// stripped back out before the transcript is shown.
const ACCENT_PROMPT = 'Indian English from Bengaluru. WellnessLiving.';
let accentPrefix: number[] | null = null;
let earsMultilingual = false;

function buildAccentPrefix(model: Ears) {
  const config = model.model.generation_config;
  const prev = config.prev_sot_token_id;
  const start = config.decoder_start_token_id;
  if (prev == null || start == null) return null;
  const words = model.tokenizer.encode(ACCENT_PROMPT, { add_special_tokens: false });
  const ids = [prev, ...words, start];
  if (config.is_multilingual) {
    const lang = config.lang_to_id?.['<|en|>'];
    const task = config.task_to_id?.transcribe;
    if (lang == null || task == null) return null;
    ids.push(lang, task);
  }
  if (config.no_timestamps_token_id != null) ids.push(config.no_timestamps_token_id);
  return ids;
}

function stripAccentPrompt(text: string) {
  const pattern = new RegExp(
    `^\\s*${ACCENT_PROMPT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')}[.\\s]*`,
    'i'
  );
  return text
    .replace(pattern, '')
    .replace(/(?:\.{2,}\s*,\s*){2,}/g, '')
    .replace(/,\s*(?:,\s*){2,}/g, '')
    .trim();
}

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

// 8-bit Whisper decodes to garbage on WebGPU, and this model's fp16 encoder is
// 1.2 GB. 4-bit weights are what actually run next to the language model.
const EARS_GPU_DTYPE: Record<string, string> = { encoder_model: 'q4', decoder_model_merged: 'q4' };

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
    const loadEarsModel = (device: 'webgpu' | 'wasm', dtype: string | Record<string, string>) =>
      loadPipeline('automatic-speech-recognition', earsModel, {
        dtype,
        device,
        progress_callback: progress('ears'),
        session_options: QUIET,
      }) as Promise<Ears>;
    try {
      ears = await loadEarsModel(gpu ? 'webgpu' : 'wasm', gpu ? EARS_GPU_DTYPE : 'q8');
    } catch (error) {
      if (!gpu) throw error;
      console.warn('[butler] gpu ears failed, using wasm', error);
      ears = await loadEarsModel('wasm', 'q8');
    }
    biasProcessor = buildBiasProcessor(ears.tokenizer);
    earsMultilingual = Boolean(ears.model.generation_config.is_multilingual);
    accentPrefix = buildAccentPrefix(ears);
    await ears(new Float32Array(16000), accentPrefix ? { decoder_input_ids: accentPrefix } : {});
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
  const rate = 16000;
  let peak = 0;
  for (let i = 0; i < audio.length; i += 1) peak = Math.max(peak, Math.abs(audio[i]));
  const gain = peak > 0.012 && peak < 0.55 ? Math.min(3, 0.85 / peak) : 1;
  const boosted = gain === 1 ? audio : new Float32Array(audio.length);
  if (gain !== 1) {
    for (let i = 0; i < audio.length; i += 1) boosted[i] = Math.max(-1, Math.min(1, audio[i] * gain));
  }
  // Drop the long silent tail. Whisper invents words when the clip ends in quiet.
  const frame = 320;
  const level = Math.max(0.008, peak * gain * 0.08);
  const loud = (from: number) => {
    const to = Math.min(boosted.length, from + frame);
    let sum = 0;
    for (let i = from; i < to; i += 1) sum += boosted[i] * boosted[i];
    return Math.sqrt(sum / Math.max(1, to - from)) > level;
  };
  let start = 0;
  let end = boosted.length;
  for (let i = 0; i < boosted.length; i += frame) {
    if (!loud(i)) continue;
    start = Math.max(0, i - Math.floor(rate * 0.12));
    break;
  }
  for (let i = Math.max(0, boosted.length - frame); i > start; i -= frame) {
    if (!loud(i)) continue;
    end = Math.min(boosted.length, i + frame + Math.floor(rate * 0.2));
    break;
  }
  if (end - start < Math.floor(rate * 0.2)) return boosted;
  const trimmed = new Float32Array(end - start);
  trimmed.set(boosted.subarray(start, end));
  return trimmed;
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
        ...(accentPrefix
          ? { decoder_input_ids: accentPrefix }
          : earsMultilingual
            ? { language: 'english', task: 'transcribe' }
            : {}),
        // Without this a short clip plus the prompt below can make the decoder
        // loop on the prompt's own words instead of moving on to the audio.
        no_repeat_ngram_size: 3,
        max_new_tokens: Math.min(64, Math.max(12, Math.ceil(audio.length / 16000) * 6)),
      });
      const raw = Array.isArray(output) ? output.map((item) => item.text).join(' ') : output.text;
      post({ type: 'transcript', id: message.id, text: stripAccentPrompt(raw), ms: performance.now() - started });
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
