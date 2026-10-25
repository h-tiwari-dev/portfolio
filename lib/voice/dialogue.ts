import type { Topic } from '@/lib/voice/types';

export interface DialogueMemory {
  lastTopic: Topic | null;
  lastKey: string | null;
  beats: Partial<Record<Topic, number>>;
}

type Job = 'wellness' | 'kusho' | 'castler';

interface Cue {
  id: string;
  phrases: string[];
  weight: number;
  topic: Topic;
  beat?: number;
  text?: string;
}

const JOBS: Job[] = ['wellness', 'kusho', 'castler'];

const BEATS: Record<Job, string[]> = {
  wellness: [
    'Right now I am a senior software engineer at WellnessLiving, in Bengaluru. I started in April 2025. The work is a multi-tenant voice AI backend. Each tenant gets retrieval, structured function calling, tool schemas, and the provider integrations behind live customer calls.',
    'The number I watch is the response path. The target is under a second. I trace five stages. Speech in, building the request, the model, tool calls, and speech back out. Those timings stream through Kafka into Redshift, so a slow stage can be named.',
    'Guardrails sit on what a tool is allowed to do. There is structured tracing, regression checks, and retry-safe workflows. Read-only SQL agents are not allowed to write. That covers the retrieval analytics and the live voice agents.',
    'One build I keep coming back to is a Chinese voice agent. LiveKit is the real-time media layer. Speech in is self-hosted Qwen3-ASR and speech out is Qwen3-TTS, both on CUDA. Gemini does the reasoning and the tool calls.',
    'Cerebrum is the LLM service the telephony agents call. I reworked it so the streamed reply stays under a second. The model streams as it goes. Retrieval and tool preparation run side by side. Prompt construction was trimmed, and the synchronous waits came off the inference path.',
    'I scaled the WebSocket services so they stay stateless. Authentication is OAuth 2.0, with rate limiting. That steadied the connections for real-time chat and the agent workflows.',
  ],
  kusho: [
    'Before WellnessLiving I was at Kusho, August 2023 to April 2025, also in Bengaluru. Full stack, on developer tooling. LLM task pipelines, API workflows, and browser automation.',
    'The worker side was Redis and RQ. LLM jobs and prompt work queued and fanned out across large API payloads, instead of blocking a request. That kept throughput up under heavy background work. Redis also shows up in the Castler stack. The Kusho piece was those RQ pipelines.',
    'I wrote one service definition that covered four formats. Postman collections, OpenAPI, GraphQL, and Protocol Buffers. LLM calls then drafted the test cases, which cut the time spent writing them by hand.',
    'A compiler turned those four formats into one executable graph. That shared runtime did generation, validation, and the calls themselves.',
    'The testing product had more than fifty workflow node types, for end-to-end orchestration. It shortened the runtime of the large flows.',
    'I also built a Chrome extension that records a session and writes a Playwright script, with fallback selectors so a small DOM change does not kill the run. It held about ninety-five percent stability, tripled test coverage, and cut manual QA by about seventy percent.',
    'Large API collections became dependency graphs. Redis and RQ scheduled the nodes, with parallel fan-out and isolated runs, across more than a thousand businesses.',
  ],
  castler: [
    'The earliest of these is Castler, in Delhi, May 2021 to August 2023. Full stack, on payments. UPI and IMPS, the checks in front of the bank, and the books behind them.',
    'Volume was above fifty crore rupees a month, across more than two million transactions. The payment path stayed under about two hundred milliseconds. Infrastructure cost on that platform came down about thirty-five percent.',
    'The platform was event driven. Queues, idempotency keys, circuit breakers. A retry was not allowed to move the money twice.',
    'Payee validation was the awkward one. Peak demand was above a thousand requests a minute, and the bank API was tightly rate limited. The pipeline queued the checks, dropped duplicates, regulated the load, and retried with state, so rush hour did not fail the check in front of the user.',
    'I led a zero-downtime migration of about two hundred gigabytes from MongoDB to MySQL, with dual writes and a blue-green cutover. Separately, I built Airflow reconciliation pipelines. They improved consistency, made queries about forty percent faster, and cut infrastructure cost about twenty-five percent.',
    'Recovery watched three sources of truth. Gateway responses, the bank callbacks, and the internal ledger. A mismatch was caught, and a failed payment could be put back without losing the books.',
  ],
};

