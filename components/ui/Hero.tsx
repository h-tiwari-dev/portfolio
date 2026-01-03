"use client";

import Image from "next/image";
import { Terminal, Cpu, ShieldCheck } from "lucide-react";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center relative overflow-hidden group">
            {/* Background Decorative ID */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Authenticated_Entity</span>
                <div className="w-1 h-3 bg-indigo-500 animate-pulse"></div>
            </div>

            <div className="absolute top-4 right-4 text-white/5 group-hover:text-indigo-500/20 transition-colors">
                <Terminal size={120} strokeWidth={0.5} />
            </div>

            {/* Profile Image with Enhanced Glow */}
            <div className="relative mb-8 group shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Image
                        src="/profile.jpeg"
                        alt="Harsh Tiwari"
                        width={256}
                        height={256}
                        className="object-cover w-full h-full grayscale-[50%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        priority
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-indigo-500/50 p-1 rounded shadow-lg">
                    <Cpu size={14} className="text-indigo-400 animate-spin-slow" />
                </div>
            </div>

            {/* Introduction with Premium Typography */}
            <div className="text-center z-10 max-w-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500/50"></span>
                    <span className="text-[10px] font-mono text-indigo-400 tracking-[0.3em] uppercase">Security Level 04</span>
                    <span className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500/50"></span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 leading-tight">
                    Engineer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Architect</span>
                </h1>

                <p className="text-sm md:text-base text-slate-400 font-light mb-6 leading-relaxed">
                    Building <span className="text-indigo-400/90 font-medium">horizontally scalable platforms</span> and <span className="text-sky-400/90 font-medium">real-time AI infrastructure</span>. Core focus on event-driven architectures and distributed pipelines.
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
