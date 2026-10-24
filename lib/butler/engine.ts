import { initialMemory, type DialogueMemory } from '@/lib/voice/dialogue';
import {
  MISHEARD,
  NO_EARS,
  NO_MIC,
  acceptAnswer,
  buildMessages,
  cleanTranscript,
  greeting,
  novelWords,
  planReply,
  retell,
  splitSentences,
} from './persona';
import {
  APPROX_MB,
  APPROX_MB_WASM,
  BUTLER_SPEED,
  BUTLER_VOICE,
  type BrainRequest,
  type BrainResponse,
  type Part,
  type VoiceRequest,
  type VoiceResponse,
} from './protocol';
import { butlerSignal } from './signal';

export type Phase = 'off' | 'loading' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface ButlerState {
  open: boolean;
  phase: Phase;
  progress: Record<Part, number>;
  heard: string;
  said: string;
  note: string;
  mind: boolean;
  grounded: boolean | null;
  timings: { hear?: number; think?: number; voice: number[] };
  raw: string;
}

const SAMPLE_RATE = 16000;
const SILENCE_END_MS = 900;
const NO_SPEECH_MS = 7000;
const MAX_UTTERANCE_MS = 12000;
const LOAD_STALL_MS = 90000;
const TIMEOUT_MS = { transcribe: 20000, think: 30000 };
const LOAD_FAILED = 'The models did not load. Please try again.';

const TAP_SOURCE = `
class ButlerTap extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(2048);
    this.filled = 0;
    this.alive = true;
    this.port.onmessage = () => { this.alive = false; };
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i += 1) {
        this.buffer[this.filled++] = channel[i];
        if (this.filled === this.buffer.length) {
          this.port.postMessage(this.buffer.slice(0));
          this.filled = 0;
        }
      }
    }
    return this.alive;
  }
}
registerProcessor('butler-tap', ButlerTap);
`;

type Listener = () => void;

function resample(input: Float32Array, from: number) {
  if (from === SAMPLE_RATE) return input;
  const ratio = from / SAMPLE_RATE;
  const length = Math.floor(input.length / ratio);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const at = i * ratio;
    const left = Math.floor(at);
    const right = Math.min(left + 1, input.length - 1);
    const t = at - left;
    output[i] = input[left] * (1 - t) + input[right] * t;
  }
  return output;
}

function rms(buffer: Float32Array) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

