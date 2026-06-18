'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileDown,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalWidget from '@/components/ui/TerminalWidget';

const metrics = [
  { value: '<1s', label: 'voice-agent response target' },
  { value: '2M+', label: 'monthly transactions' },
  { value: '50+', label: 'workflow node types' },
];

export default function Hero() {
  return (
    <div className="relative h-full w-full overflow-hidden px-4 py-6 sm:p-6 md:p-8">
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center gap-8 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:gap-12">
        <div className="max-w-3xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex items-center gap-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-rose-500/40 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <Image
                src="/profile.jpeg"
                alt="Harsh Tiwari"
                width={192}
                height={192}
                className="h-full w-full object-cover grayscale-[35%]"
                priority
              />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-rose-300">
                <span className="relative inline-flex text-rose-400">
                  <Activity size={13} />
                  <span className="available-ring text-rose-500/50" />
                </span>
                Available
              </div>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                Harsh Tiwari
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={13} className="text-amber-300" />
                Bengaluru, India
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="hero-role-stage"
          >
            <h1 className="hero-role-title text-4xl font-black leading-[0.92] sm:text-5xl md:text-7xl lg:text-8xl">
              <span className="hero-role-word" data-word="Senior">
                <span className="hero-role-face">Senior</span>
              </span>
              <span className="hero-role-word" data-word="Software">
                <span className="hero-role-face">Software</span>
              </span>
              <span
                className="hero-role-word hero-role-word--accent"
                data-word="Engineer"
              >
                <span className="hero-role-face">Engineer</span>
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl"
          >
            I build production Voice AI systems, LLM microservices, real-time
            media backends, and distributed platforms that stay fast under live
            customer traffic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.55 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
              className="button-3d button-3d--rose flex w-full items-center justify-center gap-3 px-5 py-3 text-sm font-medium sm:w-auto"
            >
              <span className="button-3d__icon">
                <FileDown size={17} />
              </span>
              <span className="button-3d__label">Resume</span>
              <ExternalLink size={14} className="button-3d__trailing" />
            </button>

            <Link
              href="/blog"
              className="button-3d button-3d--gold flex w-full items-center justify-center gap-3 px-5 py-3 text-sm font-medium sm:w-auto"
            >
              <span className="button-3d__icon">
                <BookOpen size={17} />
              </span>
              <span className="button-3d__label">Blog</span>
              <ArrowRight size={14} className="button-3d__trailing" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="hidden md:block"
        >
          <TerminalWidget />

          <div className="mt-3 grid grid-cols-3 gap-2">
            {metrics.map((metric) => (
              <div
                key={metric.value}
                className="metric-card border border-neutral-800/60 bg-neutral-950/50 p-3 text-center"
              >
                <div className="text-base font-black tabular-nums text-amber-400">
                  {metric.value}
                </div>
                <div className="mt-1 text-[9px] leading-snug text-slate-600">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
