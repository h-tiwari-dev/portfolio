"use client";

import { useEffect, useState } from "react";
import { Zap, Activity } from "lucide-react";

export default function SystemMetrics() {
    const [cpu, setCpu] = useState(45);
    const [memory, setMemory] = useState(62);
    const [history, setHistory] = useState<number[]>(new Array(40).fill(50));

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(prev => {
                const val = Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 20));
                setHistory(h => [...h.slice(1), val]);
                return val;
            });
            setMemory(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const generatePath = (data: number[]) => {
        const points = data.map((val, i) => `${i * (100 / (data.length - 1))},${100 - val}`).join(" L ");
        return `M 0,100 L ${points} L 100,100 Z`;
    };

    return (
        <div className="p-4 h-full flex flex-col group relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center text-[10px] font-bold text-amber-400 tracking-[0.2em] uppercase">
                    <Zap size={14} className="mr-2 text-amber-500" />
                    Live_Telemetry.log
                </div>
                <Activity size={12} className="text-amber-500/30 animate-pulse" />
            </div>

            <div className="space-y-5 relative z-10 flex-1 flex flex-col">
                <div>
                    <div className="flex justify-between text-[9px] text-slate-500 mb-2 font-mono uppercase">
                        <span>CPU_Core_Frequency</span>
                        <span className="text-amber-400">{cpu.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-amber-600 to-orange-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            style={{ width: `${cpu}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-[9px] text-slate-500 mb-2 font-mono uppercase">
                        <span>Mem_Buffer_Alloc</span>
                        <span className="text-cyan-400">{memory.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            style={{ width: `${memory}%` }}
                        ></div>
                    </div>
                </div>

                {/* Real-time Graph */}
                <div className="flex-1 mt-2 min-h-[60px] relative border border-white/5 bg-black/20 rounded-md overflow-hidden flex flex-col">
                    <div className="absolute top-1 left-2 text-[7px] text-slate-600 font-mono">SYS_LOAD_HISTORY</div>
                    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d={generatePath(history)} fill="url(#grad)" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.2)" />
                                <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Scanning Line */}
                    <div className="absolute top-0 bottom-0 w-[1px] bg-amber-500/50 animate-[scan_2s_linear_infinite] shadow-[0_0_10px_rgba(245,158,11,1)]"></div>
                </div>

                <div className="pt-2 flex justify-between items-end border-t border-white/5 mt-auto">
                    <div className="space-y-1">
                        <div className="text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                            Status_Flag: <span className="text-green-500 font-bold">Stable</span>
                        </div>
                        <div className="text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                            Node_ID: <span className="text-amber-400">HT-P-4421</span>
                        </div>
                    </div>
                    <div className="text-[14px] text-amber-500/20 font-mono font-bold italic tracking-tighter group-hover:text-amber-500/40 transition-colors">
                        S_SYS
                    </div>
                </div>
            </div>
        </div>
    );
}
