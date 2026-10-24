'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic, Square, X } from 'lucide-react';
import { butler, type Phase } from '@/lib/butler/engine';
import { APPROX_MB } from '@/lib/butler/protocol';

const PARTS = [
  { id: 'ears', label: 'Ears' },
  { id: 'mind', label: 'Mind' },
  { id: 'voice', label: 'Voice' },
] as const;

const STATUS: Record<Phase, string> = {
  off: 'Not yet summoned',
  loading: 'On his way',
  ready: 'At your service',
  listening: 'Listening',
  thinking: 'Considering',
  speaking: 'Speaking',
  error: 'Indisposed',
};

const HINT: Record<'Talk' | 'Done' | 'Stop', string> = {
  Talk: 'Tap to speak',
  Done: 'Tap when you are done',
  Stop: 'Tap to interrupt',
};

const TOTAL_MB = APPROX_MB.ears + APPROX_MB.mind + APPROX_MB.voice;

export default function ButlerDock({ onOpen }: { onOpen?: () => void }) {
  const state = useSyncExternalStore(butler.subscribe, butler.getSnapshot, butler.getSnapshot);
  const reduceMotion = useReducedMotion();
  const dockRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { open, phase, progress, heard, said, mind } = state;

  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  useEffect(() => {
    if (!open) {
      returnFocus.current?.focus({ preventScroll: true });
      returnFocus.current = null;
      return;
    }
    onOpenRef.current?.();
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    const frame = requestAnimationFrame(() => primaryRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    (primaryRef.current ?? dockRef.current)?.focus({ preventScroll: true });
  }, [open, phase]);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const stop = (event: Event) => event.stopPropagation();
    dock.addEventListener('wheel', stop);
    dock.addEventListener('touchstart', stop);
    dock.addEventListener('touchend', stop);
    return () => {
      dock.removeEventListener('wheel', stop);
      dock.removeEventListener('touchstart', stop);
      dock.removeEventListener('touchend', stop);
    };
  }, [open]);

  const loaded = phase !== 'off' && phase !== 'loading' && phase !== 'error';
  const busy = phase === 'speaking' || phase === 'thinking';
  const mindSkipped = !mind && progress.ears === 1;
  const talkLabel = phase === 'listening' ? 'Done' : busy ? 'Stop' : 'Talk';
  const overall =
    (progress.ears * APPROX_MB.ears + (mindSkipped ? 0 : progress.mind * APPROX_MB.mind) + progress.voice * APPROX_MB.voice) /
    (APPROX_MB.ears + (mindSkipped ? 0 : APPROX_MB.mind) + APPROX_MB.voice);
  const fade = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 };
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dockRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="false"
          aria-labelledby="butler-title"
          aria-describedby="butler-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.4, delay: reduceMotion ? 0 : 0.15 }}
          onKeyDown={(event: React.KeyboardEvent) => {
            event.stopPropagation();
            if (event.key === 'Escape') butler.close();
          }}
          className="pointer-events-none fixed inset-0 z-[60] flex flex-col justify-between outline-none"
        >
          <header className="pointer-events-auto flex items-start justify-between gap-4 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] md:px-10 md:pt-8">
            <div>
              <h2 id="butler-title" className="font-butler text-2xl italic text-[#f3e9d6]">
                The butler
              </h2>
              <p id="butler-status" role="status" className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${
                    phase === 'listening'
                      ? 'bg-cyan-300'
                      : phase === 'speaking'
                        ? 'bg-amber-200'
                        : phase === 'thinking' || phase === 'loading'
                          ? 'bg-rose-400 motion-safe:animate-pulse'
                          : phase === 'ready'
                            ? 'bg-[#f3e9d6]/70'
                            : 'bg-slate-600'
                  }`}
                />
                {STATUS[phase]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => butler.close()}
              className="group flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3e9d6]"
            >
              Back to the page
              <kbd className="hidden font-sans text-[10px] text-slate-500 group-hover:text-slate-400 md:inline">Esc</kbd>
              <X size={14} aria-hidden="true" />
            </button>
          </header>

          <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-24 md:pb-12">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <AnimatePresence mode="wait" initial={false}>
                {(phase === 'off' || phase === 'error') && (
                  <motion.div key="invite" initial={fade} animate={shown} exit={fade} className="flex flex-col items-center">
                    <p className="font-butler text-2xl italic leading-snug text-[#f3e9d6] md:text-[2rem]">
                      Ask me anything about Mr Tiwari&apos;s work, and I shall answer aloud.
                    </p>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                      Everything runs in this browser, and your voice stays on your device. The first visit downloads
                      about {TOTAL_MB} MB, which is kept for next time.
                    </p>
                    {phase === 'error' && (
                      <p role="alert" className="mt-3 max-w-md text-sm text-rose-300">
                        {said}
                      </p>
                    )}
                    <button
                      ref={primaryRef}
                      type="button"
                      onClick={() => butler.load()}
                      className="mt-7 rounded-full border border-[#f3e9d6]/40 bg-[#f3e9d6]/[0.06] px-7 py-3 text-sm font-medium text-[#f3e9d6] transition-colors hover:border-[#f3e9d6]/70 hover:bg-[#f3e9d6]/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3e9d6]"
                    >
                      {phase === 'error' ? 'Try again' : 'Summon the butler'}
                    </button>
                  </motion.div>
                )}

                {phase === 'loading' && (
                  <motion.div key="loading" initial={fade} animate={shown} exit={fade} className="flex w-full flex-col items-center">
                    <p className="font-butler text-2xl italic text-[#f3e9d6] md:text-[2rem]">
                      {mindSkipped ? 'Nearly there. I shall read from my notes.' : 'One moment. I am on my way.'}
                    </p>
                    <div aria-hidden="true" className="mt-6 h-px w-64 bg-white/10 md:w-80">
                      <div
                        className="h-full bg-[#f3e9d6] motion-safe:transition-[width] motion-safe:duration-300"
                        style={{ width: `${Math.max(1, overall * 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex gap-5 text-xs text-slate-500">
                      {PARTS.map((part) => {
                        const skipped = part.id === 'mind' && mindSkipped;
                        const value = Math.round(progress[part.id] * 100);
                        return (
                          <span
                            key={part.id}
                            role="progressbar"
                            aria-label={part.label}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={skipped ? undefined : value}
                            aria-valuetext={skipped ? 'Skipped, this browser has no WebGPU' : undefined}
                          >
                            {part.label} <span className="tabular-nums text-slate-300">{skipped ? 'skipped' : `${value}%`}</span>
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {loaded && (
                  <motion.div key="talk" initial={fade} animate={shown} exit={fade} className="flex w-full flex-col items-center">
                    <div className="flex min-h-[5.5rem] flex-col items-center justify-end">
                      {heard && <p className="mb-2 max-w-xl text-sm text-slate-500">&ldquo;{heard}&rdquo;</p>}
                      <p
                        aria-live="polite"
                        className="max-h-[24dvh] max-w-[44ch] overflow-y-auto font-butler text-xl italic leading-snug text-[#f3e9d6] md:text-[1.7rem]"
                      >
                        {phase === 'listening'
                          ? 'I am listening.'
                          : phase === 'thinking'
                            ? 'One moment.'
                            : said || 'Ask about WellnessLiving, Kusho, or Castler.'}
                      </p>
                    </div>
                    <button
                      ref={primaryRef}
                      type="button"
                      onClick={() => void butler.talk()}
                      aria-pressed={phase === 'listening'}
                      aria-label={talkLabel}
                      className={`relative mt-7 flex h-16 w-16 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3e9d6] md:h-[4.5rem] md:w-[4.5rem] ${
                        phase === 'listening'
                          ? 'border-cyan-300/80 bg-cyan-300/10 text-cyan-100'
                          : 'border-[#f3e9d6]/40 bg-[#f3e9d6]/[0.06] text-[#f3e9d6] hover:border-[#f3e9d6]/70 hover:bg-[#f3e9d6]/[0.12]'
                      }`}
                    >
                      {phase === 'listening' && (
                        <span aria-hidden="true" className="absolute inset-0 rounded-full border border-cyan-300/50 motion-safe:animate-ping" />
                      )}
                      {busy ? <Square size={18} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
                    </button>
                    <p className="mt-3 text-xs text-slate-500">
                      {HINT[talkLabel]}
                      {mind ? '' : '. No WebGPU here, so he reads from his notes.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