const LINES = {
  hello:
    'I am Harsh. I can talk through the work. WellnessLiving is the current role, voice AI. Before that, Kusho. Before that, Castler.',
  arc: 'Three roles, all systems that had to stay correct under load. Castler was payments, from 2021 to 2023. Kusho was API tooling and LLM pipelines, through early 2025. WellnessLiving is where I am now, on a multi-tenant voice AI backend.',
  skills:
    'Day to day the languages are Python, TypeScript, Go, and SQL. The services are Node, NestJS, REST, GraphQL, and WebSockets. The AI work is Gemini, Qwen3-ASR and Qwen3-TTS, LiveKit, retrieval, function calling, vector databases, and GPU inference. Under that, Kafka, Redis, Postgres, MySQL, Mongo, Redshift, Airbyte, and AWS, Docker, and Kubernetes.',
  place:
    'I am in Bengaluru. WellnessLiving and Kusho are both here. Castler was Delhi.',
  compare:
    'WellnessLiving is the current job, a multi-tenant voice AI backend. Kusho was developer tooling, LLM pipelines and API workflows. Castler was payments, UPI and IMPS, and the ledgers behind them.',
  why: 'I like the voice work because the latency is not abstract. A person is waiting on the other end of the call. Under a second is the difference between a conversation and a walkie-talkie.',
  oauth:
    'OAuth 2.0 is on both the current voice services and the Castler payment stack. At WellnessLiving the WebSocket services use it with rate limits, which steadied the connections. At Castler it was OAuth 2.0 with PKCE, with SonarQube, Snyk, and OWASP ZAP on the scanning side, for release hygiene and compliance.',
  study:
    'I read computer science at Amity University, in Lucknow. The degree is a Bachelor of Technology, from August 2017 to May 2021.',
  unknown:
    'I can talk about the work, not much else. Ask about WellnessLiving, Kusho, or Castler.',
  thanks: 'Sure. Ask about another role if you want.',
  bye: 'Alright. The same work is written up on the site if you want to read it.',
  pick: 'Ask me about WellnessLiving, Kusho, or Castler.',
  earliest:
    'Castler is as far back as I go here. Delhi, payments, 2021 to 2023.',
  latest: 'WellnessLiving is the current one. I started there in April 2025, on the voice agents.',
};

