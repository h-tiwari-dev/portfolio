'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import PixelFace from '@/components/voice/PixelFace';
import { initialMemory, reply, type DialogueMemory } from '@/lib/voice/dialogue';
import type { Viseme, VoiceMode } from '@/lib/voice/types';
import { buildTimeline, timeForChar, visemeAt } from '@/lib/voice/visemes';

const RATE = 0.94;
const PITCH = 0.86;

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}

interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}

interface BrowserRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => BrowserRecognition;

interface Playback {
  stop: () => void;
  resync: (charIndex: number) => void;
}

declare global {
  interface Window {
    __pinVoice?: {
      ask: (text: string) => string;
      speak: (text: string) => void;
      animate: (text: string) => void;
      setViseme: (viseme: Viseme) => void;
      state: () => { mode: VoiceMode; viseme: Viseme; caption: string; heard: string };
    };
  }
}

function recognitionCtor() {
  if (typeof window === 'undefined') return null;
  const host = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function voiceScore(voice: SpeechSynthesisVoice) {
  const name = `${voice.name} ${voice.lang}`.toLowerCase();
  let score = 0;
  if (voice.lang.toLowerCase().startsWith('en')) score += 5;
  if (voice.lang.toLowerCase().startsWith('en-gb') || voice.lang.toLowerCase().startsWith('en-us')) {
    score += 1;
  }
  if (/female|samantha|victoria|zira|susan|karen|moira|fiona|google uk english female/.test(name)) {
    score -= 4;
  } else if (/daniel|aaron|alex|rishi|david|fred|google uk english male|male/.test(name)) {
    score += 4;
  }
  if (voice.localService) score += 1;
  return score;
}

function chooseVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null;
}

