'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from 'react';
import { motion, animate } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Activity, Zap, Building2, Calendar, ChevronRight } from 'lucide-react';
import ExperienceScene from '@/components/three/ExperienceScene';

const experiences = [
  {
    pid: 'PID_1024',
    company: 'WellnessLiving',
    role: 'Sr. Software Engineer',
    period: '2025 - PRESENT',
    status: 'STABLE_EXEC',
    isActive: true,
    color: 'amber',
    highlights: [
      'Real-time warehouse (Debezium → Kafka → ClickHouse) with semantic layer',
      'Cut time-to-insight 80% and ad-hoc SQL 60%',
      'pgvector LLM conversation intelligence on transcripts',
      'Stateless WebSocket platform via Kafka backplane',
      '35% fewer disconnects, 18% fewer support tickets',
    ],
    tech: ['KAFKA', 'CLICKHOUSE', 'PGVECTOR', 'K8S', 'DEBEZIUM'],
  },
  {
    pid: 'PID_0892',
    company: 'Kusho',
    role: 'Full Stack Developer',
    period: '2023 - 2025',
    status: 'TERMINATED_EXIT_0',
    isActive: false,
    color: 'cyan',
    highlights: [
      'React Flow builder with 50+ nodes, sub-200ms UI',
      '40% faster test runs with visual test builder',
      'Playwright CDP automation with AST parsing',
      '3x coverage, 70% less manual effort',
      'Redis RQ + Pinecone: 45% higher throughput',
    ],
    tech: ['REACT_FLOW', 'PLAYWRIGHT', 'REDIS', 'PINECONE', 'GRAFANA'],
  },
  {
    pid: 'PID_0441',
    company: 'Castler',
    role: 'Full Stack Developer',
    period: '2021 - 2023',
    status: 'TERMINATED_EXIT_0',
    isActive: false,
    color: 'purple',
    highlights: [
      'Event-driven payments: INR 50Cr+/mo, 2M+ txns',
      'Sub-200ms latency, 35% lower cost',
      'Banking Security: cut critical vulns 40%',
      'Migrated 200GB MongoDB → MySQL via Airflow',
      'React 18 + XState: 60% faster workflow creation',
    ],
    tech: ['KAFKA', 'REDIS', 'MONGODB', 'XSTATE', 'AIRFLOW'],
  },
];

