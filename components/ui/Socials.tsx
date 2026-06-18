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
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Socials() {
  const links = [
    {
      icon: Github,
      label: 'GitHub',
      description: 'github.com/h-tiwari-dev',
      url: 'https://github.com/h-tiwari-dev',
      color: '#ffffff',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      description: 'linkedin.com/in/tiwari-ai-harsh',
      url: 'https://www.linkedin.com/in/tiwari-ai-harsh',
      color: '#0a66c2',
    },
    {
      icon: ExternalLink,
      label: 'Portfolio',
      description: 'tiwariaiharsh.com',
      url: 'https://tiwariaiharsh.com',
      color: '#00f0ff',
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
      description: 'h.tiwari.dev@gmail.com',
      url: 'mailto:h.tiwari.dev@gmail.com',
      color: '#f43f5e',
    },
    {
      icon: Phone,
      label: 'Mobile',
      description: '+91-7355517759',
      url: 'tel:+917355517759',
      color: '#22c55e',
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
            Senior Software Engineer — Bengaluru, India
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
                className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3 md:p-4 text-center"
              >
                <MapPin
                  size={14}
                  className="text-cyan-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
                <span className="text-[10px] sm:text-xs text-slate-400 block">
                  Location
                </span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">
                  Bengaluru
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3 md:p-4 text-center"
              >
                <Clock
                  size={14}
                  className="text-yellow-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
                <span className="text-[10px] sm:text-xs text-slate-400 block">
                  Timezone
                </span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">
                  IST +5:30
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3 md:p-4 text-center"
              >
                <Zap
                  size={14}
                  className="text-green-400 mx-auto mb-1 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
                <span className="text-[10px] sm:text-xs text-slate-400 block">
                  Response
                </span>
                <span className="text-xs sm:text-sm md:text-base text-white font-medium">
                  &lt; 24h
                </span>
              </motion.div>
            </div>

            {/* Resume Download */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4 sm:mb-5 md:mb-0"
            >
              <button
                onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
                className="button-3d button-3d--rose button-3d--wide group w-full p-3 text-left sm:p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="button-3d__icon h-10 w-10 md:h-12 md:w-12">
                      <FileDown size={18} className="md:h-6 md:w-6" />
                    </span>
                    <div className="text-left">
                      <span className="button-3d__label block text-sm font-semibold sm:text-base md:text-lg">
                        Download Resume
                      </span>
                      <span className="text-[10px] text-slate-400 sm:text-xs md:text-sm">
                        PDF • Current profile
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="button-3d__trailing md:h-5 md:w-5"
                  />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Right Column - Social Links */}
          <div>
            {/* Mobile: Horizontal icons | Desktop: Card list */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:hidden mb-4">
              {links.map((item, i) => (
                <button
                  key={i}
                  onClick={() => window.open(item.url, '_blank')}
                  className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 flex items-center justify-center"
                >
                  <item.icon
                    size={20}
                    className="text-slate-400 group-hover:text-white transition-colors sm:w-6 sm:h-6"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ boxShadow: `0 0 20px -5px ${item.color}` }}
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
                  onClick={() => window.open(item.url, '_blank')}
                  className="group flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 text-left"
                  style={{
                    ['--hover-color' as string]: item.color,
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.color}30`,
                      border: `1px solid ${item.color}60`,
                    }}
                  >
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.description}
                    </span>
                  </div>
                  <ExternalLink
                    size={14}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors"
                  />
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
          className="mt-4 sm:mt-5 md:mt-8 pt-3 sm:pt-4 border-t border-neutral-800 flex justify-center"
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm text-slate-500">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
            <span>h.tiwari.dev@gmail.com • +91-7355517759</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