const CUES: Cue[] = [
  { id: 'why', phrases: ['why voice', 'why this work', 'why do you like', 'why does he like', 'like voice', 'enjoy', 'favourite', 'favorite'], weight: 6, topic: 'wellness', text: LINES.why },
  { id: 'castler-auth', phrases: ['pkce', 'sonarqube', 'snyk', 'owasp'], weight: 6, topic: 'castler', text: 'At Castler, auth was OAuth 2.0 with PKCE. Scanning ran through SonarQube, Snyk, and OWASP ZAP, for release hygiene and compliance.' },
  { id: 'oauth', phrases: ['oauth'], weight: 5, topic: 'wellness', text: LINES.oauth },
  { id: 'study', phrases: ['university', 'amity', 'degree', 'bachelor', 'studied', 'study', 'education', 'college'], weight: 6, topic: 'study', text: LINES.study },
  { id: 'qwen', phrases: ['chinese', 'qwen', 'livekit', 'cuda', 'gemini', 'asr', 'tts'], weight: 6, topic: 'wellness', beat: 3 },
  { id: 'sockets', phrases: ['websocket', 'websockets', 'web socket', 'rate limit', 'rate limiting'], weight: 6, topic: 'wellness', beat: 5 },
  { id: 'cerebrum', phrases: ['cerebrum', 'telephony', 'prompt construction', 'synchronous'], weight: 5, topic: 'wellness', beat: 4 },
  { id: 'latency', phrases: ['latency', 'sub-second', 'subsecond', 'under a second', 'response path', 'response time', 'how fast', 'fast', 'speed', 'quick', 'kafka', 'redshift', 'telemetry'], weight: 5, topic: 'wellness', beat: 1 },
  { id: 'guard', phrases: ['guardrail', 'guardrails', 'sql agent', 'regression', 'retry-safe', 'read-only', 'read only'], weight: 5, topic: 'wellness', beat: 2 },
  { id: 'rag', phrases: ['rag', 'retrieval', 'function calling', 'multi-tenant', 'multitenant', 'tool schema', 'provider integration'], weight: 5, topic: 'wellness', beat: 0 },
  { id: 'playwright', phrases: ['playwright', 'chrome extension', 'selector', 'ninety-five', '95 percent', 'manual qa'], weight: 6, topic: 'kusho', beat: 5 },
  { id: 'businesses', phrases: ['businesses', 'thousand businesses', 'fan-out', 'fan out', 'dependency graph'], weight: 5, topic: 'kusho', beat: 6 },
  { id: 'compiler', phrases: ['compiler', 'executable graph', 'graph ir'], weight: 6, topic: 'kusho', beat: 3 },
  { id: 'specs', phrases: ['openapi', 'swagger', 'graphql', 'protobuf', 'protocol buffer', 'postman', 'four formats', 'test cases'], weight: 5, topic: 'kusho', beat: 2 },
  { id: 'redis', phrases: ['redis', 'rq'], weight: 5, topic: 'kusho', beat: 1 },
  { id: 'nodes', phrases: ['builder node', 'workflow node', 'node types'], weight: 4, topic: 'kusho', beat: 4 },
  { id: 'migration', phrases: ['migration', 'mongodb', 'mongo', 'airflow', 'blue-green', 'blue green', 'dual write', 'dual-write', 'mysql'], weight: 5, topic: 'castler', beat: 4 },
  { id: 'books', phrases: ['ledger', 'callback', 'sources of truth', 'reconciliation', 'reconcile'], weight: 6, topic: 'castler', beat: 5 },
  { id: 'payee', phrases: ['payee', 'rate limited', 'rate-limited', 'thousand requests', 'rush hour'], weight: 5, topic: 'castler', beat: 3 },
  { id: 'upi', phrases: ['upi', 'imps', 'idempotency', 'idempotent', 'circuit breaker', 'circuit breakers', 'retry', 'retries', 'double', 'twice', 'duplicate'], weight: 5, topic: 'castler', beat: 2 },
  { id: 'volume', phrases: ['crore', 'two million', 'transactions', 'millisecond', 'how big', 'how much', 'volume', 'scale'], weight: 4, topic: 'castler', beat: 1 },
  { id: 'earliest', phrases: ['first job', 'first role', 'earliest', 'oldest role'], weight: 5, topic: 'castler', text: LINES.earliest },
  { id: 'latest', phrases: ['current role', 'current job', 'latest role', 'these days', 'right now'], weight: 4, topic: 'wellness', text: LINES.latest },
  { id: 'wellness', phrases: ['wellnessliving', 'wellness living', 'wellness', 'velness', 'wellniss', 'welness'], weight: 4, topic: 'wellness', beat: 0 },
  { id: 'kusho', phrases: ['kusho'], weight: 4, topic: 'kusho', beat: 0 },
  { id: 'castler', phrases: ['castler', 'payments', 'payment'], weight: 4, topic: 'castler', beat: 0 },
  { id: 'place', phrases: ['where do you live', 'where are you', 'based', 'location', 'bengaluru', 'bangalore', 'delhi'], weight: 4, topic: 'place' },
  { id: 'skills', phrases: ['skills', 'skill', 'stack', 'languages', 'typescript', 'python', 'kubernetes', 'what do you use'], weight: 3, topic: 'skills' },
  { id: 'arc', phrases: ['career', 'experience', 'background', 'walk me', 'overview', 'your work', 'what do you do', 'tell me about yourself'], weight: 3, topic: 'arc' },
  { id: 'hello', phrases: ['hello', 'hi', 'hey', 'who are you', 'your name', 'introduce yourself'], weight: 2, topic: 'hello' },
];

const SINGLES: Partial<Record<Topic, string>> = {
  hello: LINES.hello,
  arc: LINES.arc,
  skills: LINES.skills,
  place: LINES.place,
};

export function initialMemory(): DialogueMemory {
  return { lastTopic: null, lastKey: null, beats: {} };
}

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasPhrase(query: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(query);
}

function hasAny(query: string, phrases: string[]) {
  return phrases.some((phrase) => hasPhrase(query, phrase));
}

function namedJobs(query: string): Job[] {
  const found: { job: Job; at: number }[] = [];
  const markers: [Job, string[]][] = [
    ['wellness', ['wellnessliving', 'wellness living', 'wellness', 'velness', 'wellniss', 'welness']],
    ['kusho', ['kusho']],
    ['castler', ['castler']],
  ];
  for (const [job, phrases] of markers) {
    const at = Math.min(
      ...phrases.map((phrase) => {
        const index = query.indexOf(phrase);
        return index === -1 ? Number.POSITIVE_INFINITY : index;
      })
    );
    if (Number.isFinite(at)) found.push({ job, at });
  }
  return found.sort((a, b) => a.at - b.at).map((item) => item.job);
}

function bestCue(query: string, allow?: (cue: Cue) => boolean): { cue: Cue; score: number } | null {
  let winner: { cue: Cue; score: number } | null = null;
  for (const cue of CUES) {
    if (allow && !allow(cue)) continue;
    let score = 0;
    for (const phrase of cue.phrases) {
      if (hasPhrase(query, phrase)) score += cue.weight;
    }
    if (score > 0 && (!winner || score > winner.score)) winner = { cue, score };
  }
  return winner;
}

