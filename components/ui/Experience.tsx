"use client";

import React, { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Activity, Zap, Building2, Calendar, ChevronRight } from "lucide-react";
import ExperienceScene from "@/components/three/ExperienceScene";

const experiences = [
    {
        pid: "PID_1024",
        company: "WellnessLiving",
        role: "Sr. Software Engineer",
        period: "2025 - PRESENT",
        status: "STABLE_EXEC",
        isActive: true,
        color: "amber",
        highlights: [
            "Real-time warehouse (Debezium → Kafka → ClickHouse) with semantic layer",
            "Cut time-to-insight 80% and ad-hoc SQL 60%",
            "pgvector LLM conversation intelligence on transcripts",
            "Stateless WebSocket platform via Kafka backplane",
            "35% fewer disconnects, 18% fewer support tickets"
        ],
        tech: ["KAFKA", "CLICKHOUSE", "PGVECTOR", "K8S", "DEBEZIUM"]
    },
    {
        pid: "PID_0892",
        company: "Kusho",
        role: "Full Stack Developer",
        period: "2023 - 2025",
        status: "TERMINATED_EXIT_0",
        isActive: false,
        color: "cyan",
        highlights: [
            "React Flow builder with 50+ nodes, sub-200ms UI",
            "40% faster test runs with visual test builder",
            "Playwright CDP automation with AST parsing",
            "3x coverage, 70% less manual effort",
            "Redis RQ + Pinecone: 45% higher throughput"
        ],
        tech: ["REACT_FLOW", "PLAYWRIGHT", "REDIS", "PINECONE", "GRAFANA"]
    },
    {
        pid: "PID_0441",
        company: "Castler",
        role: "Full Stack Developer",
        period: "2021 - 2023",
        status: "TERMINATED_EXIT_0",
        isActive: false,
        color: "purple",
        highlights: [
            "Event-driven payments: INR 50Cr+/mo, 2M+ txns",
            "Sub-200ms latency, 35% lower cost",
            "Banking Security: cut critical vulns 40%",
            "Migrated 200GB MongoDB → MySQL via Airflow",
            "React 18 + XState: 60% faster workflow creation"
        ],
        tech: ["KAFKA", "REDIS", "MONGODB", "XSTATE", "AIRFLOW"]
    }
];

const colorConfig = {
    amber: {
        bg: "from-amber-500/20 via-amber-500/5 to-transparent",
        border: "border-amber-500/30",
        text: "text-amber-400",
        glow: "shadow-[0_0_100px_-20px_rgba(245,158,11,0.4)]",
        dot: "bg-amber-500",
        tag: "bg-amber-500/20 border-amber-500/30 text-amber-300",
        accent: "#f59e0b"
    },
    cyan: {
        bg: "from-cyan-500/20 via-cyan-500/5 to-transparent",
        border: "border-cyan-500/30",
        text: "text-cyan-400",
        glow: "shadow-[0_0_100px_-20px_rgba(6,182,212,0.4)]",
        dot: "bg-cyan-500",
        tag: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
        accent: "#06b6d4"
    },
    purple: {
        bg: "from-purple-500/20 via-purple-500/5 to-transparent",
        border: "border-purple-500/30",
        text: "text-purple-400",
        glow: "shadow-[0_0_100px_-20px_rgba(168,85,247,0.4)]",
        dot: "bg-purple-500",
        tag: "bg-purple-500/20 border-purple-500/30 text-purple-300",
        accent: "#a855f7"
    }
};

