import { initialMemory, reply, type DialogueMemory } from '@/lib/voice/dialogue';

export type ButlerPlan =
  | { kind: 'say'; text: string; memory: DialogueMemory }
  | { kind: 'think'; question: string; note: string; memory: DialogueMemory };

export function greeting(date = new Date()) {
  const hour = date.getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}. I am Mr Tiwari's butler. I would be glad to tell you about his work at WellnessLiving, Kusho, or Castler.`;
}

const FIXED: Record<string, () => string> = {
  hello: () => greeting(),
  unknown: () =>
    "I am afraid that is rather outside my remit. I can speak to Mr Tiwari's work at WellnessLiving, Kusho, or Castler.",
  pick: () => 'Might I suggest WellnessLiving, Kusho, or Castler? I know all three rather well.',
  thanks: () => 'You are most welcome. Do ask, should anything else come to mind.',
  bye: () => "Very good. Mr Tiwari's work is written up on the site, should you wish to read further.",
};

const JOB_NAMES: Record<string, string> = { wellness: 'WellnessLiving', kusho: 'Kusho', castler: 'Castler' };

export const MISHEARD = 'Forgive me, I did not quite catch that. Might you say it again?';
export const NO_EARS = 'Forgive me, my hearing is indisposed in this browser. I cannot take questions by voice just now.';
export const NO_MIC = 'I am afraid I cannot hear you. The microphone appears to be blocked for this site.';

const IRREGULAR_PRESENT: Record<string, string> = { have: 'has', do: 'does', go: 'goes', be: 'is' };
const UNCHANGED_VERBS = new Set([
  'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'shall',
  'built', 'led', 'wrote', 'ran', 'made', 'took', 'went', 'did', 'had', 'gave', 'kept', 'saw', 'got', 'set', 'put', 'cut',
  'began', 'chose', 'drove', 'found', 'held', 'knew', 'left', 'lost', 'met', 'paid', 'read', 'sent', 'spent', 'taught', 'thought', 'won',
]);

function presentTense(verb: string) {
  if (UNCHANGED_VERBS.has(verb) || verb.endsWith('ed')) return verb;
  if (IRREGULAR_PRESENT[verb]) return IRREGULAR_PRESENT[verb];
  if (/(s|x|z|ch|sh|o)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
}

export function thirdPerson(note: string) {
  const converted = note
    .replace(/\bI am\b/g, 'he is')
    .replace(/\bI was\b/g, 'he was')
    .replace(/\bI (usually |also |still |often )?([a-z]+)\b/g, (_, adverb: string | undefined, verb: string) => {
      return `he ${adverb ?? ''}${presentTense(verb)}`;
    })
    .replace(/\bmy\b/g, 'his')
    .replace(/\bMy\b/g, 'His')
    .replace(/\bmyself\b/g, 'himself')
    .replace(/\bme\b/g, 'him');
  return converted.replace(/(^|[.!?]\s+)he\b/g, '$1He');
}

export function planReply(question: string, memory: DialogueMemory = initialMemory()): ButlerPlan {
  const result = reply(question, memory);
  const key = result.memory.lastKey ?? '';
  const fixed = FIXED[key];
  if (fixed) return { kind: 'say', text: fixed(), memory: result.memory };
  if (key.endsWith(':end')) {
    const name = JOB_NAMES[key.slice(0, -4)] ?? 'that post';
    return {
      kind: 'say',
      text: `That is all I have on ${name}, I am afraid. I could tell you about one of his other posts.`,
      memory: result.memory,
    };
  }
  if (key === 'before-empty' || key === 'after-empty') {
    const topic = result.memory.lastTopic;
    const text =
      key === 'before-empty' && topic === 'castler'
        ? 'Castler is as far back as it goes, I am afraid. Payments, in Delhi, from 2021 to 2023.'
        : key === 'after-empty' && topic === 'wellness'
          ? 'WellnessLiving is his present post. He began there in April 2025, on the voice agents.'
          : FIXED.pick();
    return { kind: 'say', text, memory: result.memory };
  }
  return { kind: 'think', question, note: thirdPerson(result.text), memory: result.memory };
}

export const SYSTEM_PROMPT = [
  'You are the butler of Mr Harsh Tiwari, a software engineer. You are an English butler: courteous, discreet, quietly proud of your employer, and a little dry.',
  'A visitor asks about Mr Tiwari. You answer from a NOTE about him.',
  'Speak of him as "Mr Tiwari" or "he". You are not Mr Tiwari. Never say "I am a software engineer" or "my work".',
  'Rules:',
  '- Pick the one or two NOTE sentences that answer the question and keep them nearly word for word, in the same order. Do not merge facts from different sentences.',
  '- You may add a short butler phrase such as "I am told", "Indeed", or "I believe". Add nothing else: no employers, numbers, dates, technologies, or results that are not in the NOTE.',
  '- No lists, no markdown, no emoji.',
  '- British spelling and a butler\'s turn of phrase, but plain enough to follow by ear.',
  '- Do not greet the visitor or introduce yourself.',
].join('\n');

const EXAMPLE = {
  note: 'Payee validation was the awkward one. Peak demand was above a thousand requests a minute, and the bank API was tightly rate limited.',
  question: 'What was the hard part?',
  answer:
    'Payee validation, I am told, was the awkward one. Demand peaked above a thousand requests a minute, and the bank API was tightly rate limited.',
};

export function buildMessages(question: string, note: string) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `NOTE: ${EXAMPLE.note}\n\nVISITOR: ${EXAMPLE.question}` },
    { role: 'assistant', content: EXAMPLE.answer },
    { role: 'user', content: `NOTE: ${note}\n\nVISITOR: ${question}` },
  ];
}

