'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Building2,
  Calendar,
  ChevronRight,
  Cpu,
  Database,
  MapPin,
  RadioTower,
} from 'lucide-react';

const experiences = [
  {
    pid: 'PID_1024',
    company: 'WellnessLiving',
    role: 'Senior Software Engineer',
    location: 'Bengaluru, India',
    period: 'APR 2025 - PRESENT',
    status: 'VOICE_AI_PROD',
    isActive: true,
    color: 'rose',
    summary:
      'Production Voice AI, LLM microservices, real-time media systems, and tenant-specific agent workflows for live customer conversations.',
    impact: [
      { value: '<1s', label: 'response-path target' },
      { value: '5', label: 'latency stages traced' },
      { value: 'RAG', label: 'tool-backed agents' },
    ],
    highlights: [
      'Engineered a multi-tenant Voice AI backend with RAG, structured function calling, tool schemas, and provider integrations',
      'Built a Chinese voice-to-voice agent using LiveKit, self-deployed Qwen3-ASR/Qwen3-TTS, CUDA inference, and Gemini orchestration',
      'Re-architected Cerebrum, the LLM microservice behind telephony agents, for sub-second streaming responses',
      'Added service guardrails for tool execution, structured tracing, regression checks, retry-safe workflows, and read-only SQL agents',
      'Scaled stateless WebSocket services with OAuth 2.0 authentication and rate limiting for real-time chat and agent workflows',
      'Instrumented STT, request assembly, LLM inference, tool execution, and TTS telemetry through Kafka into Redshift',
    ],
    tech: ['LIVEKIT', 'QWEN3', 'GEMINI', 'RAG', 'KAFKA', 'REDSHIFT'],
  },
  {
    pid: 'PID_0892',
    company: 'Kusho',
    role: 'Full Stack Developer',
    location: 'Bengaluru, India',
    period: 'AUG 2023 - APR 2025',
    status: 'DEVTOOLS_SCALE',
    isActive: false,
    color: 'amber',
    summary:
      'LLM task pipelines, API workflow execution, browser automation, and distributed test infrastructure for developer tooling.',
    impact: [
      { value: '50+', label: 'builder nodes' },
      { value: '95%', label: 'extension stability' },
      { value: '1000+', label: 'business workflows' },
    ],
    highlights: [
      'Built Redis and RQ worker pipelines for scalable LLM task execution, prompt processing, and async job orchestration',
      'Designed a unified service-definition DSL for Postman, OpenAPI/Swagger, GraphQL, and Protocol Buffers',
      'Built an API testing platform with 50+ workflow node types for end-to-end orchestration and faster large-flow execution',
      'Developed a Chrome extension that records interactions and generates Playwright scripts with resilient selector fallbacks',
      'Modeled large API collections as dependency-aware workflow graphs with parallel fan-out and isolated execution pipelines',
      'Built a compiler that normalizes API specs into a shared executable graph IR for generation, validation, and execution',
    ],
    tech: [
      'REDIS_RQ',
      'PLAYWRIGHT',
      'OPENAPI',
      'GRAPHQL',
      'PROTOBUF',
      'LLM_APIS',
    ],
  },
  {
    pid: 'PID_0441',
    company: 'Castler',
    role: 'Full Stack Developer',
    location: 'Delhi, India',
    period: 'MAY 2021 - AUG 2023',
    status: 'PAYMENTS_SCALE',
    isActive: false,
    color: 'orange',
    summary:
      'Payment infrastructure, validation pipelines, financial data migrations, security hardening, and state reconciliation at scale.',
    impact: [
      { value: 'INR 50Cr+', label: 'monthly volume' },
      { value: '2M+', label: 'transactions' },
      { value: '<200ms', label: 'payment latency' },
    ],
    highlights: [
      'Built an event-driven UPI/IMPS payment platform with queues, idempotency controls, and circuit breakers',
      'Architected a payee validation pipeline for 1000+ RPM peak demand against a heavily rate-limited bank API',
      'Led a zero-downtime 200GB MongoDB to MySQL migration with blue-green deployment and dual-write architecture',
      'Built Airflow reconciliation pipelines that improved consistency, delivered 40% faster queries, and reduced infrastructure cost by 25%',
      'Strengthened OAuth 2.0/PKCE auth and automated security scanning with SonarQube, Snyk, and OWASP ZAP',
      'Built recovery workflows across gateway responses, bank callbacks, and internal ledger state to preserve financial correctness',
    ],
    tech: ['KAFKA', 'REDIS', 'MYSQL', 'MONGODB', 'AIRFLOW', 'OAUTH2'],
  },
];

const colorConfig = {
  rose: {
    border: 'border-rose-800',
    text: 'text-rose-300',
    dim: 'text-rose-500',
    dot: 'bg-rose-500',
    tag: 'bg-rose-950/80 border-rose-900 text-rose-200',
    glow: 'shadow-[0_0_50px_-24px_rgba(255,51,102,0.9)]',
    accent: '#ff3366',
  },
  amber: {
    border: 'border-yellow-800',
    text: 'text-yellow-300',
    dim: 'text-yellow-500',
    dot: 'bg-yellow-400',
    tag: 'bg-yellow-950/80 border-yellow-900 text-yellow-200',
    glow: 'shadow-[0_0_50px_-24px_rgba(255,204,0,0.9)]',
    accent: '#ffcc00',
  },
  orange: {
    border: 'border-orange-800',
    text: 'text-orange-300',
    dim: 'text-orange-500',
    dot: 'bg-orange-500',
    tag: 'bg-orange-950/80 border-orange-900 text-orange-200',
    glow: 'shadow-[0_0_50px_-24px_rgba(255,85,0,0.9)]',
    accent: '#ff5500',
  },
};