export default function Experience() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(true);

    const x = useMotionValue(0);
    const smoothX = useSpring(x, { stiffness: 100, damping: 30 });
    const progress = useMotionValue(0);

    const totalSlides = experiences.length;
    const slideWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;

    // Update active index based on x position
    useEffect(() => {
        const unsubscribe = x.on("change", (latest) => {
            const currentIndex = Math.round(Math.abs(latest) / slideWidth);
            setActiveIndex(Math.min(currentIndex, totalSlides - 1));
            progress.set(Math.abs(latest) / (slideWidth * (totalSlides - 1)));

            // Update scroll capability
            setCanScrollUp(latest < 0);
            setCanScrollDown(latest > -(slideWidth * (totalSlides - 1)));
        });
        return unsubscribe;
    }, [x, slideWidth, totalSlides, progress]);

    // Handle wheel events
    const handleWheel = useCallback((e: WheelEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const isInView = rect.top <= 0 && rect.bottom >= window.innerHeight;

        if (!isInView) {
            setIsLocked(false);
            return;
        }

        const currentX = x.get();
        const maxScroll = -(slideWidth * (totalSlides - 1));

        // Check if we should capture the scroll
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;
        const atStart = currentX >= 0;
        const atEnd = currentX <= maxScroll;

        // If at start and scrolling up, or at end and scrolling down, don't capture
        if ((atStart && scrollingUp) || (atEnd && scrollingDown)) {
            setIsLocked(false);
            return;
        }

        // Capture the scroll
        e.preventDefault();
        setIsLocked(true);

        // Calculate new position
        const delta = e.deltaY * 1.5; // Multiply for faster horizontal scroll
        const newX = Math.max(maxScroll, Math.min(0, currentX - delta));

        x.set(newX);
    }, [x, slideWidth, totalSlides]);

    // Attach wheel listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Use passive: false to allow preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    // Navigate to specific slide
    const goToSlide = useCallback((index: number) => {
        const targetX = -(index * slideWidth);
        animate(x, targetX, { type: "spring", stiffness: 100, damping: 30 });
    }, [x, slideWidth]);

    const currentColors = colorConfig[experiences[activeIndex].color as keyof typeof colorConfig];

    return (
        <section
            ref={containerRef}
            className="relative h-screen w-full overflow-hidden"
        >
            {/* Three.js Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    dpr={[1, 1.5]}
                    gl={{ antialias: true, alpha: true }}
                    style={{ background: "transparent" }}
                >
                    <Suspense fallback={null}>
                        <ExperienceScene
                            activeIndex={activeIndex}
                            progress={progress.get()}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentColors.bg} z-[1] transition-all duration-500 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/80 z-[1] pointer-events-none" />

            {/* Header */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center border ${currentColors.border} transition-colors duration-500`}>
                        <Activity size={20} className={`${currentColors.text} transition-colors duration-500`} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Experience</h2>
                        <p className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scroll to explore</p>
                    </div>
                </motion.div>
            </div>

            {/* Progress counter */}
            <div className="absolute top-6 right-6 md:top-8 md:right-20 z-20">
                <div className="text-right">
                    <span className={`text-3xl md:text-4xl font-bold ${currentColors.text} transition-colors duration-500`}>
                        {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg md:text-xl text-slate-600 mx-1">/</span>
                    <span className="text-lg md:text-xl text-slate-500">{String(totalSlides).padStart(2, "0")}</span>
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
                                        ? `scale-150 ${colorConfig[exp.color as keyof typeof colorConfig].dot}`
                                        : i < activeIndex
                                        ? colorConfig[exp.color as keyof typeof colorConfig].dot + " opacity-50"
                                        : "bg-slate-600"
                                }`}
                                style={{
                                    boxShadow: i === activeIndex
                                        ? `0 0 15px ${colorConfig[exp.color as keyof typeof colorConfig].accent}`
                                        : "none"
                                }}
                            />
                            <span className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                                i === activeIndex
                                    ? colorConfig[exp.color as keyof typeof colorConfig].text
                                    : "text-slate-600 group-hover:text-slate-400"
                            }`}>
                                {exp.company}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Horizontal scroll container */}
            <motion.div
                className="absolute inset-0 flex items-center z-10"
                style={{ x: smoothX }}
            >
                {experiences.map((exp, index) => {
                    const colors = colorConfig[exp.color as keyof typeof colorConfig];

                    return (
                        <div
                            key={exp.pid}
                            className="min-w-[100vw] h-full flex items-center justify-center px-4 md:px-16 lg:px-24"
                        >
                            <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-6 md:gap-8 items-center">
                                {/* Content Card */}
                                <motion.div
                                    animate={{
                                        opacity: index === activeIndex ? 1 : 0.3,
                                        scale: index === activeIndex ? 1 : 0.95,
                                        y: index === activeIndex ? 0 : 20
                                    }}
                                    transition={{ duration: 0.4 }}
                                    className={`lg:col-span-3 relative p-6 md:p-8 rounded-2xl md:rounded-3xl border ${colors.border} bg-background/60 backdrop-blur-xl ${index === activeIndex ? colors.glow : ""}`}
                                >
                                    {/* Status badge */}
                                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                        <span className="text-[9px] md:text-[10px] font-mono text-slate-500">{exp.pid}</span>
                                        <span className={`text-[8px] md:text-[9px] font-mono px-2 py-0.5 rounded-full ${
                                            exp.isActive
                                                ? "text-green-400 border border-green-500/30 bg-green-500/10"
                                                : "text-slate-500 border border-slate-500/30 bg-slate-500/10"
                                        }`}>
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
                                        <span className={`text-lg md:text-xl font-mono font-bold ${colors.text} flex items-center gap-2`}>
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
                                                animate={{
                                                    opacity: index === activeIndex ? 1 : 0.5,
                                                    x: index === activeIndex ? 0 : -10
                                                }}
                                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                                className="flex items-start gap-2 md:gap-3"
                                            >
                                                <ChevronRight size={14} className={`${colors.text} mt-0.5 shrink-0`} />
                                                <span className="text-xs md:text-sm text-slate-300 leading-relaxed">{point}</span>
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
                                        animate={{
                                            opacity: index === activeIndex ? 1 : 0.2,
                                            scale: index === activeIndex ? 1 : 0.8
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center"
                                    >
                                        <div className={`text-[120px] font-black ${colors.text} opacity-20 leading-none`}>
                                            {String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div className={`text-sm font-mono ${colors.text} opacity-50 mt-2 uppercase tracking-widest`}>
                                            {exp.company}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Bottom scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        {activeIndex < totalSlides - 1 ? "Scroll to continue" : "Scroll down to continue"}
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
                                ? `${colorConfig[exp.color as keyof typeof colorConfig].dot} scale-125`
                                : i < activeIndex
                                ? `${colorConfig[exp.color as keyof typeof colorConfig].dot} opacity-50`
                                : "bg-slate-600"
                        }`}
                        style={{
                            boxShadow: i === activeIndex
                                ? `0 0 12px ${colorConfig[exp.color as keyof typeof colorConfig].accent}`
                                : "none"
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
