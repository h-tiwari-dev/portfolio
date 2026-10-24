/// <reference lib="webworker" />
import { AutoTokenizer, StyleTextToSpeech2Model, env } from '@huggingface/transformers';
import { KokoroTTS } from 'kokoro-js';
import { BUTLER_SPEED, BUTLER_VOICE, MODELS, type VoiceRequest, type VoiceResponse } from './protocol';

env.allowLocalModels = false;
if (env.backends.onnx) env.backends.onnx.logLevel = 'error';

const scope = self as unknown as DedicatedWorkerGlobalScope;
let tts: KokoroTTS | null = null;
const queue: Extract<VoiceRequest, { type: 'speak' }>[] = [];
let busy = false;
let current = -1;

async function hasWebGpu() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

function post(message: VoiceResponse, transfer: Transferable[] = []) {
  scope.postMessage(message, transfer);
}

function wanted(id: number) {
  return id < 0 || id === current;
}

async function drain() {
  if (busy || !tts) return;
  busy = true;
  while (queue.length) {
    const job = queue.shift()!;
    if (!wanted(job.id)) continue;
    try {
      const started = performance.now();
      const audio = await tts.generate(job.text, {
        voice: job.voice as typeof BUTLER_VOICE,
        speed: job.speed,
      });
      if (!wanted(job.id)) continue;
      const samples = audio.audio as Float32Array;
      post(
        { type: 'audio', id: job.id, seq: job.seq, samples, rate: audio.sampling_rate, ms: performance.now() - started },
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
    if (tts) {
      post({ type: 'ready', device: 'cached' });
      return;
    }
    try {
      const gpu = await hasWebGpu();
      const progress_callback = (progress: { status: string; file?: string; loaded?: number; total?: number }) => {
        if (progress.status === 'progress' && progress.file) {
          post({ type: 'progress', part: 'voice', file: progress.file, loaded: progress.loaded ?? 0, total: progress.total ?? 0 });
        }
      };
      const [model, tokenizer] = await Promise.all([
        StyleTextToSpeech2Model.from_pretrained(MODELS.voice, {
          dtype: gpu ? 'fp32' : 'q8',
          device: gpu ? 'webgpu' : 'wasm',
          progress_callback,
          session_options: { logSeverityLevel: 3 },
        }),
        AutoTokenizer.from_pretrained(MODELS.voice, { progress_callback }),
      ]);
      tts = new KokoroTTS(model, tokenizer);
      await tts.generate('Ready.', { voice: BUTLER_VOICE, speed: BUTLER_SPEED });
      post({ type: 'ready', device: gpu ? 'webgpu' : 'wasm' });
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
