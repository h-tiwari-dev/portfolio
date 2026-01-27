'use client';

import { Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Skills() {
  const categories = [
    {
      name: 'Languages',
      color: '#00f0ff', // Cyan
      description: 'Core programming languages',
    },
    {
      name: 'Frontend',
      color: '#ffffff', // White
      description: 'Web & UI frameworks',
    },
    {
      name: 'Backend',
      color: '#ff3300', // Red-Orange
      description: 'Server & Infrastructure',
    },
    {
      name: 'Data/ML',
      color: '#9d00ff', // Electric Purple
      description: 'Database & Intelligence',
    },
  ];

  return (
    <div className="h-full flex flex-col justify-end pb-12 pointer-events-none">
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl max-w-sm ml-auto mr-auto md:mr-0 md:ml-auto">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <Globe className="text-[#00f0ff]" size={18} />
          <h3 className="text-sm font-bold tracking-widest text-white uppercase">
            Skill System
          </h3>
        </div>

        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 group"
            >
              <div
                className="w-2 h-2 rounded-full shadow-[0_0_8px]"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: `0 0 8px ${cat.color}`,
                }}
              />
              <div className="flex flex-col">
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase transition-colors"
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {cat.description}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[9px] font-mono text-slate-500 text-right">
          Interactive 3D Visualization
        </div>
      </div>
    </div>
  );
}