export default function VoiceStage() {
  const [mode, setMode] = useState<VoiceMode>('idle');
  const [viseme, setViseme] = useState<Viseme>('rest');
  const [caption, setCaption] = useState('Press Talk and ask about WellnessLiving, Kusho, or Castler.');
  const [heard, setHeard] = useState('');
  const [canListen, setCanListen] = useState(true);
  const [ready, setReady] = useState(false);

  const modeRef = useRef(mode);
  const visemeRef = useRef(viseme);
  const captionRef = useRef(caption);
  const heardRef = useRef(heard);
  const memoryRef = useRef<DialogueMemory>(initialMemory());
  const epochRef = useRef(0);
  const playbackRef = useRef<Playback | null>(null);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const userStoppedRef = useRef(false);
  const rafRef = useRef(0);

  modeRef.current = mode;
  visemeRef.current = viseme;
  captionRef.current = caption;
  heardRef.current = heard;

  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const playTimeline = useCallback((text: string, token: number) => {
    const timeline = buildTimeline(text, RATE);
    const startedAt = performance.now();
    let boundaryScheduled = 0;
    let boundaryWall = startedAt;
    let scale = 1;
    let stopped = false;
    let lastSpoken: Viseme = 'rest';

    const finish = () => {
      if (stopped || epochRef.current !== token) return;
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      setViseme('rest');
      setMode('idle');
    };

    const tick = () => {
      if (stopped || epochRef.current !== token) return;
      const timelineMs = boundaryScheduled + (performance.now() - boundaryWall) / Math.max(scale, 0.45);
      if (timelineMs >= timeline.duration) {
        const overdue = timelineMs - timeline.duration;
        const stillSpeaking = window.speechSynthesis.speaking;
        if ((!stillSpeaking && overdue > 500) || overdue > 4000) {
          if (stillSpeaking) window.speechSynthesis.cancel();
          finish();
          return;
        }
        setViseme(lastSpoken);
      } else {
        lastSpoken = visemeAt(timeline, timelineMs);
        setViseme((current) => (current === lastSpoken ? current : lastSpoken));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    playbackRef.current = {
      resync(charIndex: number) {
        const scheduled = timeForChar(timeline, charIndex);
        const actual = performance.now() - startedAt;
        if (scheduled > 80) scale = scale * 0.5 + (actual / scheduled) * 0.5;
        boundaryScheduled = scheduled;
        boundaryWall = performance.now();
      },
      stop() {
        stopped = true;
        cancelAnimationFrame(rafRef.current);
      },
    };
  }, []);

  const speakText = useCallback(
    (text: string) => {
      const token = ++epochRef.current;
      stopPlayback();
      window.speechSynthesis.cancel();
      setCaption(text);
      setMode('speaking');
      setViseme('rest');
      playTimeline(text, token);

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.rate = RATE;
      utterance.pitch = PITCH;
      const voice = chooseVoice();
      if (voice) utterance.voice = voice;
      utterance.onboundary = (event) => {
        if (epochRef.current !== token) return;
        if (event.name === 'word') playbackRef.current?.resync(event.charIndex);
      };
      utterance.onend = () => {
        if (epochRef.current !== token) return;
        stopPlayback();
        setViseme('rest');
        setMode('idle');
      };
      utterance.onerror = () => {
        if (epochRef.current !== token) return;
        stopPlayback();
        setViseme('rest');
        setMode('idle');
      };

      window.speechSynthesis.resume();
      window.setTimeout(() => {
        if (epochRef.current !== token) return;
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [playTimeline, stopPlayback]
  );

  const startListening = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setCanListen(false);
      speakText('I am Harsh. Ask me about WellnessLiving, Kusho, or Castler.');
      return;
    }

    const token = ++epochRef.current;
    userStoppedRef.current = false;
    stopPlayback();
    window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setViseme('rest');
    setHeard('');
    setMode('listening');
    setCaption('Listening.');

    const recognition = new Ctor();
    recognition.lang = navigator.language?.toLowerCase().startsWith('en') ? navigator.language : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalText = '';
    let error = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? '';
        if (event.results[index].isFinal) finalText = `${finalText} ${transcript}`.trim();
        else interim = `${interim} ${transcript}`.trim();
      }
      setHeard((finalText || interim).trim());
    };

    recognition.onerror = (event) => {
      error = event.error;
    };

    recognition.onend = () => {
      if (epochRef.current !== token) return;
      const text = finalText.trim();
      if (text) {
        setHeard(text);
        const result = reply(text, memoryRef.current);
        memoryRef.current = result.memory;
        setMode('speaking');
        window.setTimeout(() => {
          if (epochRef.current !== token) return;
          speakText(result.text);
        }, 180);
        return;
      }

      if (error === 'not-allowed' || error === 'service-not-allowed') {
        setMode('idle');
        setCaption('The microphone is blocked. Allow it for this site, then press Talk again.');
        return;
      }
      if (error === 'audio-capture') {
        setMode('idle');
        setCaption('No microphone was found.');
        return;
      }
      if (error === 'network') {
        setMode('idle');
        setCaption('This browser needs a network connection to hear you. Try again in a moment.');
        return;
      }
      if (error === 'aborted' || userStoppedRef.current) {
        setMode('idle');
        setViseme('rest');
        setCaption('Press Talk and ask about WellnessLiving, Kusho, or Castler.');
        return;
      }

      setMode('speaking');
      window.setTimeout(() => {
        if (epochRef.current !== token) return;
        speakText('I did not catch that. Ask me about WellnessLiving, Kusho, or Castler.');
      }, 120);
    };

    try {
      recognition.start();
    } catch {
      setMode('idle');
      setCaption('The microphone did not start. Press Talk again.');
    }
  }, [speakText, stopPlayback]);

  const press = useCallback(() => {
    if (!recognitionCtor()) {
      speakText('I am Harsh. I can talk through the work. WellnessLiving, Kusho, or Castler.');
      return;
    }
    if (modeRef.current === 'listening') {
      userStoppedRef.current = true;
      recognitionRef.current?.stop();
      return;
    }
    startListening();
  }, [speakText, startListening]);

  useEffect(() => {
    setCanListen(Boolean(recognitionCtor()));
    setReady(true);
    const synth = window.speechSynthesis;
    const warm = () => chooseVoice();
    synth.addEventListener('voiceschanged', warm);
    warm();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'A') return;
      event.preventDefault();
      press();
    };
    window.addEventListener('keydown', onKeyDown);

    window.__pinVoice = {
      ask(text: string) {
        const result = reply(text, memoryRef.current);
        memoryRef.current = result.memory;
        setHeard(text);
        setCaption(result.text);
        return result.text;
      },
      speak(text: string) {
        speakText(text);
      },
      animate(text: string) {
        const token = ++epochRef.current;
        stopPlayback();
        window.speechSynthesis.cancel();
        setCaption(text);
        setMode('speaking');
        const timeline = buildTimeline(text, RATE);
        const startedAt = performance.now();
        const tick = () => {
          if (epochRef.current !== token) return;
          const elapsed = performance.now() - startedAt;
          if (elapsed > timeline.duration) {
            setViseme('rest');
            setMode('idle');
            return;
          }
          const next = visemeAt(timeline, elapsed);
          setViseme((current) => (current === next ? current : next));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      },
      setViseme(next: Viseme) {
        epochRef.current += 1;
        stopPlayback();
        window.speechSynthesis.cancel();
        recognitionRef.current?.abort();
        setMode('idle');
        setViseme(next);
      },
      state() {
        return {
          mode: modeRef.current,
          viseme: visemeRef.current,
          caption: captionRef.current,
          heard: heardRef.current,
        };
      },
    };

    return () => {
      epochRef.current += 1;
      stopPlayback();
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
      synth.removeEventListener('voiceschanged', warm);
      window.removeEventListener('keydown', onKeyDown);
      delete window.__pinVoice;
    };
  }, [press, speakText, stopPlayback]);

  const status = mode === 'listening' ? 'Listening' : mode === 'speaking' ? 'Speaking' : 'Standby';
  const statusClass =
    mode === 'listening'
      ? 'border-rose-800 bg-rose-950/80 text-rose-200'
      : mode === 'speaking'
        ? 'border-cyan-800 bg-cyan-950/70 text-cyan-100'
        : 'border-neutral-800 bg-neutral-950/80 text-slate-400';

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-5 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-rose-300">PID_VOICE</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Work, spoken
            </div>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-x-0 inset-y-3 mx-auto w-full max-w-[560px]">
            <PixelFace viseme={viseme} mode={mode} />
          </div>
        </div>

        <footer className="mx-auto w-full max-w-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center">
          <div className="mb-3 flex justify-center">
            <span className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${statusClass}`}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  mode === 'idle' ? 'bg-slate-500' : mode === 'listening' ? 'bg-rose-400' : 'bg-cyan-300'
                }`}
              />
              {status}
            </span>
          </div>

          {heard ? (
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Heard · {heard}
            </p>
          ) : null}
          <p aria-live="polite" className="mx-auto max-h-[18dvh] min-h-[3rem] max-w-xl overflow-y-auto text-sm leading-relaxed text-slate-200">
            {caption}
          </p>

          <button
            type="button"
            onClick={press}
            aria-pressed={mode === 'listening'}
            className="button-3d button-3d--rose mx-auto mt-4 inline-flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium"
          >
            <span className="button-3d__icon">
              <Mic size={17} />
            </span>
            <span className="button-3d__label">
              {!ready ? 'Talk' : !canListen ? 'Hear the brief' : mode === 'listening' ? 'Stop' : mode === 'speaking' ? 'Interrupt' : 'Talk'}
            </span>
          </button>

          <p className="mt-3 font-mono text-[10px] tracking-[0.08em] text-slate-600">
            {canListen
              ? 'Space to talk. Listening uses the browser speech service.'
              : 'This browser can speak, but it cannot hear. Chrome or Edge can hold the conversation.'}
          </p>
        </footer>
      </div>
    </div>
  );
}