interface ExperienceSectionContentProps {
  activeIndex: number;
  onSlideChange: (index: number) => void;
}

export default function ExperienceSectionContent({
  activeIndex,
  onSlideChange,
}: ExperienceSectionContentProps) {
  const activeExperience = experiences[activeIndex];
  const currentColors =
    colorConfig[activeExperience.color as keyof typeof colorConfig];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 z-[1] transition-colors duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 18% 45%, ${currentColors.accent}20, transparent 32%), linear-gradient(90deg, ${currentColors.accent}16, transparent 42%)`,
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/30 to-background/80 pointer-events-none" />

      <div className="relative z-20 flex h-full flex-col px-4 pb-24 pt-5 sm:px-6 sm:pb-20 md:px-10 md:py-9">
        <div className="mb-5 flex items-start justify-between gap-4 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center border bg-neutral-950/85 ${currentColors.border}`}
            >
              <Activity size={19} className={currentColors.text} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white md:text-3xl">
                Experience
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                Work trajectory
              </p>
            </div>
          </motion.div>

          <div className="text-right">
            <span
              className={`text-3xl font-black md:text-5xl ${currentColors.text}`}
            >
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <span className="mx-1 text-xl text-slate-600 md:text-2xl">/</span>
            <span className="text-xl text-slate-500 md:text-2xl">
              {String(experiences.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <nav className="hidden md:block">
            <div className="relative h-full border-l border-neutral-800 pl-5">
              <div
                className="absolute left-[-1px] top-0 w-px transition-all duration-500"
                style={{
                  height: `${((activeIndex + 1) / experiences.length) * 100}%`,
                  backgroundColor: currentColors.accent,
                }}
              />
              <div className="space-y-4">
                {experiences.map((exp, index) => {
                  const colors =
                    colorConfig[exp.color as keyof typeof colorConfig];
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={exp.pid}
                      onClick={() => onSlideChange(index)}
                      className="group block w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full transition-transform ${
                            isActive ? colors.dot : 'bg-slate-700'
                          }`}
                          style={{
                            boxShadow: isActive
                              ? `0 0 16px ${colors.accent}`
                              : 'none',
                          }}
                        />
                        <span
                          className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                            isActive
                              ? colors.text
                              : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        >
                          {exp.company}
                        </span>
                      </div>
                      <div className="mt-2 pl-5 text-xs leading-relaxed text-slate-500">
                        {exp.period}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <motion.section
            key={activeExperience.pid}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            className={`min-h-0 border bg-neutral-950/82 p-4 backdrop-blur-sm sm:p-5 md:p-7 ${currentColors.border} ${currentColors.glow}`}
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {activeExperience.isActive && (
                <span className="inline-flex items-center gap-2 border border-green-900 bg-green-950/80 px-2.5 py-1 font-mono text-[10px] text-green-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Current
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {activeExperience.pid}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
                {activeExperience.status}
              </span>
            </div>

            <h3 className="max-w-3xl text-2xl font-black leading-tight text-white sm:text-3xl md:text-5xl">
              {activeExperience.role}
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 font-mono text-base font-bold sm:text-lg ${currentColors.text}`}
              >
                <Building2 size={17} />
                {activeExperience.company}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
                <MapPin size={14} />
                {activeExperience.location}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
                <Calendar size={14} />
                {activeExperience.period}
              </span>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {activeExperience.summary}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {activeExperience.impact.map((item) => (
                <div
                  key={item.value}
                  className="border border-neutral-800 bg-black/30 p-3"
                >
                  <div className={`text-2xl font-black ${currentColors.text}`}>
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {activeExperience.highlights.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className={`items-start gap-2 text-sm leading-relaxed text-slate-300 ${
                    index > 3 ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <ChevronRight
                    size={15}
                    className={`mt-0.5 shrink-0 ${currentColors.text}`}
                  />
                  <span>{point}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {activeExperience.tech.map((tech) => (
                <span
                  key={tech}
                  className={`border px-2.5 py-1.5 font-mono text-[10px] ${currentColors.tag}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>

          <aside className="hidden lg:flex lg:flex-col lg:gap-3">
            <div className="border border-neutral-800 bg-neutral-950/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <RadioTower size={18} className={currentColors.text} />
                <ArrowUpRight size={16} className="text-slate-600" />
              </div>
              <div className="text-sm font-semibold text-white">
                Platform Focus
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-500">
                Distributed systems, developer velocity, and production
                reliability.
              </div>
            </div>
            <div className="border border-neutral-800 bg-neutral-950/70 p-4">
              <Cpu size={18} className={currentColors.text} />
              <div className="mt-4 text-sm font-semibold text-white">
                System Shape
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-500">
                Event streams, state machines, automation, and observability.
              </div>
            </div>
            <div className="border border-neutral-800 bg-neutral-950/70 p-4">
              <Database size={18} className={currentColors.text} />
              <div className="mt-4 text-sm font-semibold text-white">
                Data Layer
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-500">
                Warehouses, vectors, queues, migrations, and semantic models.
              </div>
            </div>
          </aside>
        </div>

        <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-4 md:hidden">
          {experiences.map((exp, index) => {
            const colors = colorConfig[exp.color as keyof typeof colorConfig];
            return (
              <button
                key={exp.pid}
                onClick={() => onSlideChange(index)}
                className="p-2"
                aria-label={`Show ${exp.company}`}
              >
                <span
                  className={`block h-3 w-3 rounded-full ${
                    index === activeIndex ? colors.dot : 'bg-slate-700'
                  }`}
                  style={{
                    boxShadow:
                      index === activeIndex
                        ? `0 0 14px ${colors.accent}`
                        : 'none',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
