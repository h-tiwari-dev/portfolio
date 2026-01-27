'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  label: string;
}

interface ScrollNavProps {
  sections: Section[];
}

const experienceItems = [
  { company: 'WellnessLiving', color: '#ff3366' },
  { company: 'Kusho', color: '#ffcc00' },
  { company: 'Castler', color: '#ff5500' },
];

export default function ScrollNav({ sections }: ScrollNavProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [experienceProgress, setExperienceProgress] = useState(0);
  const [activeExperience, setActiveExperience] = useState(0);
  const [isInExperience, setIsInExperience] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section, index) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setActiveSection(index);
              setIsInExperience(section.id === 'experience');
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '-10% 0px -10% 0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    // Track experience scroll progress
    const handleScroll = () => {
      const experienceSection = document.getElementById('experience');
      if (!experienceSection) return;

      const rect = experienceSection.getBoundingClientRect();
      const sectionHeight = experienceSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom >= viewportHeight) {
        const scrolled = -rect.top;
        const scrollableHeight = sectionHeight - viewportHeight;
        const progress = Math.min(Math.max(scrolled / scrollableHeight, 0), 1);
        setExperienceProgress(progress);
        setActiveExperience(
          Math.min(
            Math.floor(progress * experienceItems.length),
            experienceItems.length - 1
          )
        );
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const currentColor = isInExperience
    ? experienceItems[activeExperience]?.color || '#ff3366'
    : '#ff3366';

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background pill */}
      <motion.div
        className="absolute inset-y-0 -inset-x-3 bg-background/60 backdrop-blur-md rounded-full border border-white/10 -z-10"
        animate={{
          borderColor: isInExperience
            ? `${currentColor}30`
            : 'rgba(255,255,255,0.1)',
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex flex-col items-center gap-4 py-4 px-2">
        {/* Progress line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-white/10">
          <motion.div
            className="absolute top-0 left-0 w-full"
            style={{ backgroundColor: currentColor }}
            initial={{ height: '0%' }}
            animate={{
              height: isInExperience
                ? `${
                    ((sections.findIndex((s) => s.id === 'experience') +
                      experienceProgress) /
                      sections.length) *
                    100
                  }%`
                : `${((activeSection + 1) / sections.length) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {sections.map((section, index) => {
          const isActive = activeSection === index;
          const isPast = index < activeSection;
          const isExperienceSection = section.id === 'experience';

          return (
            <div key={section.id} className="relative">
              <button
                onClick={() => scrollToSection(section.id)}
                className="group relative flex items-center justify-end gap-3 z-10"
              >
                {/* Label */}
                <AnimatePresence>
                  {(isHovered || isActive) && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-8 whitespace-nowrap text-[10px] font-mono uppercase tracking-widest transition-colors duration-300"
                      style={{
                        color: isActive
                          ? isExperienceSection && isInExperience
                            ? currentColor
                            : '#ff3366'
                          : isPast
                          ? '#ffcc00'
                          : '#64748b',
                      }}
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot indicator */}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeRing"
                      className="absolute -inset-1.5 rounded-full border"
                      style={{ borderColor: `${currentColor}50` }}
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute -inset-2 rounded-full blur-md"
                      style={{ backgroundColor: `${currentColor}30` }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <motion.div
                    className="relative w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isActive
                        ? currentColor
                        : isPast
                        ? '#ffcc00'
                        : '#475569',
                      boxShadow: isActive ? `0 0 12px ${currentColor}` : 'none',
                    }}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                </div>
              </button>

              {/* Experience sub-items */}
              <AnimatePresence>
                {isExperienceSection && isInExperience && isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      {experienceItems.map((exp, i) => (
                        <motion.div
                          key={exp.company}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <AnimatePresence>
                            {(isHovered || i === activeExperience) && (
                              <motion.span
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 5 }}
                                className="text-[8px] font-mono uppercase tracking-wider whitespace-nowrap"
                                style={{
                                  color:
                                    i === activeExperience
                                      ? exp.color
                                      : '#64748b',
                                }}
                              >
                                {exp.company}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <div
                            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                i <= activeExperience ? exp.color : '#475569',
                              transform:
                                i === activeExperience
                                  ? 'scale(1.3)'
                                  : 'scale(1)',
                              boxShadow:
                                i === activeExperience
                                  ? `0 0 8px ${exp.color}`
                                  : 'none',
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Section counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="mt-2 text-[9px] font-mono flex items-center gap-1"
          style={{ color: currentColor }}
        >
          <span>{String(activeSection + 1).padStart(2, '0')}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500">
            {String(sections.length).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
    </motion.nav>
  );
}
