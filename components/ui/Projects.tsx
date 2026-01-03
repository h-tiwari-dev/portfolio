"use client";

import { Activity, Circle } from "lucide-react";

export default function Projects() {
    const projects = [
        {
            title: "Project Alpha",
            description: "High-performance trading engine.",
            tags: ["Rust", "Actix"],
            status: "Running"
        },
        {
            title: "Beta Dashboard",
            description: "Real-time analytics & visualization.",
            tags: ["Next.js", "D3"],
            status: "Idle"
        },
        {
            title: "Gamma API",
            description: "Distributed microservices gateway.",
            tags: ["NestJS", "K8s"],
            status: "Optimizing"
        }
    ];

    return (
        <div className="h-full w-full p-5 overflow-hidden flex flex-col group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center">
                    <Activity size={14} className="mr-2 text-cyan-500/70" />
                    Process_Queue.exe
                </h3>
                <div className="text-[9px] font-mono text-slate-600">PID: 8824</div>
            </div>

            <div className="space-y-3 overflow-y-auto scrollbar-none pr-1">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="bg-white/[0.02] rounded p-3 border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all group/item cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-[12px] font-bold text-slate-200 group-hover/item:text-cyan-300 transition-colors uppercase font-mono tracking-tight">{project.title}</h4>
                            <div className="flex items-center space-x-1">
                                <span className="text-[8px] font-mono text-slate-600 uppercase">{project.status}</span>
                                <Circle size={6} className={project.status === 'Running' ? 'text-green-500 fill-green-500 animate-pulse' : 'text-slate-700 fill-slate-700'} />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed font-light">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {project.tags.map((tag, i) => (
                                <span key={i} className="text-[8px] font-mono bg-slate-950 text-cyan-500/70 px-1.5 py-0.5 rounded border border-cyan-500/10">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