function unit(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

class ButlerEngine {
  private state: ButlerState = {
    open: false,
    phase: 'off',
    progress: { ears: 0, mind: 0, voice: 0 },
    heard: '',
    said: '',
    note: '',
    mind: false,
    grounded: null,
    timings: { voice: [] },
    raw: '',
  };
  private listeners = new Set<Listener>();
  private brain: Worker | null = null;
  private voice: Worker | null = null;
  private ctx: AudioContext | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micTap: AudioWorkletNode | null = null;
  private micNodes: AudioNode[] = [];
  private tapLoaded: Promise<void> | null = null;
  private capture: { finish: (cancelled: boolean) => void } | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private bytes: Record<Part, Map<string, { loaded: number; total: number }>> = {
    ears: new Map(),
    mind: new Map(),
    voice: new Map(),
  };
  private epoch = 0;
  private requestId = 0;
  private pending = new Map<number, (message: BrainResponse) => void>();
  private voiceProbes = new Map<number, (message: VoiceResponse) => void>();
  private memory: DialogueMemory = initialMemory();
  private playback: {
    id: number;
    total: number;
    next: number;
    ready: Map<number, Float32Array | null>;
    rate: number;
    endsAt: number;
    playing: number;
    done: () => void;
  } | null = null;
  private raf = 0;
  private brainReady = false;
  private voiceReady = false;
  private greetPending = false;
  private stallTimer = 0;
  private approx: Record<Part, number> = APPROX_MB;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  private set(patch: Partial<ButlerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  open() {
    this.set({ open: true });
    if (this.state.phase === 'off' || this.state.phase === 'error') return;
    void this.ctx?.resume();
    this.startMeters();
    if (this.greetPending && this.state.phase === 'ready') {
      this.greetPending = false;
      void this.speak(greeting());
    }
  }

  close() {
    this.interrupt();
    this.releaseMic();
    this.stopMeters();
    if (this.state.phase !== 'loading') void this.ctx?.suspend();
    this.set({ open: false });
  }

  load() {
    if (this.state.phase !== 'off' && this.state.phase !== 'error') return;
    // Match the engine's sample rate exactly, so mic capture rides the browser's
    // own high-quality resampler instead of the naive linear interpolation in
    // resample() below, which aliased badly on real microphone input.
    this.ctx ??= new AudioContext({ sampleRate: SAMPLE_RATE });
    void this.ctx.resume();
    if (!this.outAnalyser) {
      this.outAnalyser = this.ctx.createAnalyser();
      this.outAnalyser.fftSize = 1024;
      this.outAnalyser.connect(this.ctx.destination);
    }
    this.bytes = { ears: new Map(), mind: new Map(), voice: new Map() };
    this.approx = 'gpu' in navigator ? APPROX_MB : APPROX_MB_WASM;
    this.set({ phase: 'loading', said: '', progress: { ears: 0, mind: 0, voice: 0 } });
    this.startMeters();
    this.touchLoad();

    if (!this.brain) {
      this.brain = new Worker(new URL('./brain.worker.ts', import.meta.url), { type: 'module' });
      this.brain.onmessage = (event: MessageEvent<BrainResponse>) => this.onBrain(event.data);
      this.brain.onerror = (event) => this.fail(event.message || 'The brain worker failed to start.');
      this.brain.onmessageerror = () => this.fail('The brain worker sent an unreadable message.');
    }
    if (!this.voice) {
      this.voice = new Worker(new URL('./voice.worker.ts', import.meta.url), { type: 'module' });
      this.voice.onmessage = (event: MessageEvent<VoiceResponse>) => this.onVoice(event.data);
      this.voice.onerror = (event) => this.fail(event.message || 'The voice worker failed to start.');
      this.voice.onmessageerror = () => this.fail('The voice worker sent an unreadable message.');
    }
    const override =
      process.env.NODE_ENV === 'development' ? window.localStorage.getItem('butler:mind')?.split('|') : undefined;
    if (!this.brainReady) {
      this.brain.postMessage({
        type: 'load',
        useMind: true,
        mindModel: override?.[0],
        mindDtype: override?.[1],
        earsModel:
          process.env.NODE_ENV === 'development' ? window.localStorage.getItem('butler:ears') ?? undefined : undefined,
      } satisfies BrainRequest);
    }
    if (!this.voiceReady) this.voice.postMessage({ type: 'load' } satisfies VoiceRequest);
  }

  private touchLoad() {
    window.clearTimeout(this.stallTimer);
    if (this.state.phase !== 'loading') return;
    this.stallTimer = window.setTimeout(() => this.fail('Model loading stalled.'), LOAD_STALL_MS);
  }

  private fail(reason: string) {
    console.error(`[butler] ${reason}`);
    window.clearTimeout(this.stallTimer);
    this.interrupt();
    this.releaseMic();
    this.pending.forEach((resolve) => resolve({ type: 'error', message: reason }));
    this.pending.clear();
    this.brain?.terminate();
    this.voice?.terminate();
    this.brain = null;
    this.voice = null;
    this.brainReady = false;
    this.voiceReady = false;
    this.greetPending = false;
    this.set({ phase: 'error', said: LOAD_FAILED });
  }

  private onProgress(part: Part, file: string, loaded: number, total: number) {
    this.touchLoad();
    this.bytes[part].set(file, { loaded, total });
    let sumLoaded = 0;
    let sumTotal = 0;
    this.bytes[part].forEach((entry) => {
      sumLoaded += entry.loaded;
      sumTotal += entry.total;
    });
    const denominator = Math.max(sumTotal, this.approx[part] * 1e6, 1);
    const value = Math.min(0.99, sumLoaded / denominator);
    if (value > this.state.progress[part]) {
      this.set({ progress: { ...this.state.progress, [part]: value } });
    }
  }

  private checkReady() {
    if (!this.brainReady || !this.voiceReady || this.state.phase !== 'loading') return;
    window.clearTimeout(this.stallTimer);
    this.set({ phase: 'ready' });
    if (this.state.open) {
      void this.speak(greeting());
    } else {
      this.greetPending = true;
      this.stopMeters();
      void this.ctx?.suspend();
    }
  }

  private onBrain(message: BrainResponse) {
    if (message.type === 'progress') return this.onProgress(message.part, message.file, message.loaded, message.total);
    if (message.type === 'ready') {
      this.brainReady = true;
      this.touchLoad();
      this.set({
        mind: message.mind,
        progress: { ...this.state.progress, ears: 1, mind: message.mind ? 1 : 0 },
      });
      return this.checkReady();
    }
    if ('id' in message && message.id !== undefined && this.pending.has(message.id)) {
      const resolve = this.pending.get(message.id)!;
      this.pending.delete(message.id);
      resolve(message);
      return;
    }
    if (message.type === 'error') {
      if (this.state.phase === 'loading') return this.fail(message.message);
      console.warn(`[butler] brain: ${message.message}`);
    }
  }

  private onVoice(message: VoiceResponse) {
    if (message.type === 'progress') return this.onProgress(message.part, message.file, message.loaded, message.total);
    if (message.type === 'ready') {
      this.voiceReady = true;
      this.touchLoad();
      this.set({ progress: { ...this.state.progress, voice: 1 } });
      return this.checkReady();
    }
    if (message.type === 'error' && message.id === undefined) {
      if (this.state.phase === 'loading') return this.fail(message.message);
      console.warn(`[butler] voice: ${message.message}`);
      return;
    }
    if (message.id !== undefined && this.voiceProbes.has(message.id)) {
      const resolve = this.voiceProbes.get(message.id)!;
      this.voiceProbes.delete(message.id);
      resolve(message);
      return;
    }
    if (message.type === 'error') console.warn(`[butler] voice: ${message.message}`);
    const playback = this.playback;
    if (!playback || message.id !== playback.id || message.seq === undefined) return;
    if (message.type === 'audio') {
      this.set({ timings: { ...this.state.timings, voice: [...this.state.timings.voice, Math.round(message.ms)] } });
      playback.rate = message.rate;
      playback.ready.set(message.seq, message.samples);
    } else {
      playback.ready.set(message.seq, null);
    }
    this.pump();
  }

  private brainCall(request: Extract<BrainRequest, { id: number }>) {
    return new Promise<BrainResponse>((resolve) => {
      const timer = window.setTimeout(() => {
        if (!this.pending.delete(request.id)) return;
        if (request.type === 'think') this.brain?.postMessage({ type: 'abort' } satisfies BrainRequest);
        resolve({ type: 'error', id: request.id, message: `${request.type} timed out` });
      }, TIMEOUT_MS[request.type]);
      this.pending.set(request.id, (message) => {
        window.clearTimeout(timer);
        resolve(message);
      });
      if (!this.brain) {
        this.pending.delete(request.id);
        window.clearTimeout(timer);
        resolve({ type: 'error', id: request.id, message: 'The brain is not running.' });
        return;
      }
      const transfer = request.type === 'transcribe' ? [request.audio.buffer] : [];
      this.brain.postMessage(request, transfer);
    });
  }

  private pump() {
    const playback = this.playback;
    const ctx = this.ctx;
    if (!playback || !ctx || !this.outAnalyser) return;
    while (playback.ready.has(playback.next)) {
      const samples = playback.ready.get(playback.next)!;
      playback.ready.delete(playback.next);
      playback.next += 1;
      if (!samples || samples.length === 0) continue;
      const buffer = ctx.createBuffer(1, samples.length, playback.rate);
      buffer.getChannelData(0).set(samples);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outAnalyser);
      const startAt = Math.max(ctx.currentTime + 0.03, playback.endsAt + 0.12);
      source.start(startAt);
      playback.endsAt = startAt + buffer.duration;
      playback.playing += 1;
      this.sources.add(source);
      source.onended = () => {
        this.sources.delete(source);
        playback.playing -= 1;
        this.finishIfDone(playback);
      };
    }
    this.finishIfDone(playback);
  }

  private finishIfDone(playback: NonNullable<ButlerEngine['playback']>) {
    if (this.playback !== playback) return;
    if (playback.next >= playback.total && playback.playing === 0) {
      this.playback = null;
      playback.done();
    }
  }

  private speak(text: string) {
    const ctx = this.ctx;
    const voice = this.voice;
    if (!ctx || !voice) return Promise.resolve();
    void ctx.resume();
    const id = ++this.epoch;
    const sentences = splitSentences(text);
    this.set({ phase: 'speaking', said: text });
    return new Promise<void>((resolve) => {
      this.playback = {
        id,
        total: sentences.length,
        next: 0,
        ready: new Map(),
        rate: 24000,
        endsAt: 0,
        playing: 0,
        done: () => {
          if (this.epoch === id) this.set({ phase: 'ready' });
          resolve();
        },
      };
      sentences.forEach((sentence, seq) => {
        voice.postMessage({
          type: 'speak',
          id,
          seq,
          text: sentence,
          voice: BUTLER_VOICE,
          speed: BUTLER_SPEED,
        } satisfies VoiceRequest);
      });
    });
  }

  private stopAudio() {
    this.voice?.postMessage({ type: 'cancel' } satisfies VoiceRequest);
    this.sources.forEach((source) => {
      source.onended = null;
      try {
        source.stop();
      } catch {}
    });
    this.sources.clear();
    const playback = this.playback;
    this.playback = null;
    playback?.done();
  }

  interrupt() {
    this.epoch += 1;
    if (this.state.phase === 'thinking') this.brain?.postMessage({ type: 'abort' } satisfies BrainRequest);
    this.stopAudio();
    this.capture?.finish(true);
    if (this.state.phase !== 'off' && this.state.phase !== 'loading' && this.state.phase !== 'error') {
      this.set({ phase: 'ready' });
    }
  }

  async talk() {
    const phase = this.state.phase;
    if (phase === 'off' || phase === 'loading' || phase === 'error') return;
    if (phase === 'listening') {
      this.capture?.finish(false);
      return;
    }
    if (phase === 'speaking' || phase === 'thinking') {
      this.interrupt();
      return;
    }
    this.interrupt();
    const id = this.epoch;
    const audio = await this.listen(id);
    if (this.epoch !== id) return;
    if (audio === 'no-mic' || audio === 'no-ears') {
      await this.speak(audio === 'no-mic' ? NO_MIC : NO_EARS);
      return;
    }
    if (!audio) {
      this.set({ phase: 'ready', heard: '' });
      return;
    }
    this.set({ phase: 'thinking', heard: '…' });
    const transcript = await this.brainCall({ type: 'transcribe', id: ++this.requestId, audio });
    if (this.epoch !== id) return;
    const text = transcript.type === 'transcript' ? cleanTranscript(transcript.text) : '';
    if (transcript.type === 'transcript') this.set({ timings: { voice: [], hear: Math.round(transcript.ms) } });
    if (!text) {
      this.set({ heard: '' });
      await this.speak(MISHEARD);
      return;
    }
    await this.answer(text, id);
  }

  async ask(text: string) {
    if (this.state.phase === 'off' || this.state.phase === 'loading' || this.state.phase === 'error') return '';
    this.interrupt();
    const id = this.epoch;
    return this.answer(text, id);
  }

  async debugSynth(text: string, voice = 'af_heart') {
    const id = -(++this.requestId);
    return new Promise<VoiceResponse>((resolve) => {
      this.voiceProbes.set(id, resolve);
      this.voice?.postMessage({ type: 'speak', id, seq: 0, text, voice, speed: 1 } satisfies VoiceRequest);
    });
  }

  async debugHear(text: string, voice = 'af_heart') {
    const audio = await this.debugSynth(text, voice);
    if (audio.type !== 'audio') return { error: audio.type === 'error' ? audio.message : 'no audio' };
    const samples = resample(audio.samples, audio.rate);
    const seconds = samples.length / SAMPLE_RATE;
    const heard = await this.brainCall({ type: 'transcribe', id: ++this.requestId, audio: samples });
    return heard.type === 'transcript'
      ? { said: text, heard: heard.text, cleaned: cleanTranscript(heard.text), ms: Math.round(heard.ms), seconds }
      : { error: heard.type === 'error' ? heard.message : 'no transcript' };
  }

  async debugThink(question: string) {
    const plan = planReply(question, initialMemory());
    if (plan.kind === 'say') return { fixed: plan.text };
    const thought = await this.brainCall({
      type: 'think',
      id: ++this.requestId,
      messages: buildMessages(question, plan.note),
    });
    const raw = thought.type === 'thought' ? thought.text : `error: ${thought.type === 'error' ? thought.message : ''}`;
    return {
      note: plan.note,
      raw,
      ms: thought.type === 'thought' ? Math.round(thought.ms) : 0,
      accepted: acceptAnswer(raw, plan.note, question),
      novel: novelWords(raw, plan.note, question),
    };
  }

  private async answer(question: string, id: number) {
    this.set({ heard: question, phase: 'thinking', raw: '', timings: { ...this.state.timings, think: undefined, voice: [] } });
    const plan = planReply(question, this.memory);
    this.memory = plan.memory;
    let text: string;
    let grounded: boolean | null = null;
    if (plan.kind === 'say') {
      text = plan.text;
      this.set({ note: '' });
    } else if (this.state.mind) {
      this.set({ note: plan.note });
      const thought = await this.brainCall({
        type: 'think',
        id: ++this.requestId,
        messages: buildMessages(question, plan.note),
      });
      if (this.epoch !== id) return '';
      if (thought.type === 'thought') {
        this.set({ raw: thought.text, timings: { ...this.state.timings, think: Math.round(thought.ms) } });
      } else if (thought.type === 'error') {
        console.warn(`[butler] think: ${thought.message}`);
      }
      const accepted =
        thought.type === 'thought' ? acceptAnswer(thought.text, plan.note, question) : { text: retell(plan.note), grounded: false };
      text = accepted.text;
      grounded = accepted.grounded;
    } else {
      this.set({ note: plan.note });
      text = retell(plan.note);
    }
    if (this.epoch !== id) return '';
    this.set({ grounded });
    void this.speak(text);
    return text;
  }

  private async ensureMic() {
    if (this.micStream && this.micStream.active) return true;
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      return true;
    } catch {
      return false;
    }
  }

  private releaseMic() {
    if (this.micTap) {
      this.micTap.port.onmessage = null;
      this.micTap.port.postMessage('stop');
      this.micTap = null;
    }
    this.micNodes.forEach((node) => node.disconnect());
    this.micNodes = [];
    this.micAnalyser = null;
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
  }

  private loadTap(ctx: AudioContext) {
    if (!this.tapLoaded) {
      const url = URL.createObjectURL(new Blob([TAP_SOURCE], { type: 'application/javascript' }));
      this.tapLoaded = ctx.audioWorklet.addModule(url).finally(() => URL.revokeObjectURL(url));
      this.tapLoaded.catch(() => {
        this.tapLoaded = null;
      });
    }
    return this.tapLoaded;
  }

  private async listen(id: number): Promise<Float32Array | null | 'no-mic' | 'no-ears'> {
    const ctx = this.ctx;
    if (!ctx) return null;
    await ctx.resume();
    const [, granted] = await Promise.all([this.loadTap(ctx).catch(() => undefined), this.ensureMic()]);
    if (!granted || !this.tapLoaded) {
      this.releaseMic();
      return granted ? 'no-ears' : 'no-mic';
    }
    if (this.epoch !== id) {
      this.releaseMic();
      return null;
    }

    const source = ctx.createMediaStreamSource(this.micStream!);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    const tap = new AudioWorkletNode(ctx, 'butler-tap', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1 });
    const mute = ctx.createGain();
    mute.gain.value = 0;
    source.connect(analyser);
    source.connect(tap);
    tap.connect(mute);
    mute.connect(ctx.destination);
    this.micAnalyser = analyser;
    this.micTap = tap;
    this.micNodes = [source, analyser, tap, mute];

    this.set({ phase: 'listening', heard: '' });
    return new Promise((resolve) => {
      const started = performance.now();
      let floor = 0.004;
      let speaking = false;
      let aboveSince = 0;
      let lastVoice = 0;
      let done = false;
      const chunks: Float32Array[] = [];
      const finish = (cancelled: boolean) => {
        if (done) return;
        done = true;
        if (this.capture === capture) this.capture = null;
        this.releaseMic();
        if (cancelled || !speaking) return resolve(null);
        const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const joined = new Float32Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          joined.set(chunk, offset);
          offset += chunk.length;
        }
        resolve(resample(joined, ctx.sampleRate));
      };
      const capture = { finish };
      this.capture = capture;
      tap.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (done) return;
        const chunk = event.data;
        chunks.push(chunk);
        const now = performance.now();
        const level = rms(chunk);
        if (!speaking && now - started < 400) floor = floor * 0.8 + level * 0.2;
        const threshold = Math.max(0.012, floor * 3);
        if (level > threshold) {
          if (!speaking) {
            // Require the level to stay up for a beat before committing, so a
            // single click or pop (common on Bluetooth mics) doesn't start an
            // utterance by itself.
            if (!aboveSince) aboveSince = now;
            if (now - aboveSince >= 120) {
              speaking = true;
              chunks.splice(0, Math.max(0, chunks.length - 4));
            }
          }
          lastVoice = now;
        } else if (!speaking) {
          aboveSince = 0;
        }
        if (!speaking && now - started > NO_SPEECH_MS) finish(false);
        else if (speaking && now - lastVoice > SILENCE_END_MS) finish(false);
        else if (now - started > MAX_UTTERANCE_MS) finish(false);
      };
    });
  }

  private startMeters() {
    if (this.raf) return;
    const out = new Float32Array(1024);
    const mic = new Float32Array(1024);
    const tick = () => {
      const phase = this.state.phase;
      let speak = 0;
      let listen = 0;
      if (this.outAnalyser && phase === 'speaking') {
        this.outAnalyser.getFloatTimeDomainData(out);
        speak = 1 - Math.exp(-rms(out) * 10);
      }
      if (this.micAnalyser && phase === 'listening') {
        this.micAnalyser.getFloatTimeDomainData(mic);
        listen = 1 - Math.exp(-rms(mic) * 14);
      }
      butlerSignal.speak = unit(speak);
      butlerSignal.listen = phase === 'listening' ? Math.max(0.3, unit(listen)) : 0;
      butlerSignal.think = phase === 'thinking' || phase === 'loading' ? 1 : 0;
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stopMeters() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    butlerSignal.speak = 0;
    butlerSignal.listen = 0;
    butlerSignal.think = 0;
  }
}

export const butler = new ButlerEngine();

declare global {
  interface Window {
    __butler?: {
      ask: (text: string) => Promise<string>;
      think: (text: string) => Promise<unknown>;
      hear: (text: string, voice?: string) => Promise<unknown>;
      synth: (text: string, voice?: string) => Promise<{ samples: Float32Array; rate: number } | null>;
      talk: () => Promise<void>;
      state: () => ButlerState;
      signal: typeof butlerSignal;
    };
  }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__butler = {
    ask: (text) => butler.ask(text),
    think: (text) => butler.debugThink(text),
    hear: (text, voice) => butler.debugHear(text, voice),
    synth: async (text, voice) => {
      const audio = await butler.debugSynth(text, voice);
      return audio.type === 'audio' ? { samples: audio.samples, rate: audio.rate } : null;
    },
    talk: () => butler.talk(),
    state: () => butler.getSnapshot(),
    signal: butlerSignal,
  };
}
