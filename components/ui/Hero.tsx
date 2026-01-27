"use client";

import Image from "next/image";
import { Terminal, Cpu, ShieldCheck, ChevronDown, FileDown, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 md:p-8 text-center relative overflow-hidden group">
            {/* Background Decorative ID */}
            <div className="absolute top-8 left-8 flex items-center space-x-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none">
                <ShieldCheck size={16} className="text-amber-400" />
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">Authenticated_Entity</span>
                <div className="w-1 h-4 bg-amber-500 animate-pulse"></div>
            </div>

            <div className="absolute top-8 right-8 text-white/5 group-hover:text-amber-500/20 transition-colors pointer-events-none">
                <Terminal size={140} strokeWidth={0.5} />
            </div>

            {/* Profile Image with Enhanced Glow */}
            <div className="relative mb-6 md:mb-8 group shrink-0">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                    <Image
                        src="/profile.jpeg"
                        alt="Harsh Tiwari"
                        width={320}
                        height={320}
                        className="object-cover w-full h-full grayscale-[50%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        priority
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-slate-900 border border-amber-500/50 p-1.5 rounded-lg shadow-lg">
                    <Cpu size={16} className="text-amber-400 animate-spin-slow" />
                </div>
            </div>

            {/* Introduction with Premium Typography */}
            <div className="text-center z-10 max-w-2xl relative">
                {/* Subtle backdrop for text legibility */}
                <div className="absolute inset-x-0 inset-y-[-40px] bg-[#0c0b0a]/70 blur-3xl rounded-full -z-10"></div>

                <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50"></span>
                    <span className="text-[11px] font-mono text-amber-400 tracking-[0.3em] uppercase">Security Level 10</span>
                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50"></span>
                </div>

                <div className="relative mb-4 grid grid-cols-1">
                    {/* Main Title Layer */}
                    <h1 className="col-start-1 row-start-1 text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-tight relative z-10">
                        SR. SOFTWARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-[length:200%_100%] animate-[text-shimmer_3s_infinite_linear]">ENGINEER</span>
                    </h1>

                    {/* Glitch Overlay - Perfectly aligned via grid stacking */}
                    <div className="col-start-1 row-start-1 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none z-20 grid grid-cols-1">
                        {/* Red Shift */}
                        <h1 className="col-start-1 row-start-1 text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-amber-500/20 translate-x-[2px] leading-tight select-none">
                            SR. SOFTWARE <span className="">ENGINEER</span>
                        </h1>
                        {/* Blue Shift */}
                        <h1 className="col-start-1 row-start-1 text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-cyan-500/20 -translate-x-[2px] leading-tight select-none">
                            SR. SOFTWARE <span className="">ENGINEER</span>
                        </h1>

                        {/* Scanning Lines (Internal) */}
                        <div className="absolute left-0 right-0 h-[1px] bg-white/20 blur-[1px] animate-[scan_2s_infinite_linear] top-1/2"></div>
                    </div>
                </div>

                {/* Technical Meta Tag */}
                <div className="flex justify-center mb-8 h-5">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <span className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-[0.6em] border-x border-cyan-500/20 px-4">
                            System_Architect // v4.0.Final
                        </span>
                    </div>
                </div>

                <p className="text-base md:text-lg text-slate-200 font-normal mb-8 leading-relaxed max-w-xl mx-auto">
                    Building <span className="text-amber-400 font-semibold">horizontally scalable platforms</span> and <span className="text-cyan-400 font-semibold">real-time AI infrastructure</span>. Core focus on event-driven architectures and distributed pipelines.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                    {/* Resume Button */}
                    <motion.button
                        onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
                        className="group relative flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <FileDown size={18} className="text-amber-400" />
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-mono text-amber-500/60 uppercase tracking-wider">Download</span>
                            <span className="text-sm font-mono text-white font-medium">Resume.pdf</span>
                        </div>
                        <ExternalLink size={14} className="text-amber-500/40 group-hover:text-amber-400 transition-colors ml-2" />
                    </motion.button>

                    {/* Blog Button */}
                    <motion.button
                        onClick={() => window.open('https://betriumalpha.hashnode.dev', '_blank')}
                        className="group relative flex items-center gap-3 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <BookOpen size={18} className="text-cyan-400" />
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-wider">Read</span>
                            <span className="text-sm font-mono text-white font-medium">Tech Blog</span>
                        </div>
                        <ExternalLink size={14} className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors ml-2" />
                    </motion.button>
                </div>

                <div className="flex items-center justify-center space-x-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-mono text-slate-500 uppercase mb-1">Status</span>
                        <div className="flex items-center space-x-2 px-4 py-1.5 bg-green-500/5 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[11px] text-green-500 font-mono font-bold uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-mono text-slate-500 uppercase mb-1">Uptime</span>
                        <span className="text-[14px] text-slate-300 font-mono">100.0%</span>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Scroll</span>
                <ChevronDown size={20} className="text-amber-500/50" />
            </motion.div>
        </div>
    );
}
