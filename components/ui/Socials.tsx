'use client';

import React from 'react';
import {
  Github,
  Linkedin,
  Mail,
  BookOpen,
  FileDown,
  Clock,
  MapPin,
  Phone,
  Zap,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const socials = [
  {
    icon: Github,
    label: 'GitHub',
    description: 'h-tiwari-dev',
    url: 'https://github.com/h-tiwari-dev',
    color: '#e2e8f0',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    description: 'tiwari-ai-harsh',
    url: 'https://www.linkedin.com/in/tiwari-ai-harsh',
    color: '#38bdf8',
  },
  {
    icon: ExternalLink,
    label: 'Portfolio',
    description: 'tiwariaiharsh.com',
    url: 'https://tiwariaiharsh.com',
    color: '#22d3ee',
  },
  {
    icon: BookOpen,
    label: 'Blog',
    description: 'betriumalpha.hashnode.dev',
    url: 'https://betriumalpha.hashnode.dev',
    color: '#a78bfa',
  },
  {
    icon: Mail,
    label: 'Email',
    description: 'h.tiwari.dev@gmail.com',
    url: 'mailto:h.tiwari.dev@gmail.com',
    color: '#fb7185',
  },
  {
    icon: Phone,
    label: 'Mobile',
    description: '+91-7355517759',
    url: 'tel:+917355517759',
    color: '#34d399',
  },
];

const stats = [
  { icon: MapPin,  label: 'Location',  value: 'Bengaluru', color: '#22d3ee' },
  { icon: Clock,   label: 'Timezone',  value: 'IST +5:30', color: '#fbbf24' },
  { icon: Zap,     label: 'Response',  value: '< 24h',     color: '#34d399' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Socials() {
  return (
    <div className="relative h-full w-full px-4 py-6 sm:px-6 md:px-8 md:py-8 flex flex-col justify-center">
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12 md:items-center">

        {/* ── Left column ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          {/* Status badge */}
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-green-400">
              Open to opportunities
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={item}>
            <h2 className="text-4xl font-black leading-[0.9] tracking-tight text-white sm:text-5xl md:text-5xl lg:text-6xl">
              Let's Build
              <br />
              <span className="text-rose-400">Something.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 md:text-base">
              Senior Software Engineer · Bengaluru, India
            </p>
          </motion.div>

          {/* Primary email CTA */}
          <motion.a
            variants={item}
            href="mailto:h.tiwari.dev@gmail.com"
            className="cyber-bracket group flex items-center justify-between border border-neutral-800/70 bg-neutral-950/60 p-4 backdrop-blur-sm transition-all duration-200 hover:border-rose-500/30 hover:bg-neutral-900/60"
            style={{ borderLeftWidth: '2px', borderLeftColor: 'rgba(225,29,72,0.5)' }}
          >
            <div>
              <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-slate-600">
                Primary contact
              </div>
              <div className="text-sm font-medium text-slate-200 transition-colors group-hover:text-rose-300 sm:text-base">
                h.tiwari.dev@gmail.com
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-rose-400"
            />
          </motion.a>

          {/* Stat pills */}
          <motion.div variants={item} className="grid grid-cols-3 gap-2">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="border border-neutral-800/60 bg-neutral-950/50 px-3 py-2.5 text-center"
                >
                  <Icon size={13} className="mx-auto mb-1.5" style={{ color: s.color }} />
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                    {s.label}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-300">
                    {s.value}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Resume download */}
          <motion.div variants={item}>
            <button
              onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
              className="button-3d button-3d--rose button-3d--wide group w-full p-3.5 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="button-3d__icon">
                    <FileDown size={18} />
                  </span>
                  <div>
                    <span className="button-3d__label block text-sm font-semibold">
                      Download Resume
                    </span>
                    <span className="text-[10px] text-slate-500">PDF · Updated Jun 2025</span>
                  </div>
                </div>
                <ArrowRight size={16} className="button-3d__trailing" />
              </div>
            </button>
          </motion.div>
        </motion.div>

        {/* ── Right column — social grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5 sm:gap-3"
        >
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.label}
                variants={item}
                onClick={() => window.open(s.url, '_blank')}
                className="cyber-bracket group relative flex flex-col gap-2.5 overflow-hidden border border-neutral-800/60 bg-neutral-950/60 p-3.5 text-left backdrop-blur-sm transition-all duration-200 sm:p-4"
                style={
                  {
                    borderLeftWidth: '2px',
                    borderLeftColor: `${s.color}40`,
                    '--hover-color': s.color,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = `${s.color}80`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px -8px ${s.color}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = `${s.color}40`;
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Icon */}
                <div
                  className="flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: `${s.color}15`,
                    border: `1px solid ${s.color}30`,
                  }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200 transition-colors duration-200 group-hover:text-white">
                    {s.label}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-slate-600">
                    {s.description}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowUpRight
                  size={13}
                  className="absolute right-3 top-3 text-slate-700 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  style={{ color: s.color }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center justify-center gap-1.5 border-t border-neutral-800/40 pt-4 md:mt-8"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="font-mono text-[10px] text-slate-600">
          h.tiwari.dev@gmail.com · +91-7355517759
        </span>
      </motion.div>
    </div>
  );
}