const colorConfig = {
  amber: {
    bg: 'from-rose-500/20 via-rose-500/5 to-transparent',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_100px_-20px_rgba(255,51,102,0.4)]',
    dot: 'bg-rose-500',
    tag: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    accent: '#ff3366',
  },
  cyan: {
    bg: 'from-yellow-400/20 via-yellow-400/5 to-transparent',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_100px_-20px_rgba(255,204,0,0.4)]',
    dot: 'bg-yellow-400',
    tag: 'bg-yellow-400/20 border-yellow-400/30 text-yellow-300',
    accent: '#ffcc00',
  },
  purple: {
    bg: 'from-orange-500/20 via-orange-500/5 to-transparent',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_100px_-20px_rgba(255,85,0,0.4)]',
    dot: 'bg-orange-500',
    tag: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
    accent: '#ff5500',
  },
};

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const scrollCooldown = 600; // ms between slides

  const totalSlides = experiences.length;

  // Check if section is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Consider in view when section occupies most of viewport
        setIsInView(entry.intersectionRatio > 0.5);
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Navigate to a specific slide with animation
  const goToSlide = useCallback(
    (index: number, instant = false) => {
      if (index < 0 || index >= totalSlides) return;

      isAnimatingRef.current = true;
      setActiveIndex(index);

      // Clear animating flag after animation completes
      setTimeout(
        () => {
          isAnimatingRef.current = false;
        },
        instant ? 0 : 500
      );
    },
    [totalSlides]
  );

  // Scroll to adjacent sections
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Handle wheel events - capture and translate to horizontal slides
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only capture if section is in view
      if (!isInView) return;

      // Prevent default scroll immediately to capture the event
      e.preventDefault();

      // Debounce rapid scrolls
      const now = Date.now();
      if (now - lastScrollTimeRef.current < scrollCooldown) return;
      if (isAnimatingRef.current) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      if (scrollingDown) {
        if (activeIndex < totalSlides - 1) {
          // Go to next slide
          lastScrollTimeRef.current = now;
          goToSlide(activeIndex + 1);
        } else {
          // At last slide, scroll to next section
          lastScrollTimeRef.current = now;
          scrollToSection('skills');
        }
      } else if (scrollingUp) {
        if (activeIndex > 0) {
          // Go to previous slide
          lastScrollTimeRef.current = now;
          goToSlide(activeIndex - 1);
        } else {
          // At first slide, scroll to previous section
          lastScrollTimeRef.current = now;
          scrollToSection('hero');
        }
      }
    };

    // Attach to window to capture all wheel events when in view
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isInView, activeIndex, totalSlides, goToSlide, scrollToSection]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInView) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < totalSlides - 1) {
          goToSlide(activeIndex + 1);
        } else {
          scrollToSection('skills');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          goToSlide(activeIndex - 1);
        } else {
          scrollToSection('hero');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, activeIndex, totalSlides, goToSlide, scrollToSection]);

  // Touch handling for mobile swipe
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isInView) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && activeIndex < totalSlides - 1) {
          goToSlide(activeIndex + 1);
        } else if (deltaX < 0 && activeIndex > 0) {
          goToSlide(activeIndex - 1);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isInView, activeIndex, totalSlides, goToSlide]);

  const currentColors =
    colorConfig[experiences[activeIndex].color as keyof typeof colorConfig];
  const progress = activeIndex / (totalSlides - 1);

  return (
    <section
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
    >
      {/* Three.js Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ExperienceScene activeIndex={activeIndex} progress={progress} />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentColors.bg} z-[1] transition-all duration-500 pointer-events-none`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/80 z-[1] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center border ${currentColors.border} transition-colors duration-500`}
          >
            <Activity
              size={20}
              className={`${currentColors.text} transition-colors duration-500`}
            />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Experience
            </h2>
            <p className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Scroll to explore
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress counter */}
      <div className="absolute top-6 right-6 md:top-8 md:right-20 z-20">
        <div className="text-right">
          <span
            className={`text-3xl md:text-4xl font-bold ${currentColors.text} transition-colors duration-500`}
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-lg md:text-xl text-slate-600 mx-1">/</span>
          <span className="text-lg md:text-xl text-slate-500">
            {String(totalSlides).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-8 z-20 hidden md:block">
        <div className="flex flex-col gap-3">
          {experiences.map((exp, i) => (
            <button
              key={exp.pid}
              onClick={() => goToSlide(i)}
              className="group flex items-center gap-3"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? `scale-150 ${
                        colorConfig[exp.color as keyof typeof colorConfig].dot
                      }`
                    : i < activeIndex
                    ? colorConfig[exp.color as keyof typeof colorConfig].dot +
                      ' opacity-50'
                    : 'bg-slate-600'
                }`}
                style={{
                  boxShadow:
                    i === activeIndex
                      ? `0 0 15px ${
                          colorConfig[exp.color as keyof typeof colorConfig]
                            .accent
                        }`
                      : 'none',
                }}
              />
              <span
                className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                  i === activeIndex
                    ? colorConfig[exp.color as keyof typeof colorConfig].text
                    : 'text-slate-600 group-hover:text-slate-400'
                }`}
              >
                {exp.company}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slides container - instant snap with transform */}
      <div className="absolute inset-0 z-10">
        <motion.div
          className="h-full flex"
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
        >
          {experiences.map((exp, index) => {
            const colors = colorConfig[exp.color as keyof typeof colorConfig];
            const isActive = index === activeIndex;

            return (
              <div
                key={exp.pid}
                className="min-w-full h-full flex items-center justify-center px-4 md:px-16 lg:px-24"
              >
                <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-6 md:gap-8 items-center">
                  {/* Content Card */}
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.95,
                      y: isActive ? 0 : 20,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`lg:col-span-3 relative p-6 md:p-8 rounded-2xl md:rounded-3xl border ${
                      colors.border
                    } bg-background/60 backdrop-blur-xl ${
                      isActive ? colors.glow : ''
                    }`}
                  >
                    {/* Status badge */}
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <span className="text-[9px] md:text-[10px] font-mono text-slate-500">
                        {exp.pid}
                      </span>
                      <span
                        className={`text-[8px] md:text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          exp.isActive
                            ? 'text-green-400 border border-green-500/30 bg-green-500/10'
                            : 'text-slate-500 border border-slate-500/30 bg-slate-500/10'
                        }`}
                      >
                        {exp.status}
                      </span>
                      {exp.isActive && (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      )}
                    </div>

                    {/* Role & Company */}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
                      {exp.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
                      <span
                        className={`text-lg md:text-xl font-mono font-bold ${colors.text} flex items-center gap-2`}
                      >
                        <Building2 size={16} className="opacity-60" />
                        {exp.company}
                        <Zap size={12} className="opacity-40" />
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs md:text-sm font-mono">
                        <Calendar size={12} />
                        {exp.period}
                      </span>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                      {exp.highlights.map((point, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0.5,
                            x: isActive ? 0 : -10,
                          }}
                          transition={{
                            delay: isActive ? i * 0.05 : 0,
                            duration: 0.3,
                          }}
                          className="flex items-start gap-2 md:gap-3"
                        >
                          <ChevronRight
                            size={14}
                            className={`${colors.text} mt-0.5 shrink-0`}
                          />
                          <span className="text-xs md:text-sm text-slate-300 leading-relaxed">
                            {point}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {exp.tech.map((t) => (
                        <span
                          key={t}
                          className={`text-[9px] md:text-[10px] font-mono px-2 md:px-3 py-1 md:py-1.5 rounded-lg border ${colors.tag}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Visual element */}
                  <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.2,
                        scale: isActive ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div
                        className={`text-[120px] font-black ${colors.text} opacity-20 leading-none`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div
                        className={`text-sm font-mono ${colors.text} opacity-50 mt-2 uppercase tracking-widest`}
                      >
                        {exp.company}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {activeIndex < totalSlides - 1
              ? 'Scroll to continue'
              : 'Scroll down to continue'}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-5 h-8 md:w-6 md:h-10 rounded-full border-2 ${currentColors.border} flex items-start justify-center p-1.5 md:p-2 transition-colors duration-500`}
          >
            <motion.div
              className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${currentColors.dot} transition-colors duration-500`}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile progress dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-3 md:hidden">
        {experiences.map((exp, i) => (
          <button
            key={exp.pid}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? `${
                    colorConfig[exp.color as keyof typeof colorConfig].dot
                  } scale-125`
                : i < activeIndex
                ? `${
                    colorConfig[exp.color as keyof typeof colorConfig].dot
                  } opacity-50`
                : 'bg-slate-600'
            }`}
            style={{
              boxShadow:
                i === activeIndex
                  ? `0 0 12px ${
                      colorConfig[exp.color as keyof typeof colorConfig].accent
                    }`
                  : 'none',
            }}
          />
        ))}
      </div>
    </section>
  );
}
