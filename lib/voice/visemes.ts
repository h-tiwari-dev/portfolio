import type { Viseme } from '@/lib/voice/types';

export interface VisemeSpan {
  viseme: Viseme;
  start: number;
  end: number;
  charIndex: number;
}

export interface VisemeTimeline {
  spans: VisemeSpan[];
  duration: number;
}

const VOWEL: Record<string, Viseme> = {
  a: 'ah',
  e: 'ee',
  i: 'ee',
  o: 'oh',
  u: 'oo',
  y: 'ee',
};

function phoneOf(char: string, next: string): Viseme {
  const c = char.toLowerCase();
  if (c === ' ' || c === '\n' || c === '\t') return 'rest';
  if (',;:—-'.includes(c)) return 'rest';
  if ('.?!'.includes(c)) return 'rest';
  if (c === 'm' || c === 'b' || c === 'p') return 'mbp';
  if (c === 'f' || c === 'v') return 'fv';
  if (c === 'w' || (c === 'q' && next === 'u')) return 'oo';
  if (c === 'o') return next === 'o' || next === 'u' || next === 'w' ? 'oo' : 'oh';
  if (c === 'a') return 'ah';
  if (c === 'e' || c === 'i' || c === 'y') return 'ee';
  if (c === 'u') return 'oo';
  if (c === 'l' || 'tdnsz'.includes(c)) return 'l';
  if ('rkgcjxh'.includes(c)) return 'ee';
  return 'rest';
}

function rawDuration(char: string, viseme: Viseme): number {
  if ('.!?'.includes(char)) return 210;
  if (',;:'.includes(char) || char === '—') return 120;
  if (char === ' ' || char === '\n') return 72;
  if (viseme === 'ah' || viseme === 'oh' || viseme === 'oo') return 108;
  if (viseme === 'ee' || viseme === 'l') return 78;
  if (viseme === 'mbp' || viseme === 'fv') return 68;
  return 58;
}

/**
 * Maps text to a mouth timeline. Browser speech synthesis only reports word
 * boundaries, so timing inside a word is estimated, then scaled to a
 * conversational rate. Callers resync the playhead when a word boundary fires.
 */
export function buildTimeline(text: string, rate = 1): VisemeTimeline {
  const spans: VisemeSpan[] = [];
  let cursor = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = (text[i + 1] ?? ' ').toLowerCase();
    const viseme = phoneOf(char, next);
    const duration = rawDuration(char, viseme);
    const previous = spans[spans.length - 1];

    if (previous && previous.viseme === viseme && !'.?!,;: '.includes(char)) {
      previous.end += duration;
      continue;
    }

    spans.push({
      viseme,
      start: cursor,
      end: cursor + duration,
      charIndex: i,
    });
    cursor += duration;
  }

  if (cursor === 0) {
    return { spans: [{ viseme: 'rest', start: 0, end: 240, charIndex: 0 }], duration: 240 };
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const expected = (Math.max(words, 1) / (168 * Math.max(rate, 0.5))) * 60_000;
  const scale = expected / cursor;

  const scaled = spans.map((span) => ({
    ...span,
    start: span.start * scale,
    end: span.end * scale,
  }));

  return { spans: scaled, duration: cursor * scale };
}

export function visemeAt(timeline: VisemeTimeline, timelineMs: number): Viseme {
  if (timeline.spans.length === 0) return 'rest';
  if (timelineMs <= 0) return timeline.spans[0].viseme;
  if (timelineMs >= timeline.duration) return 'rest';

  for (let i = timeline.spans.length - 1; i >= 0; i--) {
    if (timelineMs >= timeline.spans[i].start) return timeline.spans[i].viseme;
  }

  return 'rest';
}

export function timeForChar(timeline: VisemeTimeline, charIndex: number): number {
  let time = 0;
  for (const span of timeline.spans) {
    if (span.charIndex <= charIndex) time = span.start;
    else break;
  }
  return time;
}
