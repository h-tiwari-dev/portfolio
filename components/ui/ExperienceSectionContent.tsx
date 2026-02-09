'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, Calendar, ChevronRight } from 'lucide-react';

const experiences = [
  {
    pid: 'PID_1024',
    company: 'WellnessLiving',
    role: 'Sr. Software Engineer',
    period: '2025 - PRESENT',
    status: 'STABLE_EXEC',
    isActive: true,
    color: 'amber',
    highlights: [
      'Real-time warehouse (Debezium → Kafka → ClickHouse) with semantic layer',
      'Cut time-to-insight 80% and ad-hoc SQL 60%',
      'pgvector LLM conversation intelligence on transcripts',
      'Stateless WebSocket platform via Kafka backplane',
      '35% fewer disconnects, 18% fewer support tickets',
    ],
    tech: ['KAFKA', 'CLICKHOUSE', 'PGVECTOR', 'K8S', 'DEBEZIUM'],
  },
  {
    pid: 'PID_0892',
    company: 'Kusho',
    role: 'Full Stack Developer',
    period: '2023 - 2025',
    status: 'TERMINATED_EXIT_0',
    isActive: false,
    color: 'cyan',
    highlights: [
      'React Flow builder with 50+ nodes, sub-200ms UI',
      '40% faster test runs with visual test builder',
      'Playwright CDP automation with AST parsing',
      '3x coverage, 70% less manual effort',
      'Redis RQ + Pinecone: 45% higher throughput',
    ],
    tech: ['REACT_FLOW', 'PLAYWRIGHT', 'REDIS', 'PINECONE', 'GRAFANA'],
  },
  {
    pid: 'PID_0441',
    company: 'Castler',
    role: 'Full Stack Developer',
    period: '2021 - 2023',
    status: 'TERMINATED_EXIT_0',
    isActive: false,
    color: 'purple',
    highlights: [
      'Event-driven payments: INR 50Cr+/mo, 2M+ txns',
      'Sub-200ms latency, 35% lower cost',
      'Banking Security: cut critical vulns 40%',
      'Migrated 200GB MongoDB → MySQL via Airflow',
      'React 18 + XState: 60% faster workflow creation',
    ],
    tech: ['KAFKA', 'REDIS', 'MONGODB', 'XSTATE', 'AIRFLOW'],
  },
];

