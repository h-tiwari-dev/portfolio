"use client";

import Image from "next/image";
import { Terminal, Cpu, ShieldCheck } from "lucide-react";
import GameOfLife from "@/components/common/gameOfLife";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center relative overflow-hidden group">
            {/* Background Simulation */}
            <div className="absolute inset-0 opacity-[0.5] group-hover:opacity-[0.8] transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0c0b0a]/0 via-[#0c0b0a]/20 to-[#0c0b0a] z-0"></div>
                <div className="relative z-10 h-full w-full">
                    <GameOfLife />
                </div>
            </div>

            {/* Background Decorative ID */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                <ShieldCheck size={14} className="text-amber-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Authenticated_Entity</span>
                <div className="w-1 h-3 bg-amber-500 animate-pulse"></div>
            </div>

            <div className="absolute top-4 right-4 text-white/5 group-hover:text-amber-500/20 transition-colors">
                <Terminal size={120} strokeWidth={0.5} />
            </div>

            {/* Profile Image with Enhanced Glow */}
            <div className="relative mb-8 group shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <Image
                        src="/profile.jpeg"
                        alt="Harsh Tiwari"
                        width={256}
                        height={256}
                        className="object-cover w-full h-full grayscale-[50%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        priority
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-amber-500/50 p-1 rounded shadow-lg">
                    <Cpu size={14} className="text-amber-400 animate-spin-slow" />
                </div>
            </div>

            {/* Introduction with Premium Typography */}
            <div className="text-center z-10 max-w-lg relative">
                {/* Subtle backdrop for text legibility */}
                <div className="absolute inset-x-0 inset-y-[-20px] bg-[#0c0b0a]/60 blur-2xl rounded-full -z-10"></div>

                <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/50"></span>
                    <span className="text-[10px] font-mono text-amber-400 tracking-[0.3em] uppercase">Security Level 10</span>
                    <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/50"></span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:animate-pulse">
                    Engineer <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">
                        Architect
                        <span className="absolute inset-0 bg-clip-text text-amber-500 opacity-0 group-hover:opacity-40 group-hover:animate-ping -z-10 blur-sm">Architect</span>
                    </span>
                </h1>

                <p className="text-sm md:text-base text-slate-200 font-normal mb-8 leading-relaxed">
                    Building <span className="text-amber-400 font-semibold">horizontally scalable platforms</span> and <span className="text-cyan-400 font-semibold">real-time AI infrastructure</span>. Core focus on event-driven architectures and distributed pipelines.
                </p>

                <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase mb-1">Status</span>
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-green-500/5 border border-green-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-green-500 font-mono font-bold uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase mb-1">Uptime</span>
                        <span className="text-[12px] text-slate-300 font-mono">100.0%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
