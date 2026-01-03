"use client";

import { useEffect, useState } from "react";
import { Zap, Activity } from "lucide-react";

export default function SystemMetrics() {
    const [cpu, setCpu] = useState(45);
    const [memory, setMemory] = useState(62);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCpu(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 15)));
            setMemory(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="p-4 h-full flex flex-col justify-center group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-[10px] font-bold text-amber-400 tracking-[0.2em] uppercase">
                    <Zap size={14} className="mr-2 text-amber-500" />
                    Live_Telemetry.log
                </div>
                <Activity size={12} className="text-amber-500/30 animate-pulse" />
            </div>

            <div className="space-y-5">
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

                <div className="pt-3 flex justify-between items-end border-t border-white/5">
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
