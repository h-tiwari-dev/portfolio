"use client";

import Image from "next/image";
import { Terminal, Cpu, ShieldCheck } from "lucide-react";
import GameOfLife from "@/components/common/gameOfLife";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center relative overflow-hidden group">
            {/* Background Simulation */}
            <div className="absolute inset-0 opacity-[0.4] group-hover:opacity-[0.7] transition-opacity duration-1000">
                <div className="relative z-10 h-full w-full pointer-events-auto">
                    <GameOfLife />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background z-20 pointer-events-none"></div>
            </div>

            {/* Background Decorative ID */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none">
                <ShieldCheck size={14} className="text-amber-400" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Authenticated_Entity</span>
                <div className="w-1 h-3 bg-amber-500 animate-pulse"></div>
            </div>

            <div className="absolute top-4 right-4 text-white/5 group-hover:text-amber-500/20 transition-colors pointer-events-none">
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

                <div className="relative inline-block mb-3">
                    {/* Main Title Layer */}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight relative z-10">
                        SR. SOFTWARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-[length:200%_100%] animate-[text-shimmer_3s_infinite_linear]">ENGINEER</span>
                    </h1>

                    {/* Glitch Overlay - Mapped to match exactly to parent wrap */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none z-20">
                        {/* Red Shift */}
                        <h1 className="absolute top-0 left-0 w-full text-4xl md:text-5xl font-black tracking-tighter text-amber-500/20 translate-x-[2px] leading-tight select-none">
                            SR. SOFTWARE <span className="">ENGINEER</span>
                        </h1>
                        {/* Blue Shift */}
                        <h1 className="absolute top-0 left-0 w-full text-4xl md:text-5xl font-black tracking-tighter text-cyan-500/20 -translate-x-[2px] leading-tight select-none">
                            SR. SOFTWARE <span className="">ENGINEER</span>
                        </h1>

                        {/* Scanning Lines (Internal) */}
                        <div className="absolute left-0 right-0 h-[1px] bg-white/20 blur-[1px] animate-[scan_2s_infinite_linear]"></div>
                    </div>
                </div>

                {/* Technical Meta Tag - Moved outside the title flow to prevent wrapping issues */}
                <div className="flex justify-center mb-6 h-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-[0.6em] border-x border-cyan-500/20 px-4">
                            System_Architect // v4.0.Final
                        </span>
                    </div>
                </div>

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
