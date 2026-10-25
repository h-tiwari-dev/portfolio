export type Part = 'ears' | 'mind' | 'voice';

export interface ProgressMessage {
  type: 'progress';
  part: Part;
  file: string;
  loaded: number;
  total: number;
}

export type BrainRequest =
  | { type: 'load'; useMind: boolean; mindModel?: string; mindDtype?: string; earsModel?: string }
  | { type: 'transcribe'; id: number; audio: Float32Array }
  | { type: 'think'; id: number; messages: { role: string; content: string }[] }
  | { type: 'abort' };

export type BrainResponse =
  | ProgressMessage
  | { type: 'ready'; mind: boolean; device: string }
  | { type: 'transcript'; id: number; text: string; ms: number }
  | { type: 'thought'; id: number; text: string; ms: number }
  | { type: 'error'; id?: number; message: string };

export const BUTLER_VOICE = 'bm_george';
export const BUTLER_SPEED = 0.94;

export type VoiceRequest =
  | { type: 'load' }
  | { type: 'cancel' }
  | { type: 'speak'; id: number; seq: number; text: string; voice: string; speed: number };

export type VoiceResponse =
  | ProgressMessage
  | { type: 'ready'; device: string }
  | { type: 'audio'; id: number; seq: number; samples: Float32Array; rate: number; ms: number }
  | { type: 'error'; id?: number; seq?: number; message: string };

export const MODELS = {
  ears: 'onnx-community/moonshine-base-ONNX',
  mind: 'onnx-community/Qwen3-0.6B-ONNX',
  voice: 'onnx-community/Kokoro-82M-v1.0-ONNX',
} as const;

export const APPROX_MB = { ears: 82, mind: 652, voice: 326 };
export const APPROX_MB_WASM = { ears: 63, mind: 0, voice: 92 };