const STYLE_WORDS = new Set(
  'indeed rather certainly quite told understand believe say might should would proud particular particularly especially considerable admirable splendid simply naturally course fact matter visitor employer tiwari answer note while whilst which where there their these those about after before since until into onto from with that this then than them they what when also very just only much more most some such each other being been were have does done made make became become around roughly nearly almost approximately could cannot never always'.split(
    ' '
  )
);

function stem(word: string) {
  return word.replace(/(ings?|ed|es|s|ly)$/, '');
}

export function novelWords(text: string, note: string, question: string) {
  const known = new Set(
    `${note} ${question}`
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .filter(Boolean)
      .map(stem)
  );
  return text
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length >= 5 && !STYLE_WORDS.has(word) && !known.has(stem(word)));
}

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const SCALES: Record<string, number> = {
  hundred: 100, thousand: 1e3, lakh: 1e5, million: 1e6, crore: 1e7, billion: 1e9, dozen: 12,
};

function isNumberToken(token: string) {
  return /^\d[\d,.]*$/.test(token) || token in UNITS || token in SCALES;
}

function phraseValue(tokens: string[]) {
  let total = 0;
  let current = 0;
  for (const token of tokens) {
    if (/^\d/.test(token)) current += Number(token.replace(/,/g, '').replace(/\.$/, ''));
    else if (token in UNITS) current += UNITS[token];
    else if (token === 'hundred') current = (current || 1) * 100;
    else {
      total += (current || 1) * SCALES[token];
      current = 0;
    }
  }
  return total + current;
}

const UNIT_ALIASES: Record<string, string> = {
  '%': 'percent', 'per cent': 'percent', gb: 'gigabytes', tb: 'terabytes', mb: 'megabytes', ms: 'milliseconds', k: 'thousand',
};
const UNBOUND = new Set(
  'a an the of to in on and or per with than at by for from over under about more less nearly roughly around some'.split(' ')
);

const LINKING_VERBS = new Set(
  'is was are were be been being has had have do does did will would can could stayed stays became'.split(' ')
);

function isWordNumber(token: string) {
  return token in UNITS || token in SCALES;
}

interface NumberFact {
  value: number;
  unit: string;
}

