'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import Skills from '@/components/ui/Skills';
import Socials from '@/components/ui/Socials';
import ExperienceSectionContent from '@/components/ui/ExperienceSectionContent';
import ThreeBackground from '@/components/three/ThreeBackground';
import { useSection } from '@/contexts/SectionContext';

// Context for sharing scroll state
interface ScrollContextType {
  currentSection: number;
  currentExperienceSlide: number;
  totalSections: number;
  totalExperienceSlides: number;
  goToSection: (index: number) => void;
  goToExperienceSlide: (index: number) => void;
  isAnimating: boolean;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context)
    throw new Error('useScrollContext must be used within FullPageScroll');
  return context;
};

const sections = [
  { id: 'hero', label: 'Identity' },
  { id: 'experience', label: 'Lifeline' },
  { id: 'skills', label: 'Stack' },
  { id: 'connect', label: 'Comms' },
];

const experienceSlideCount = 3;
const experienceSectionIndex = 1;

export default function FullPageScrollPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentExperienceSlide, setCurrentExperienceSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const { setActiveSection } = useSection();

  const totalSections = sections.length;
  const scrollCooldown = 700; // ms between scroll actions

  // Calculate if we're in experience section
  const isInExperience = currentSection === experienceSectionIndex;

  // Sync active section with SectionContext for ThreeBackground
  useEffect(() => {
    setActiveSection(sections[currentSection].id);
  }, [currentSection, setActiveSection]);

  // Navigate to a section
  const goToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSections || isAnimating) return;

      setIsAnimating(true);
      setCurrentSection(index);

      // Reset experience slide when entering experience section
      if (index === experienceSectionIndex) {
        setCurrentExperienceSlide(0);
      }

      setTimeout(() => setIsAnimating(false), scrollCooldown);
    },
    [totalSections, isAnimating]
  );

  // Navigate to experience slide
  const goToExperienceSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= experienceSlideCount || isAnimating) return;

      setIsAnimating(true);
      setCurrentExperienceSlide(index);

      setTimeout(() => setIsAnimating(false), scrollCooldown);
    },
    [isAnimating]
  );

  // Handle scroll direction
  const handleScroll = useCallback(
    (direction: 'up' | 'down') => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown || isAnimating) return;
      lastScrollTime.current = now;

      if (direction === 'down') {
        if (isInExperience) {
          // In experience section - navigate slides first
          if (currentExperienceSlide < experienceSlideCount - 1) {
            goToExperienceSlide(currentExperienceSlide + 1);
          } else {
            // At last slide, go to next section
            goToSection(currentSection + 1);
          }
        } else {
          // Normal section navigation
          goToSection(currentSection + 1);
        }
      } else {
        if (isInExperience) {
          // In experience section - navigate slides first
          if (currentExperienceSlide > 0) {
            goToExperienceSlide(currentExperienceSlide - 1);
          } else {
            // At first slide, go to previous section
            goToSection(currentSection - 1);
          }
        } else {
          // Normal section navigation
          goToSection(currentSection - 1);
        }
      }
    },
    [
      currentSection,
      currentExperienceSlide,
      isInExperience,
      goToSection,
      goToExperienceSlide,
      isAnimating,
    ]
  );

  // Wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Determine scroll direction with threshold
      if (Math.abs(e.deltaY) < 10) return;

      const direction = e.deltaY > 0 ? 'down' : 'up';
      handleScroll(direction);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleScroll]);

  // Touch event handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;

      // Minimum swipe distance
      if (Math.abs(deltaY) < 50) return;

      const direction = deltaY > 0 ? 'down' : 'up';
      handleScroll(direction);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleScroll('down');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleScroll('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScroll]);

  const contextValue: ScrollContextType = {
    currentSection,
    currentExperienceSlide,
    totalSections,
    totalExperienceSlides: experienceSlideCount,
    goToSection,
    goToExperienceSlide,
    isAnimating,
  };

  // Get current experience color
  const experienceColors = ['#ff3366', '#ffcc00', '#ff5500'];
  const currentColor = isInExperience
    ? experienceColors[currentExperienceSlide] || '#ff3366'
    : '#ff3366';

  return (
    <ScrollContext.Provider value={contextValue}>
      <main
        ref={containerRef}
        className="fixed inset-0 overflow-hidden bg-background"
      >
        {/* Three.js Globe Background - Fixed */}
        <ThreeBackground />

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-[1]"></div>
        <div className="fixed inset-0 scanlines pointer-events-none z-[1]"></div>

        {/* Sections container */}
        <motion.div
          className="h-full w-full relative z-10"
          animate={{ y: `-${currentSection * 100}%` }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
        >
          {/* Hero Section */}
          <section
            id="hero"
            className="h-screen w-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-4xl mx-auto">
              <Hero />
            </div>
          </section>

          {/* Experience Section */}
          <section id="experience" className="h-screen w-full">
            <ExperienceSectionContent
              activeIndex={currentExperienceSlide}
              onSlideChange={goToExperienceSlide}
            />
          </section>

          {/* Skills Section */}
          <section id="skills" className="h-screen w-full">
            <div className="w-full h-full p-4 md:p-8 max-w-7xl mx-auto">
              <Skills />
            </div>
          </section>

          {/* Connect Section */}
          <section
            id="connect"
            className="h-screen w-full flex items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-4xl mx-auto bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 shadow-[0_0_30px_-12px_rgba(6,182,212,0.15)]">
              <Socials />
            </div>
          </section>
        </motion.div>

        {/* Navigation */}
        <ScrollNav
          sections={sections}
          currentSection={currentSection}
          currentExperienceSlide={currentExperienceSlide}
          isInExperience={isInExperience}
          currentColor={currentColor}
          goToSection={goToSection}
          goToExperienceSlide={goToExperienceSlide}
        />
      </main>
    </ScrollContext.Provider>
  );
}

// Integrated ScrollNav component
interface ScrollNavProps {
  sections: { id: string; label: string }[];
  currentSection: number;
  currentExperienceSlide: number;
  isInExperience: boolean;
  currentColor: string;
  goToSection: (index: number) => void;
  goToExperienceSlide: (index: number) => void;
}

function ScrollNav({
  sections,
  currentSection,
  currentExperienceSlide,
  isInExperience,
  currentColor,
  goToSection,
  goToExperienceSlide,
}: ScrollNavProps) {
  const [isHovered, setIsHovered] = useState(false);

  const experienceItems = [
    { company: 'WellnessLiving', color: '#ff3366' },
    { company: 'Kusho', color: '#ffcc00' },
    { company: 'Castler', color: '#ff5500' },
  ];

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
            animate={{
              height: isInExperience
                ? `${
                    ((1 + currentExperienceSlide / 3) / sections.length) * 100
                  }%`
                : `${((currentSection + 1) / sections.length) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {sections.map((section, index) => {
          const isActive = currentSection === index;
          const isPast = index < currentSection;
          const isExperienceSection = section.id === 'experience';

          return (
            <div key={section.id} className="relative">
              <button
                onClick={() => goToSection(index)}
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
                        ? '#06b6d4'
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
                        <motion.button
                          key={exp.company}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2"
                          onClick={() => goToExperienceSlide(i)}
                        >
                          <AnimatePresence>
                            {(isHovered || i === currentExperienceSlide) && (
                              <motion.span
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 5 }}
                                className="text-[8px] font-mono uppercase tracking-wider whitespace-nowrap"
                                style={{
                                  color:
                                    i === currentExperienceSlide
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
                                i <= currentExperienceSlide
                                  ? exp.color
                                  : '#475569',
                              transform:
                                i === currentExperienceSlide
                                  ? 'scale(1.3)'
                                  : 'scale(1)',
                              boxShadow:
                                i === currentExperienceSlide
                                  ? `0 0 8px ${exp.color}`
                                  : 'none',
                            }}
                          />
                        </motion.button>
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
          <span>{String(currentSection + 1).padStart(2, '0')}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500">
            {String(sections.length).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
    </motion.nav>
  );
}
