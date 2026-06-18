'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code2, Cpu, Server, Database } from 'lucide-react';
import { useSection } from '@/contexts/SectionContext';

const skillCategories = [
  {
    name: 'Languages',
    icon: Code2,
    color: '#00f0ff',
    skills: ['Python', 'TypeScript', 'Go', 'SQL'],
  },
  {
    name: 'Backend & APIs',
    icon: Server,
    color: '#f8fafc',
    skills: [
      'Node.js',
      'NestJS',
      'REST APIs',
      'GraphQL',
      'WebSockets',
      'OAuth 2.0',
      'Rate Limiting',
      'Microservices',
      'Event-Driven Architecture',
      'Distributed Systems',
    ],
  },
  {
    name: 'Data & Infrastructure',
    icon: Database,
    color: '#ff3300',
    skills: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Kafka',
      'Redshift',
      'Airbyte',
      'AWS',
      'Docker',
      'Kubernetes',
      'CI/CD',
    ],
  },
  {
    name: 'AI/ML',
    icon: Cpu,
    color: '#9d00ff',
    skills: [
      'LLM APIs',
      'Gemini',
      'Agentic Workflows',
      'Function Calling',
      'Tool Execution',
      'RAG',
      'Vector Databases',
      'Qwen3-ASR/TTS',
      'LiveKit',
      'CUDA/GPU Inference',
      'Prompt Engineering',
      'AI Evaluation',
    ],
  },
];

export default function Skills() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { activeSkillCategory, setActiveSkillCategory } = useSection();

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleExpand = (index: number) => {
    if (!isDesktop) {
      const nextIndex = expandedIndex === index ? null : index;
      setExpandedIndex(nextIndex);
      setActiveSkillCategory(nextIndex);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center md:justify-end pb-20 sm:pb-24 md:pb-12 pointer-events-none px-3 sm:px-4 md:px-8">
      <div className="pointer-events-auto w-full max-w-[320px] sm:max-w-md md:max-w-xl mx-auto md:mx-0 md:ml-auto">
        {/* Section header with responsive title and contextual subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 md:mb-6 md:text-right"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
            Tech Stack
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-slate-400">
            <span className="md:hidden">Tap categories to isolate orbits</span>
            <span className="hidden md:inline">
              Hover a category, then click a planet in orbit
            </span>
          </p>
        </motion.div>

        {/* Mobile layout: Accordion-style cards that expand on tap to reveal skills */}
        <div className="md:hidden space-y-2 sm:space-y-3">
          {skillCategories.map((category, idx) => {
            const isExpanded = expandedIndex === idx;
            const Icon = category.icon;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => toggleExpand(idx)}
                  className={`w-full bg-neutral-950 border transition-all duration-300 overflow-hidden text-left ${
                    isExpanded ? '' : 'border-neutral-800'
                  }`}
                  style={{
                    borderColor: isExpanded ? category.color : undefined,
                    boxShadow: isExpanded
                      ? `0 0 20px -5px ${category.color}`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                        style={{
                          backgroundColor: `${category.color}60`,
                          border: `1px solid ${category.color}60`,
                        }}
                      >
                        <Icon
                          size={18}
                          style={{ color: category.color }}
                          className="sm:w-5 sm:h-5"
                        />
                      </div>
                      <div>
                        <span
                          className="text-sm sm:text-base font-semibold block"
                          style={{
                            color: isExpanded ? category.color : '#fff',
                          }}
                        >
                          {category.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500">
                          {category.skills.length} skills
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown
                        size={18}
                        className="text-slate-400 sm:w-5 sm:h-5"
                      />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
                          <div className="border-t border-neutral-800 pt-3">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {category.skills.map((skill, skillIdx) => (
                                <motion.span
                                  key={skill}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: skillIdx * 0.05,
                                    duration: 0.2,
                                  }}
                                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium border"
                                  style={{
                                    backgroundColor: `${category.color}25`,
                                    borderColor: `${category.color}60`,
                                    color: category.color,
                                  }}
                                >
                                  {skill}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop layout: 2x2 grid showing all skills without interaction required */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          {skillCategories.map((category, idx) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="cyber-bracket bg-neutral-950/85 border p-3 transition-all duration-300"
                onMouseEnter={() => setActiveSkillCategory(idx)}
                onMouseLeave={() => setActiveSkillCategory(null)}
                onFocus={() => setActiveSkillCategory(idx)}
                onBlur={() => setActiveSkillCategory(null)}
                style={{
                  borderColor:
                    activeSkillCategory === idx ? category.color : '#262626',
                  boxShadow:
                    activeSkillCategory === idx
                      ? `0 0 28px -12px ${category.color}`
                      : 'none',
                  ['--corner-color' as string]: category.color + '60',
                }}
              >
                {/* Icon badge with category name and skill count */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{
                      backgroundColor: `${category.color}60`,
                      border: `1px solid ${category.color}60`,
                    }}
                  >
                    <Icon size={20} style={{ color: category.color }} />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-white block">
                      {category.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {category.skills.length} orbital bodies
                    </span>
                  </div>
                </div>

                {/* Skill tags with hover effects - no toggle needed on larger screens */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-xs font-medium border transition-transform hover:scale-105"
                      style={{
                        backgroundColor: `${category.color}25`,
                        borderColor: `${category.color}60`,
                        color: category.color,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