function numberFacts(text: string) {
  const facts: NumberFact[] = [];
  const tokens = text
    .toLowerCase()
    .replace(/(\d)\s*%/g, '$1 percent ')
    .replace(/\bper cent\b/g, 'percent')
    .replace(/-/g, ' ')
    .split(/[^a-z0-9,.]+/)
    .map((token) => token.replace(/[,.]+$/, ''))
    .filter(Boolean);
  for (let i = 0; i < tokens.length; i += 1) {
    if (!isNumberToken(tokens[i])) continue;
    let end = i;
    while (
      end + 1 < tokens.length &&
      (isWordNumber(tokens[end + 1]) || (tokens[end + 1] === 'and' && isWordNumber(tokens[end + 2] ?? '') && isWordNumber(tokens[end])))
    ) {
      end += 1;
    }
    const phrase = tokens.slice(i, end + 1).filter((token) => token !== 'and');
    i = end;
    if (phrase.length === 1 && phrase[0] === 'one') continue;
    const value = phraseValue(phrase);
    if (!Number.isFinite(value)) continue;
    let unit = '';
    for (let look = end + 1; look <= end + 3 && look < tokens.length; look += 1) {
      const next = tokens[look];
      if (isNumberToken(next) || LINKING_VERBS.has(next)) break;
      if (UNBOUND.has(next)) continue;
      unit = stem(UNIT_ALIASES[next] ?? next);
      break;
    }
    facts.push({ value, unit });
  }
  return facts;
}

function numbersIn(text: string) {
  return new Set(numberFacts(text).map((fact) => fact.value));
}

function mixedNumberTokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .map((token) => token.replace(/\.+$/, ''))
    .filter((token) => /\d/.test(token) && /[a-z]/.test(token));
}

function unsupportedNumber(text: string, note: string) {
  const known = numberFacts(note);
  const knownMixed = new Set(mixedNumberTokens(note));
  if (mixedNumberTokens(text).some((token) => !knownMixed.has(token))) return true;
  return numberFacts(text).some(
    (fact) => !known.some((entry) => entry.value === fact.value && (!fact.unit || entry.unit === fact.unit))
  );
}