const colorConfig = {
  amber: {
    bg: 'from-rose-500/20 via-rose-500/5 to-transparent',
    border: 'border-rose-900',
    text: 'text-rose-400',
    glow: '',
    dot: 'bg-rose-500',
    tag: 'bg-rose-950 border-rose-900 text-rose-300',
    accent: '#ff3366',
  },
  cyan: {
    bg: 'from-yellow-400/20 via-yellow-400/5 to-transparent',
    border: 'border-yellow-900',
    text: 'text-yellow-400',
    glow: '',
    dot: 'bg-yellow-400',
    tag: 'bg-yellow-950 border-yellow-900 text-yellow-300',
    accent: '#ffcc00',
  },
  purple: {
    bg: 'from-orange-500/20 via-orange-500/5 to-transparent',
    border: 'border-orange-900',
    text: 'text-orange-400',
    glow: '',
    dot: 'bg-orange-500',
    tag: 'bg-orange-950 border-orange-900 text-orange-300',
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
  const totalSlides = experiences.length;
  const currentColors =
    colorConfig[experiences[activeIndex].color as keyof typeof colorConfig];
  const progress = activeIndex / (totalSlides - 1);

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentColors.bg} z-[1] transition-all duration-500 pointer-events-none`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/80 z-[1] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-4 left-3 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-neutral-950 flex items-center justify-center border ${currentColors.border} transition-colors duration-500`}
          >
            <Activity
              size={16}
              className={`${currentColors.text} transition-colors duration-500 sm:w-5 sm:h-5`}
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Experience
            </h2>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Swipe to explore
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress counter */}
      <div className="absolute top-4 right-3 sm:top-6 sm:right-6 md:top-8 md:right-20 z-20">
        <div className="text-right">
          <span
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${currentColors.text} transition-colors duration-500`}
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-base sm:text-lg md:text-xl text-slate-600 mx-0.5 sm:mx-1">/</span>
          <span className="text-base sm:text-lg md:text-xl text-slate-500">
            {String(totalSlides).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar - left side */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-8 z-20 hidden md:block">
        <div className="flex flex-col gap-3">
          {experiences.map((exp, i) => (
            <button
              key={exp.pid}
              onClick={() => onSlideChange(i)}
              className="group flex items-center gap-3"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? `scale-150 ${
                        colorConfig[exp.color as keyof typeof colorConfig].dot
                      }`
                    : i < activeIndex
                    ? colorConfig[exp.color as keyof typeof colorConfig].dot +
                      ' opacity-50'
                    : 'bg-slate-600'
                }`}
                style={{
                  boxShadow:
                    i === activeIndex
                      ? `0 0 15px ${
                          colorConfig[exp.color as keyof typeof colorConfig]
                            .accent
                        }`
                      : 'none',
                }}
              />
              <span
                className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                  i === activeIndex
                    ? colorConfig[exp.color as keyof typeof colorConfig].text
                    : 'text-slate-600 group-hover:text-slate-400'
                }`}
              >
                {exp.company}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal slides container */}
      <div className="absolute inset-0 z-10">
        <motion.div
          className="h-full flex"
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
        >
          {experiences.map((exp, index) => {
            const colors = colorConfig[exp.color as keyof typeof colorConfig];
            const isActive = index === activeIndex;

            return (
              <div
                key={exp.pid}
                className="min-w-full h-full flex items-center justify-center px-3 sm:px-4 md:px-16 lg:px-24 pb-24 sm:pb-16 md:pb-0"
              >
                <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 items-center">
                  {/* Content Card */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.95,
                      y: isActive ? 0 : 20,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`lg:col-span-3 relative p-4 sm:p-6 md:p-8 border ${
                      colors.border
                    } bg-neutral-950 ${
                      isActive ? colors.glow : ''
                    }`}
                  >
                    {/* Status badge - Simplified on mobile */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
                      {exp.isActive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-950 border border-green-900">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-mono text-green-400">
                            Current
                          </span>
                        </div>
                      )}
                      <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 hidden sm:inline">
                        {exp.pid}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-2 md:mb-3 leading-tight">
                      {exp.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                      <span
                        className={`text-base sm:text-lg md:text-xl font-mono font-bold ${colors.text} flex items-center gap-1.5 sm:gap-2`}
                      >
                        <Building2 size={14} className="opacity-60 sm:w-4 sm:h-4" />
                        {exp.company}
                      </span>
                      <span className="flex items-center gap-1 sm:gap-1.5 text-slate-400 text-[11px] sm:text-xs md:text-sm font-mono">
                        <Calendar size={11} className="sm:w-3 sm:h-3" />
                        {exp.period}
                      </span>
                    </div>

                    {/* Highlights - Show fewer on mobile */}
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-4 sm:mb-6 md:mb-8">
                      {exp.highlights.slice(0, 3).map((point, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0.5,
                            x: isActive ? 0 : -10,
                          }}
                          transition={{
                            delay: isActive ? i * 0.05 : 0,
                            duration: 0.3,
                          }}
                          className="flex items-start gap-1.5 sm:gap-2 md:gap-3"
                        >
                          <ChevronRight
                            size={12}
                            className={`${colors.text} mt-0.5 shrink-0 sm:w-3.5 sm:h-3.5`}
                          />
                          <span className="text-[11px] sm:text-xs md:text-sm text-slate-300 leading-relaxed">
                            {point}
                          </span>
                        </motion.div>
                      ))}
                      {/* Show remaining highlights only on larger screens */}
                      <div className="hidden sm:block">
                        {exp.highlights.slice(3).map((point, i) => (
                          <motion.div
                            key={i + 3}
                            initial={false}
                            animate={{
                              opacity: isActive ? 1 : 0.5,
                              x: isActive ? 0 : -10,
                            }}
                            transition={{
                              delay: isActive ? (i + 3) * 0.05 : 0,
                              duration: 0.3,
                            }}
                            className="flex items-start gap-2 md:gap-3 mt-2 md:mt-3"
                          >
                            <ChevronRight
                              size={14}
                              className={`${colors.text} mt-0.5 shrink-0`}
                            />
                            <span className="text-xs md:text-sm text-slate-300 leading-relaxed">
                              {point}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                      {exp.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className={`text-[8px] sm:text-[9px] md:text-[10px] font-mono px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 border ${colors.tag}`}
                        >
                          {t}
                        </span>
                      ))}
                      {/* Show remaining tech only on larger screens */}
                      {exp.tech.slice(4).map((t) => (
                        <span
                          key={t}
                          className={`hidden sm:inline text-[9px] md:text-[10px] font-mono px-2 md:px-3 py-1 md:py-1.5 border ${colors.tag}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Visual element */}
                  <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.2,
                        scale: isActive ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div
                        className={`text-[120px] font-black ${colors.text} opacity-20 leading-none`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div
                        className={`text-sm font-mono ${colors.text} opacity-50 mt-2 uppercase tracking-widest`}
                      >
                        {exp.company}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom scroll indicator - Hidden on mobile where we have bottom nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:block"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {activeIndex < totalSlides - 1
              ? 'Scroll to continue'
              : 'Scroll down to continue'}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-5 h-8 md:w-6 md:h-10 border-2 ${currentColors.border} flex items-start justify-center p-1.5 md:p-2 transition-colors duration-500`}
          >
            <motion.div
              className={`w-1 h-1 md:w-1.5 md:h-1.5 ${currentColors.dot} transition-colors duration-500`}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile progress dots - Larger touch targets */}
      <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-4 md:hidden">
        {experiences.map((exp, i) => (
          <button
            key={exp.pid}
            onClick={() => onSlideChange(i)}
            className="p-2 touch-manipulation"
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? `${
                      colorConfig[exp.color as keyof typeof colorConfig].dot
                    } scale-125`
                  : i < activeIndex
                  ? `${
                      colorConfig[exp.color as keyof typeof colorConfig].dot
                    } opacity-50`
                  : 'bg-slate-600'
              }`}
              style={{
                boxShadow:
                  i === activeIndex
                    ? `0 0 12px ${
                        colorConfig[exp.color as keyof typeof colorConfig].accent
                      }`
                    : 'none',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
