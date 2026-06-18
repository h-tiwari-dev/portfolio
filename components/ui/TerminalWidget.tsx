'use client';

import { useEffect, useRef, useState } from 'react';

type LineType = 'cmd' | 'out' | 'ok' | 'val' | 'blank';

interface Line {
  type: LineType;
  text: string;
}

const SESSIONS: { title: string; lines: Line[] }[] = [
  {
    title: 'voice-agent',
    lines: [
      { type: 'cmd',   text: 'run voice-agent --model qwen3-32b' },
      { type: 'out',   text: 'connecting to LiveKit cluster...' },
      { type: 'ok',    text: 'asr pipeline        online   ✓' },
      { type: 'ok',    text: 'tts synthesizer     ready    ✓' },
      { type: 'ok',    text: 'function calling    armed    ✓' },
      { type: 'blank', text: '' },
      { type: 'val',   text: 'latency     820ms   ← <1000ms' },
      { type: 'val',   text: 'sessions    32 concurrent' },
    ],
  },
  {
    title: 'llm-eval',
    lines: [
      { type: 'cmd',   text: 'run llm-eval --suite rag-prod' },
      { type: 'out',   text: 'loading vector index (1.2M docs)...' },
      { type: 'ok',    text: 'retrieval accuracy  94.2%    ✓' },
      { type: 'ok',    text: 'hallucination rate   1.8%    ✓' },
      { type: 'ok',    text: 'tool call success   99.1%    ✓' },
      { type: 'blank', text: '' },
      { type: 'val',   text: 'model       gemini-2.5-flash' },
      { type: 'val',   text: 'p50 / p99   340ms / 1.2s' },
    ],
  },
  {
    title: 'kubectl',
    lines: [
      { type: 'cmd',   text: 'kubectl top services --env prod' },
      { type: 'out',   text: 'polling kafka (6 brokers)...' },
      { type: 'ok',    text: 'consumer lag        0 msgs   ✓' },
      { type: 'ok',    text: 'redis cluster    99.99% up    ✓' },
      { type: 'ok',    text: 'api gateway        12ms avg  ✓' },
      { type: 'blank', text: '' },
      { type: 'val',   text: 'throughput  2.1M events/mo' },
      { type: 'val',   text: 'workflows   50+ active types' },
    ],
  },
];

const CHAR_DELAY = 36;
const OUTPUT_DELAY = 210;
const HOLD_DURATION = 3400;
const FADE_DURATION = 500;

interface TerminalWidgetProps {
  sessions?: { title: string; lines: Line[] }[];
  minHeight?: number;
}

export default function TerminalWidget({ sessions: propSessions, minHeight = 192 }: TerminalWidgetProps = {}) {
  const activeSessions = propSessions ?? SESSIONS;
  const [sessIdx, setSessIdx] = useState(0);
  const [doneLines, setDoneLines] = useState<Line[]>([]);
  const [typingText, setTypingText] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'fading'>('typing');
  const [fading, setFading] = useState(false);
  const to = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (to.current) clearTimeout(to.current);
  };

  useEffect(() => {
    clear();
    setDoneLines([]);
    setTypingText('');
    setLineIdx(0);
    setPhase('typing');
    setFading(false);
  }, [sessIdx]);

  useEffect(() => {
    if (phase !== 'typing') return;
    const session = activeSessions[sessIdx];
    const line = session.lines[lineIdx];
    if (!line) {
      setPhase('holding');
      return;
    }
    if (line.type === 'cmd') {
      const len = typingText.length;
      if (len < line.text.length) {
        to.current = setTimeout(
          () => setTypingText(line.text.slice(0, len + 1)),
          CHAR_DELAY,
        );
      } else {
        to.current = setTimeout(() => {
          setDoneLines(prev => [...prev, line]);
          setTypingText('');
          setLineIdx(i => i + 1);
        }, 160);
      }
    } else {
      const delay = line.type === 'blank' ? 70 : OUTPUT_DELAY;
      to.current = setTimeout(() => {
        setDoneLines(prev => [...prev, line]);
        setLineIdx(i => i + 1);
      }, delay);
    }
    return clear;
  }, [activeSessions, phase, sessIdx, lineIdx, typingText]);

  useEffect(() => {
    if (phase !== 'holding') return;
    to.current = setTimeout(() => setPhase('fading'), HOLD_DURATION);
    return clear;
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fading') return;
    setFading(true);
    to.current = setTimeout(
      () => setSessIdx(i => (i + 1) % activeSessions.length),
      FADE_DURATION,
    );
    return clear;
  }, [activeSessions.length, phase]);

  const session = activeSessions[sessIdx];
  const isTypingCmd =
    phase === 'typing' && session.lines[lineIdx]?.type === 'cmd';

  const lineClass = (type: LineType) => {
    if (type === 'cmd') return 'text-slate-100';
    if (type === 'out') return 'text-slate-500';
    if (type === 'ok') return 'text-emerald-400';
    if (type === 'val') return 'text-amber-300';
    return '';
  };

  const linePrefix = (type: LineType) => {
    if (type === 'cmd')
      return <span className="mr-1.5 select-none text-rose-400">$</span>;
    if (type === 'out')
      return <span className="mr-1.5 select-none text-slate-600">›</span>;
    if (type === 'ok' || type === 'val')
      return <span className="mr-1.5 select-none text-slate-800"> </span>;
    return null;
  };

  return (
    <div
      className="cyber-bracket border border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm"
      style={{
        borderLeftWidth: '2px',
        borderLeftColor: 'rgba(225, 29, 72, 0.5)',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-neutral-800/60 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/55" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/55" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/55" />
        </div>
        <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
          harsh@prod ~ {session.title}
        </span>
        <span className="ml-auto font-mono text-[9px] text-slate-700">
          {sessIdx + 1}/{activeSessions.length}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-0.5 px-3 py-3 font-mono text-xs" style={{ minHeight: minHeight }}>
        {doneLines.map((line, i) => (
          <div key={i} className={lineClass(line.type)}>
            {linePrefix(line.type)}
            {line.text}
          </div>
        ))}

        {isTypingCmd && (
          <div className="text-slate-100">
            <span className="mr-1.5 select-none text-rose-400">$</span>
            {typingText}
            <span className="terminal-cursor ml-px inline-block h-[0.82em] w-[1.5px] align-middle bg-slate-300" />
          </div>
        )}

        {phase === 'holding' && (
          <div className="text-slate-100">
            <span className="mr-1.5 select-none text-rose-400">$</span>
            <span className="terminal-cursor ml-px inline-block h-[0.82em] w-[1.5px] align-middle bg-slate-300" />
          </div>
        )}
      </div>

      {/* Session dots */}
      <div className="flex items-center gap-1.5 border-t border-neutral-800/40 px-3 py-1.5">
        {activeSessions.map((_, i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                i === sessIdx
                  ? 'rgba(225, 29, 72, 0.8)'
                  : 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
