'use client';

import Image from 'next/image';
import {
  Cpu,
  ChevronDown,
  FileDown,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 py-6 sm:p-6 md:p-8 text-center relative overflow-hidden group">
      {/* Profile Image with Enhanced Glow */}
      <div className="relative mb-4 sm:mb-6 md:mb-8 group shrink-0">
        <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-rose-500 to-yellow-400 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity duration-1000"></div>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(255,51,102,0.3)]">
          <Image
            src="/profile.jpeg"
            alt="Harsh Tiwari"
            width={320}
            height={320}
            className="object-cover w-full h-full grayscale-[50%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
            priority
          />
        </div>
        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 md:-bottom-3 md:-right-3 bg-slate-900 border border-rose-500/50 p-1 sm:p-1.5 rounded-lg shadow-lg">
          <Cpu size={14} className="text-rose-400 animate-spin-slow sm:w-4 sm:h-4" />
        </div>
      </div>

      {/* Introduction with Premium Typography */}
      <div className="text-center z-10 max-w-2xl relative w-full">
        {/* Subtle backdrop for text legibility */}
        <div className="absolute inset-x-0 inset-y-[-40px] bg-[#0c0b0a]/70 blur-3xl rounded-full -z-10"></div>

        {/* Security Level Badge - Hidden on mobile for cleaner look */}
        <div className="hidden sm:flex items-center justify-center space-x-3 mb-4">
          <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-rose-500/50"></span>
          <span className="text-[10px] sm:text-[11px] font-mono text-rose-400 tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            Security Level 10
          </span>
          <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-rose-500/50"></span>
        </div>

        {/* Mobile-only simple badge */}
        <div className="flex sm:hidden justify-center mb-3">
          <span className="text-[10px] font-mono text-rose-400 tracking-wider uppercase px-3 py-1 border border-rose-500/20 rounded-full">
            Sr. Engineer
          </span>
        </div>

        <div className="relative mb-3 sm:mb-4">
          {/* Main Title Layer */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight sm:tracking-tighter text-white leading-tight relative z-10">
            <span className="block sm:inline">SOFTWARE</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-300 to-orange-400 bg-[length:200%_100%] animate-[text-shimmer_3s_infinite_linear]">
              ENGINEER
            </span>
          </h1>
        </div>

        <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto px-2">
          Building{' '}
          <span className="text-rose-400 font-semibold">
            scalable platforms
          </span>{' '}
          and{' '}
          <span className="text-yellow-400 font-semibold">
            AI infrastructure
          </span>
          . Focused on event-driven architectures.
        </p>

        {/* CTA Buttons - Optimized for mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2">
          {/* Resume Button */}
          <motion.button
            onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 hover:border-rose-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <FileDown size={18} className="text-rose-400" />
            <span className="text-sm font-medium text-white">
              Download Resume
            </span>
            <ExternalLink
              size={14}
              className="text-rose-500/40 group-hover:text-rose-400 transition-colors"
            />
          </motion.button>

          {/* Blog Button */}
          <motion.button
            onClick={() =>
              window.open('https://betriumalpha.hashnode.dev', '_blank')
            }
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl hover:bg-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <BookOpen size={18} className="text-yellow-400" />
            <span className="text-sm font-medium text-white">
              Read Blog
            </span>
            <ExternalLink
              size={14}
              className="text-yellow-400/40 group-hover:text-yellow-400 transition-colors"
            />
          </motion.button>
        </div>

        {/* Status indicators - Simplified on mobile */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[11px] sm:text-xs text-green-400 font-medium">
              Available
            </span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-xs text-slate-400">Based in India</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Adjusted position for mobile */}
      <motion.div
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          Swipe
        </span>
        <ChevronDown size={18} className="text-rose-500/50 sm:w-5 sm:h-5" />
      </motion.div>
    </div>
  );
}
