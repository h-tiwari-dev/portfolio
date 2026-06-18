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
import { ChevronDown } from 'lucide-react';
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
  { id: 'hero', label: 'Home', icon: '01' },
  { id: 'experience', label: 'Work', icon: '02' },
  { id: 'skills', label: 'Skills', icon: '03' },
  { id: 'connect', label: 'Contact', icon: '04' },
];

const experienceSlideCount = 3;
const experienceSectionIndex = 1;
const sectionAccentColors = ['#ff3366', '#ffcc00', '#00f0ff', '#9d00ff'];

export default function FullPageScrollPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentExperienceSlide, setCurrentExperienceSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const { setActiveSection, setActiveSkillCategory } = useSection();

  const totalSections = sections.length;
  const scrollCooldown = 700;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle dynamic viewport height for mobile browsers
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  const isInExperience = currentSection === experienceSectionIndex;

  useEffect(() => {
    const nextSection = sections[currentSection].id;
    setActiveSection(nextSection);
    if (nextSection !== 'skills') {
      setActiveSkillCategory(null);
    }
  }, [currentSection, setActiveSection, setActiveSkillCategory]);

  const goToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSections || isAnimating) return;

      setIsAnimating(true);
      setCurrentSection(index);

      if (index === experienceSectionIndex) {
        setCurrentExperienceSlide(0);
      }

      setTimeout(() => setIsAnimating(false), scrollCooldown);
    },
    [totalSections, isAnimating]
  );

  const goToExperienceSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= experienceSlideCount || isAnimating) return;

      setIsAnimating(true);
      setCurrentExperienceSlide(index);

      setTimeout(() => setIsAnimating(false), scrollCooldown);
    },
    [isAnimating]
  );

  const handleScroll = useCallback(
    (direction: 'up' | 'down') => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown || isAnimating) return;
      lastScrollTime.current = now;

      if (direction === 'down') {
        if (isInExperience) {
          if (currentExperienceSlide < experienceSlideCount - 1) {
            goToExperienceSlide(currentExperienceSlide + 1);
          } else {
            goToSection(currentSection + 1);
          }
        } else {
          goToSection(currentSection + 1);
        }
      } else {
        if (isInExperience) {
          if (currentExperienceSlide > 0) {
            goToExperienceSlide(currentExperienceSlide - 1);
          } else {
            goToSection(currentSection - 1);
          }
        } else {
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

  // Touch event handlers with better mobile support
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;

      // Lower threshold for mobile (30px instead of 50px)
      if (Math.abs(deltaY) < 30) return;

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

  const experienceColors = ['#ff3366', '#ffcc00', '#ff5500'];
  const currentColor = isInExperience
    ? experienceColors[currentExperienceSlide] || '#ff3366'
    : sectionAccentColors[currentSection] || '#ff3366';

  return (
    <ScrollContext.Provider value={contextValue}>
      <main
        ref={containerRef}
        className={`fixed inset-0 overflow-hidden bg-background ${
          isAnimating ? 'scrolling-section' : ''
        }`}
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      >
        {/* Three.js Globe Background */}
        <ThreeBackground />

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-[1]"></div>

        {/* Sections container */}
        <motion.div
          className="h-full w-full relative z-10 pointer-events-none"
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
            className="w-full flex items-center justify-center p-2 sm:p-4 md:p-8"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          >
            <div className="w-full max-w-7xl mx-auto pointer-events-auto">
              <Hero />
            </div>
          </section>

          {/* Experience Section */}
          <section
            id="experience"
            className="w-full pointer-events-auto"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          >
            <ExperienceSectionContent
              activeIndex={currentExperienceSlide}
              onSlideChange={goToExperienceSlide}
            />
          </section>

          {/* Skills Section */}
          <section
            id="skills"
            className="w-full"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          >
            <div className="w-full h-full p-2 sm:p-4 md:p-8 max-w-7xl mx-auto pointer-events-auto">
              <Skills />
            </div>
          </section>

          {/* Connect Section */}
          <section
            id="connect"
            className="w-full flex items-center justify-center p-2 sm:p-4 md:p-8"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          >
            <div className="w-full max-w-5xl mx-auto pointer-events-auto">
              <Socials />
            </div>
          </section>
        </motion.div>

        {/* Desktop Navigation - Right side */}
        <div className="hidden md:block">
          <ScrollNavDesktop
            sections={sections}
            currentSection={currentSection}
            currentExperienceSlide={currentExperienceSlide}
            isInExperience={isInExperience}
            currentColor={currentColor}
            goToSection={goToSection}
            goToExperienceSlide={goToExperienceSlide}
          />
        </div>

        {/* Bottom scroll hint - desktop only, first section */}
        <div className="hidden md:block">
          <BottomScrollHint
            isVisible={currentSection === 0}
            onScroll={() => goToSection(1)}
          />
        </div>

        {/* Section progress bar */}
        <motion.div
          className="fixed bottom-0 left-0 z-40 h-px origin-left hidden md:block"
          style={{ background: currentColor, width: '100%' }}
          animate={{ scaleX: (currentSection + 1) / sections.length }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
        />

        {/* Mobile Navigation - Bottom */}
        <div className="md:hidden">
          <ScrollNavMobile
            sections={sections}
            currentSection={currentSection}
            currentColor={currentColor}
            goToSection={goToSection}
          />
        </div>
      </main>
    </ScrollContext.Provider>
  );
}

// Desktop Navigation Component
interface ScrollNavDesktopProps {
  sections: { id: string; label: string; icon: string }[];
  currentSection: number;
  currentExperienceSlide: number;
  isInExperience: boolean;
  currentColor: string;
  goToSection: (index: number) => void;
  goToExperienceSlide: (index: number) => void;
}

function ScrollNavDesktop({
  sections,
  currentSection,
  currentExperienceSlide,
  isInExperience,
  currentColor,
  goToSection,
  goToExperienceSlide,
}: ScrollNavDesktopProps) {
  const [isHovered, setIsHovered] = useState(false);

  const experienceItems = [
    { company: 'WellnessLiving', color: '#ff3366' },
    { company: 'Kusho', color: '#ffcc00' },
    { company: 'Castler', color: '#ff5500' },
  ];

  const NODE_GAP = 78;
  const TRACK_PAD = 14;
  const trackHeight = (sections.length - 1) * NODE_GAP;

  // Progress fill height in px — advances smoothly through experience sub-slides
  const progressFillHeight = isInExperience
    ? NODE_GAP +
      (currentExperienceSlide / (experienceItems.length - 1)) * NODE_GAP * 0.82
    : currentSection * NODE_GAP;

  const isLastSection = currentSection === sections.length - 1;

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed right-5 top-1/2 z-50 -translate-y-1/2 hidden md:flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track + nodes */}
      <div
        className="relative"
        style={{ width: 28, height: trackHeight + TRACK_PAD * 2 }}
      >
        {/* Background track */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-px bg-neutral-800"
          style={{ top: TRACK_PAD, height: trackHeight }}
        />

        {/* Animated progress fill */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 origin-top"
          style={{
            width: 1.5,
            top: TRACK_PAD,
            background: `linear-gradient(to bottom, ${sectionAccentColors[0]}, ${currentColor})`,
          }}
          animate={{ height: progressFillHeight }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
        />

        {/* Experience sub-dots — inline between Work and Skills nodes */}
        <AnimatePresence>
          {isInExperience && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ top: TRACK_PAD + NODE_GAP + 15, gap: 15 }}
            >
              {experienceItems.map((exp, ei) => (
                <div
                  key={exp.company}
                  className="relative flex items-center justify-center"
                >
                  <AnimatePresence>
                    {(isHovered || ei === currentExperienceSlide) && (
                      <motion.span
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-5 whitespace-nowrap font-mono text-[8px] uppercase tracking-wider"
                        style={{
                          color:
                            ei === currentExperienceSlide
                              ? exp.color
                              : '#475569',
                        }}
                      >
                        {exp.company}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => goToExperienceSlide(ei)}
                    className="flex h-5 w-5 items-center justify-center"
                    aria-label={`Show ${exp.company}`}
                  >
                    <motion.div
                      className="rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor:
                          ei <= currentExperienceSlide ? exp.color : '#334155',
                        boxShadow:
                          ei === currentExperienceSlide
                            ? `0 0 8px ${exp.color}`
                            : 'none',
                      }}
                      animate={{
                        width: ei === currentExperienceSlide ? 7 : 5,
                        height: ei === currentExperienceSlide ? 7 : 5,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section nodes */}
        {sections.map((section, i) => {
          const isActive = currentSection === i;
          const isPast = i < currentSection;
          const color = sectionAccentColors[i] || currentColor;

          return (
            <div
              key={section.id}
              className="absolute"
              style={{ top: TRACK_PAD + i * NODE_GAP, left: 0, right: 0 }}
            >
              {/* Label — appears on hover or when active */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-full top-1/2 mr-3 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap"
                  >
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: isActive ? color : '#475569' }}
                    >
                      {section.label}
                    </span>
                    <span className="font-mono text-[8px] text-slate-700">
                      {section.icon}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={() => goToSection(i)}
                  aria-label={`Go to ${section.label}`}
                  className="relative flex h-8 w-8 items-center justify-center"
                >
                  {isActive && (
                    <motion.div
                      className="absolute rounded-full border"
                      style={{ width: 22, height: 22, borderColor: color }}
                      animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    className="rounded-full border-2"
                    style={{
                      width: 10,
                      height: 10,
                      borderColor: isActive || isPast ? color : '#334155',
                      backgroundColor: isActive
                        ? color
                        : isPast
                        ? `${color}28`
                        : 'transparent',
                      boxShadow: isActive ? `0 0 12px ${color}` : 'none',
                    }}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll hint — click to advance, disappears on last section */}
      <AnimatePresence>
        {!isLastSection && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (
                isInExperience &&
                currentExperienceSlide < experienceItems.length - 1
              ) {
                goToExperienceSlide(currentExperienceSlide + 1);
              } else {
                goToSection(currentSection + 1);
              }
            }}
            className="group mt-3 flex flex-col items-center gap-1.5"
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-slate-600 transition-colors group-hover:text-slate-400">
              scroll
            </span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown
                size={12}
                className="text-slate-600 transition-colors group-hover:text-slate-400"
              />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Step counter */}
      <motion.div
        className="mt-3 flex items-center gap-1 font-mono text-[9px]"
        style={{ color: currentColor }}
      >
        <span>{String(currentSection + 1).padStart(2, '0')}</span>
        <span className="text-slate-700">/</span>
        <span className="text-slate-500">
          {String(sections.length).padStart(2, '0')}
        </span>
      </motion.div>
    </motion.nav>
  );
}

// Bottom scroll hint — mouse-icon prompt, desktop only, section 0 only
function BottomScrollHint({
  isVisible,
  onScroll,
}: {
  isVisible: boolean;
  onScroll: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          onClick={onScroll}
          className="group fixed bottom-7 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          {/* Mouse outline */}
          <div
            className="relative border border-slate-600 transition-colors group-hover:border-slate-400"
            style={{ width: 18, height: 30, borderRadius: 9 }}
          >
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-500 group-hover:bg-slate-400 transition-colors"
              style={{ width: 2, height: 6 }}
              animate={{ top: ['18%', '46%', '18%'], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <motion.span
            className="font-mono text-[8px] uppercase tracking-[0.32em] text-slate-600 transition-colors group-hover:text-slate-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            scroll
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Mobile Navigation Component - Bottom bar
interface ScrollNavMobileProps {
  sections: { id: string; label: string; icon: string }[];
  currentSection: number;
  currentColor: string;
  goToSection: (index: number) => void;
}

function ScrollNavMobile({
  sections,
  currentSection,
  currentColor,
  goToSection,
}: ScrollNavMobileProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
    >
      {/* Background blur */}
      <div className="absolute inset-0 bg-neutral-950 border-t border-neutral-800" />

      {/* Navigation items */}
      <div className="relative flex items-center justify-around px-2 py-3">
        {sections.map((section, index) => {
          const isActive = currentSection === index;

          return (
            <button
              key={section.id}
              onClick={() => goToSection(index)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[60px] touch-manipulation"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0"
                  style={{ backgroundColor: `${currentColor}30` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon/Number */}
              <span
                className={`relative text-sm font-bold transition-colors duration-200 ${
                  isActive ? '' : 'text-slate-500'
                }`}
                style={{ color: isActive ? currentColor : undefined }}
              >
                {section.icon}
              </span>

              {/* Label */}
              <span
                className={`relative text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              >
                {section.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="absolute -top-1 w-1 h-1 rounded-full"
                  style={{ backgroundColor: currentColor }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
