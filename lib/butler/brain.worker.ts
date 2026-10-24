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

async function hasLocalMind() {
  try {
    const [config, weights] = await Promise.all([
      fetch('/models/butler-resume/config.json', { method: 'HEAD' }),
      fetch('/models/butler-resume/onnx/model_q4f16.onnx', { method: 'HEAD' }),
    ]);
    return config.ok && weights.ok;
  } catch {
    return false;
  }
}

async function load(useMind: boolean, mindModel?: string, mindDtype = 'q4f16', earsModel: string = MODELS.ears) {
  const gpu = await hasWebGpu();
  const localMind = !mindModel && (await hasLocalMind());
  const mindToLoad = mindModel ?? (localMind ? 'butler-resume' : MODELS.mind);
  if (localMind) env.allowLocalModels = true;
  const loadEars = (async () => {
    if (ears) return;
    ears = (await loadPipeline('automatic-speech-recognition', earsModel, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: progress('ears'),
      session_options: QUIET,
    })) as Ears;
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

async function handle(message: Exclude<BrainRequest, { type: 'abort' }>) {
  try {
    if (message.type === 'load') {
      await load(message.useMind, message.mindModel, message.mindDtype, message.earsModel);
      return;
    }
    if (message.type === 'transcribe') {
      if (!ears) throw new Error('Speech recognition is not loaded.');
      const started = performance.now();
      const output = await ears(message.audio, biasProcessor ? { logits_processor: biasProcessor } : undefined);
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