export function cleanSpoken(text: string) {
  return text
    .replace(/[*_#`>]/g, '')
    .replace(/\[[^\]]*\]|\([^)]*\)/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\b(Mr|Mrs|Dr)\./g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentences(text: string, count: number) {
  return splitSentences(text).slice(0, count).join(' ');
}

const PREFACES = ['Certainly.', 'Of course.', 'Indeed.'];

export function retell(note: string) {
  const preface = PREFACES[note.length % PREFACES.length];
  return `${preface} ${note.replace(/^He\b/, 'Mr Tiwari')}`;
}

const OWN_NAMES = new Set(['mr', 'tiwari', 'harsh', 'i', 'sir', 'madam', 'english', 'british']);
const OPENING_WORDS = new Set(
  'a an the he his it its that this these those there then yes no well so and but or as at in on for of to by from with after before during when while where which what since until over under about most much both each every all some such once now here indeed quite certainly rather naturally alas ah oh very just only also'.split(
    ' '
  )
);

function unknownName(text: string, note: string, question: string) {
  const known = `${note} ${question}`.toLowerCase();
  const isKnown = (lower: string) => new RegExp(`\\b${lower.replace(/[-]/g, '\\-')}\\b`).test(known);
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const words = sentence.split(/\s+/);
    for (const [index, word] of words.entries()) {
      const bare = word.replace(/[^A-Za-z0-9-]/g, '');
      if (!/^[A-Z]/.test(bare)) continue;
      const lower = bare.toLowerCase();
      if (OWN_NAMES.has(lower) || isKnown(lower)) continue;
      if (index === 0 && (OPENING_WORDS.has(lower) || STYLE_WORDS.has(lower))) continue;
      return bare;
    }
  }
  return null;
}

const BUTLER_FIRST_PERSON = /^I (am told|am afraid|understand|believe|gather|would|should|could|can|might|must say|may say|dare say|regret)\b/;

function speaksAsHim(text: string) {
  if (/\b(we|our|us|ours|my|mine|myself)\b/i.test(text.replace(/\bmy (dear|word)\b/gi, ''))) return true;
  for (const match of text.matchAll(/\bI\s+\w+(\s+\w+)?/g)) {
    if (!BUTLER_FIRST_PERSON.test(match[0])) return true;
  }
  return false;
}

function dedupeSentences(text: string) {
  const seen = new Set<string>();
  return splitSentences(text)
    .filter((sentence) => {
      const key = sentence.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(' ');
}

const INSERTABLE = new Set(
  'i am told indeed believe understand gather quite rather certainly naturally of course and the a an he his him mr tiwari it that this also very yes well'.split(
    ' '
  )
);
const KEEP = new Set(
  [
    'not no never without cannot nor neither none',
    'always only more less than under over above below least most half double twice once thrice nearly almost',
    'from to until through before after faster slower',
    'instead if unless except but rather although though tightly',
    'is was are were has had have will',
    'january february march april may june july august september october november december',
  ]
    .join(' ')
    .split(' ')
);
const MIN_QUOTED = 4;

function words(text: string) {
  return text
    .replace(/n't\b/gi, ' not')
    .replace(/(\d)\s*%/g, '$1 percent')
    .toLowerCase()
    .split(/[^a-z0-9.-]+/)
    .map((word) => word.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(Boolean);
}

function align(said: string[], source: string[]) {
  const table = Array.from({ length: said.length + 1 }, () => new Array<number>(source.length + 1).fill(0));
  for (let i = 1; i <= said.length; i += 1) {
    for (let j = 1; j <= source.length; j += 1) {
      table[i][j] =
        stem(said[i - 1]) === stem(source[j - 1]) ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  const saidHit = new Array<boolean>(said.length).fill(false);
  const sourceHit = new Array<boolean>(source.length).fill(false);
  for (let i = said.length, j = source.length; i > 0 && j > 0; ) {
    if (stem(said[i - 1]) === stem(source[j - 1])) {
      saidHit[i - 1] = true;
      sourceHit[j - 1] = true;
      i -= 1;
      j -= 1;
    } else if (table[i - 1][j] >= table[i][j - 1]) i -= 1;
    else j -= 1;
  }
  return { saidHit, sourceHit, matched: table[said.length][source.length] };
}

function mustKeep(word: string) {
  return KEEP.has(word) || word.includes('-') || /\d/.test(word) || isWordNumber(word);
}

function quotes(sentence: string, source: string[], proper: Set<string>) {
  const said = words(sentence);
  const { saidHit, sourceHit, matched } = align(said, source);
  if (matched < Math.min(MIN_QUOTED, source.length)) return false;
  if (said.some((word, index) => !saidHit[index] && !INSERTABLE.has(word))) return false;
  const first = sourceHit.indexOf(true);
  const last = sourceHit.lastIndexOf(true);
  for (let j = first; j <= last; j += 1) {
    if (!sourceHit[j] && (mustKeep(source[j]) || proper.has(source[j]) || CLAUSE_BREAK.has(source[j]))) return false;
  }
  for (let j = last + 1; j < source.length && !CLAUSE_BREAK.has(source[j]); j += 1) {
    if (mustKeep(source[j]) || RATE_UNITS.has(source[j])) return false;
  }
  const firstSaid = saidHit.indexOf(true);
  if (first > 0 && said.slice(0, firstSaid).some((word) => SUBJECTS.has(word))) return false;
  return true;
}

const SUBJECTS = new Set('he him his it this that mr tiwari'.split(' '));
const CLAUSE_BREAK = new Set('so and with across while which because but where'.split(' '));
const RATE_UNITS = new Set('second minute hour day week month year'.split(' '));

function properNouns(note: string) {
  const proper = new Set<string>();
  for (const sentence of splitSentences(note)) {
    sentence.split(/\s+/).forEach((raw, index) => {
      const word = raw.replace(/[^A-Za-z0-9-]/g, '');
      if ((index > 0 && /^[A-Z]/.test(word)) || /[a-z][A-Z]|\d/.test(word)) proper.add(word.toLowerCase());
    });
  }
  return proper;
}

const PRONOUN_START = /^(they|it|this|these|those|that)\b/i;

function followsNote(text: string, note: string) {
  const proper = properNouns(note);
  const sentences = splitSentences(note).map(words);
  const windows = sentences.flatMap((_, start) =>
    [1, 2, 3]
      .filter((span) => start + span <= sentences.length)
      .map((span) => ({ start, end: start + span - 1, words: sentences.slice(start, start + span).flat() }))
  );
  let previous: typeof windows = [];
  for (const sentence of splitSentences(text)) {
    const said = words(sentence);
    if (said.length <= 3 && said.every((word) => INSERTABLE.has(word) || word === 'so')) continue;
    let passing = windows.filter((window) => quotes(sentence, window.words, proper));
    if (PRONOUN_START.test(sentence)) {
      passing = passing.filter(
        (window) =>
          window.start === window.end &&
          (window.start === 0 || previous.some((before) => before.end === window.start - 1))
      );
    }
    if (passing.length === 0) return false;
    previous = passing.filter(
      (window) => !passing.some((other) => other.start === window.start && other.end < window.end)
    );
  }
  return true;
}

export function acceptAnswer(raw: string, note: string, question = '') {
  const text = firstSentences(dedupeSentences(cleanSpoken(raw)), 3);
  if (text.length < 20) return { text: retell(note), grounded: false };
  const reject = { text: retell(note), grounded: false };
  if (unknownName(text, note, question)) return reject;
  if (novelWords(text, note, question).length > 3) return reject;
  const quantitative = /\bhow (fast|big|much|many|long|quick|large)\b|\b(latency|scale|volume|numbers?)\b/i.test(question);
  if (quantitative && numbersIn(note).size > 0 && numbersIn(text).size === 0 && !/\bsecond\b/i.test(text)) return reject;
  if (unsupportedNumber(text, note)) return reject;
  if (!followsNote(text, note)) return reject;
  for (const sentence of splitSentences(text)) {
    if (numbersIn(sentence).size > 0 && novelWords(sentence, note, question).length > 0) return reject;
  }
  if (/\b(as an ai|language model|i cannot browse)\b/i.test(text)) return reject;
  if (speaksAsHim(text)) return reject;
  return { text, grounded: true };
}

const WELLNESS_HEAD = String.raw`(?:(?:w|v)el+n[aeiou]?ss?|well\s+(?:ness|nest|is|this|as))`;
const WELLNESS_TAIL = String.raw`(?:liv(?:ing|in|ving)?|leav(?:ing|in)|lin(?:ing|in)|lev(?:el|ing|in)|lov(?:ing|in)|leap(?:ing)?|lib(?:ing|bing))`;

const HEARD_PHRASES: [RegExp, string][] = [
  // "WellnessLiving" survives an Indian accent as two beats: velness, wellness
  // level, well nest living, wellness livin. This page only has the one company.
  [new RegExp(String.raw`\b${WELLNESS_HEAD}[\s,.-]*${WELLNESS_TAIL}\b`, 'gi'), 'WellnessLiving'],
  [new RegExp(String.raw`\b${WELLNESS_HEAD}\b[.!?]*\s*${WELLNESS_TAIL}\b[.!?]*`, 'gi'), 'WellnessLiving.'],
  [/\b(?:velness|vellness|wellniss|welness|wellnes|wellness)\b/gi, 'WellnessLiving'],
  [/\b(carcelor|carceler|carsler|castle ?ler|cassler|caslo|casslo|caslar)\b/gi, 'Castler'],
  [/\b(about|at) casserole\b/gi, '$1 Castler'],
  [/\b(kaso|kasho|kashu|kuso|kusu|kushu|cusho|kusso|koosho|koucho|ku sho|coo sho)\b/gi, 'Kusho'],
  [/\b(at|about|from|with|for) (cash|kash|cush|coo) ?(show|shoe|sho)\b/gi, '$1 Kusho'],
  [/\bmongo ?db\b/gi, 'MongoDB'],
  [/\bred ?shi(f|ff|fted|ft)\b/gi, 'Redshift'],
  [/\bmr\.? tiwar[iy]\b/gi, 'Mr Tiwari'],
];

const SOUND_ALIKE: [string, string][] = [
  ['Castler', 'castler'],
  ['Kusho', 'kusho'],
];

const REAL_WORDS = new Set(
  'castle castles castled caster casters castor caste castes cattle coaster coasters cluster clusters couch couchy cushy cuckoo caucho kosher cash cashes coast coasts cusso case cases cause causes cost costs cast casts coco cosy cozy caller callers carter cater cutler cattle catcher cashier cantle canter casual cusp cuss cush cusk coster costless caseless casper cartier candler caroler cameleer cajoler'.split(' ')
);

function sound(word: string) {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/k/g, 'c')
    .replace(/sh|ch/g, 's')
    .replace(/[hw]/g, '')
    .replace(/(.)\1+/g, '$1')
    .replace(/ou|oo/g, 'u');
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

const NAME_SLOT = /\b(at|about|from|with|before|after|joined|left)\s+([A-Za-z]{4,})\b/gi;

function soundAlike(word: string, loose: boolean) {
  if (REAL_WORDS.has(word.toLowerCase())) return null;
  const heard = sound(word);
  let best: { name: string; score: number } | null = null;
  for (const [name, target] of SOUND_ALIKE) {
    const goal = sound(target);
    const limit = loose && goal.length >= 6 ? 2 : 1;
    if (heard[0] !== goal[0] || Math.abs(heard.length - goal.length) > 1) continue;
    const score = distance(heard, goal);
    if (score <= limit && (!best || score < best.score)) best = { name, score };
  }
  return best?.name ?? null;
}

export function fixNames(text: string) {
  const phrased = HEARD_PHRASES.reduce((value, [pattern, name]) => value.replace(pattern, name), text);
  const slotted = phrased.replace(NAME_SLOT, (whole, lead: string, word: string) => {
    const name = soundAlike(word, true);
    return name ? `${lead} ${name}` : whole;
  });
  return slotted.replace(/[A-Za-z]{5,}/g, (word) => soundAlike(word, false) ?? word);
}

function bareWords(sentence: string) {
  return sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function dropRepeats(text: string) {
  const sentences = splitSentences(text);
  const kept = sentences.filter((sentence, index) => {
    if (index === 0) return true;
    const prior = bareWords(sentences[index - 1]);
    const current = bareWords(sentence);
    if (!current) return false;
    // Whisper sometimes echoes the end of a sentence as its own short
    // sentence right after ("...at Wellness Living. Living."). Drop a short
    // trailing fragment that just repeats the tail of what came before.
    if (current === prior) return false;
    const words = current.split(/\s+/);
    return !(words.length <= 3 && prior.endsWith(current));
  });
  return kept.join(' ');
}

export function cleanTranscript(text: string) {
  const cleaned = fixNames(
    dropRepeats(
      text
        .replace(/\[[^\]]*\]|\([^)]*\)|\*[^*]*\*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
  );
  const words = cleaned.replace(/[^a-z0-9\s]/gi, '').trim();
  if (words.length < 2) return '';
  if (/^(you|thanks for watching|okay|ok|uh+|um+|hmm+|ah+|oh|yeah|so)[.!?]?$/i.test(cleaned)) return '';
  return cleaned;
}

export function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?]["'”’)]*)\s+(?=["'“‘(]?[A-Z0-9])/)
    .map((part) => part.trim())
    .filter(Boolean);
}