function say(text: string, memory: DialogueMemory, topic: Topic | null, key: string): {
  text: string;
  memory: DialogueMemory;
} {
  return {
    text,
    memory: {
      lastTopic: topic,
      lastKey: key,
      beats: memory.beats,
    },
  };
}

function sayJob(topic: Job, beat: number, memory: DialogueMemory) {
  const lines = BEATS[topic];
  let index = beat;
  if (memory.lastKey === `${topic}:${index}`) index += 1;
  if (index >= lines.length) {
    const name = topic === 'wellness' ? 'WellnessLiving' : topic === 'kusho' ? 'Kusho' : 'Castler';
    return say(
      `That is the detail I have on ${name}. Ask about another role if you want.`,
      memory,
      topic,
      `${topic}:end`
    );
  }
  return {
    text: lines[index],
    memory: {
      lastTopic: topic,
      lastKey: `${topic}:${index}`,
      beats: { ...memory.beats, [topic]: index },
    },
  };
}

function previousJob(topic: Topic | null): Job | null {
  if (topic === 'wellness') return 'kusho';
  if (topic === 'kusho') return 'castler';
  return null;
}

function nextJob(topic: Topic | null): Job | null {
  if (topic === 'castler') return 'kusho';
  if (topic === 'kusho') return 'wellness';
  return null;
}

export function reply(input: string, memory: DialogueMemory = initialMemory()) {
  const query = normalize(input);
  if (!query) return say(LINES.pick, memory, memory.lastTopic, 'pick');

  const named = namedJobs(query);
  if (named.length >= 2) return say(LINES.compare, memory, named[0], 'compare');

  const more = hasAny(query, ['tell me more', 'say more', 'go on', 'what else', 'anything else', 'keep going', 'more detail', 'elaborate']);
  const before =
    hasAny(query, ['before that', 'before this', 'previous role', 'previous job', 'prior role', 'what came before', 'earlier role']) ||
    (hasPhrase(query, 'before') && named.length === 1);
  const after =
    hasAny(query, ['after that', 'after this', 'next role', 'what came after']) ||
    (hasPhrase(query, 'after') && named.length === 1);
  const cue =
    named.length === 1
      ? bestCue(query, (item) => item.topic === named[0] && item.id !== named[0])
      : bestCue(query);

  if (before && named.length <= 1) {
    const anchor = named[0] ?? memory.lastTopic;
    if (anchor) {
      const job = previousJob(anchor);
      if (!job) {
        return say(anchor === 'castler' ? LINES.earliest : LINES.pick, memory, anchor, 'before-empty');
      }
      return sayJob(job, 0, memory);
    }
  }

  if (after && named.length <= 1) {
    const anchor = named[0] ?? memory.lastTopic;
    if (anchor) {
      const job = nextJob(anchor);
      if (!job) {
        return say(anchor === 'wellness' ? LINES.latest : LINES.pick, memory, anchor, 'after-empty');
      }
      return sayJob(job, 0, memory);
    }
  }

  const specificCue = Boolean(cue && ((cue.cue.beat ?? 0) > 0 || cue.cue.text));
  if (more && !specificCue) {
    if (cue && JOBS.includes(cue.cue.topic as Job) && cue.cue.topic !== memory.lastTopic) {
      return sayJob(cue.cue.topic as Job, 0, memory);
    }
    if (memory.lastTopic && JOBS.includes(memory.lastTopic as Job)) {
      const topic = memory.lastTopic as Job;
      const beat = (memory.beats[topic] ?? 0) + 1;
      return sayJob(topic, beat, memory);
    }
    if (!cue) return say(LINES.pick, memory, memory.lastTopic, 'pick');
  }

  if (!cue && named.length === 1) return sayJob(named[0], 0, memory);

  if (!cue) {
    if (hasAny(query, ['thank you', 'thanks', 'thank'])) return say(LINES.thanks, memory, memory.lastTopic, 'thanks');
    if (hasAny(query, ['goodbye', 'bye'])) return say(LINES.bye, memory, memory.lastTopic, 'bye');
    return say(LINES.unknown, memory, memory.lastTopic, 'unknown');
  }

  if (cue.cue.text) return say(cue.cue.text, memory, cue.cue.topic, cue.cue.id);
  if (JOBS.includes(cue.cue.topic as Job)) return sayJob(cue.cue.topic as Job, cue.cue.beat ?? 0, memory);

  const line = SINGLES[cue.cue.topic] ?? LINES.unknown;
  return say(line, memory, cue.cue.topic, cue.cue.id);
}
