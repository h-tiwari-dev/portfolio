'use client';

import React, { useState } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  BookOpen,
  FileDown,
  Clock,
  MapPin,
  Zap,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import ContactModal from '@/components/common/ContactModal';
import { motion } from 'framer-motion';

export default function Socials() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const links = [
    {
      icon: Github,
      label: 'GitHub',
      description: 'Check out my projects',
      url: 'https://github.com/h-tiwari-dev',
      color: '#ffffff',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      description: "Let's connect professionally",
      url: 'https://www.linkedin.com/in/tiwari-ai-harsh/',
      color: '#0a66c2',
    },
    {
      icon: BookOpen,
      label: 'Blog',
      description: 'Read my tech articles',
      url: 'https://betriumalpha.hashnode.dev',
      color: '#a855f7',
    },
    {
      icon: Mail,
      label: 'Email',
      description: 'Send me a message',
      onClick: () => setIsContactOpen(true),
      color: '#f43f5e',
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-lg md:max-w-4xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 md:mb-2">
            Get In Touch
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-400">
            Open for freelance & full-time opportunities
          </p>
        </div>

        {/* Desktop: Two column layout | Mobile: Stacked */}
        <div className="md:grid md:grid-cols-2 md:gap-8">
          {/* Left Column - Info & Resume */}
          <div>
            {/* Quick Info Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 sm:p-3 md:p-4 text-center"
              >
                <MapPin size={14} className="text-cyan-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-[10px] sm:text-xs text-slate-400 block">Location</span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">India</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 sm:p-3 md:p-4 text-center"
              >
                <Clock size={14} className="text-yellow-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-[10px] sm:text-xs text-slate-400 block">Timezone</span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">IST +5:30</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 sm:p-3 md:p-4 text-center"
              >
                <Zap size={14} className="text-green-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-[10px] sm:text-xs text-slate-400 block">Response</span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">&lt; 24h</span>
              </motion.div>
            </div>

            {/* Resume Download */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
              className="group w-full mb-4 sm:mb-5 md:mb-0 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileDown size={18} className="text-white md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-white block">
                      Download Resume
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm text-slate-400">
                      PDF • Updated Jan 2025
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-rose-400/60 group-hover:text-rose-400 group-hover:translate-x-1 transition-all md:w-5 md:h-5" />
              </div>
            </motion.button>
          </div>

          {/* Right Column - Social Links */}
          <div>
            {/* Mobile: Horizontal icons | Desktop: Card list */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:hidden mb-4">
              {links.map((item, i) => (
                <button
                  key={i}
                  onClick={item.onClick || (() => window.open(item.url, '_blank'))}
                  className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center"
                >
                  <item.icon
                    size={20}
                    className="text-slate-400 group-hover:text-white transition-colors sm:w-6 sm:h-6"
                  />
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ boxShadow: `0 0 20px -5px ${item.color}50` }}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Desktop: Full card links */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-3">
              {links.map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={item.onClick || (() => window.open(item.url, '_blank'))}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 text-left"
                  style={{
                    ['--hover-color' as string]: item.color,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <item.icon
                      size={18}
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white block group-hover:text-white/90">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.description}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred Contact Note - Mobile only */}
        <div className="text-center md:hidden mt-2">
          <p className="text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Preferred:</span> Email or LinkedIn
          </p>
        </div>

        {/* Status Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 sm:mt-5 md:mt-8 pt-3 sm:pt-4 border-t border-white/5 flex justify-center"
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm text-slate-500">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Available for new projects • Preferred: Email or LinkedIn</span>
          </div>
        </motion.div>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
