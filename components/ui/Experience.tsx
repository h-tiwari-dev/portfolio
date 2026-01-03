"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, Activity, Zap, Terminal, Cpu } from "lucide-react";

const experiences = [
    {
        pid: "PID_1024",
        company: "WellnessLiving",
        role: "Sr. Software Engineer",
        period: "2025 - PRESENT",
        status: "STABLE_EXEC",
        highlights: [
            "Real-time warehouse (Debezium → Kafka → ClickHouse) with a semantic layer; cut <span class='text-amber-400 font-bold'>time-to-insight 80%</span> and <span class='text-amber-400 font-bold'>ad-hoc SQL 60%</span>.",
            "pgvector LLM conversation intelligence on transcripts with Superset dashboards.",
            "Stateless WebSocket platform via Kafka backplane; <span class='text-amber-400 font-bold'>35% fewer disconnects</span> and <span class='text-amber-400 font-bold'>18% fewer support tickets</span>."
        ],
        tech: ["KAFKA", "CLICKHOUSE", "PGVECTOR", "K8S", "DEBEZIUM"]
    },
    {
        pid: "PID_0892",
        company: "Kusho",
        role: "Full Stack Developer",
        period: "2023 - 2025",
        status: "TERMINATED_EXIT_0",
        highlights: [
            "React Flow builder with 50+ nodes; <span class='text-amber-400 font-bold'>40% faster test runs</span>, sub-200ms UI.",
            "Playwright CDP-based automation with AST-driven action parsing; <span class='text-amber-400 font-bold'>3x coverage</span>, <span class='text-amber-400 font-bold'>70% less manual effort</span>.",
            "Typed DSL unifying Postman/OpenAPI/GraphQL; reduced <span class='text-amber-400 font-bold'>incident MTTR 25%</span> via LLM test gen.",
            "Redis RQ pipeline with Pinecone vector search; <span class='text-amber-400 font-bold'>45% higher throughput</span>, <span class='text-amber-400 font-bold'>60% lower latency</span>."
        ],
        tech: ["REACT_FLOW", "PLAYWRIGHT", "REDIS", "PINECONE", "GRAFANA"]
    },
    {
        pid: "PID_0441",
        company: "Castler",
        role: "Full Stack Developer",
        period: "2021 - 2023",
        status: "TERMINATED_EXIT_0",
        highlights: [
            "Event-driven payments processing <span class='text-amber-400 font-bold'>INR 50Cr+/mo</span> and 2M+ txns; <span class='text-amber-400 font-bold'>sub-200ms latency</span>, <span class='text-amber-400 font-bold'>35% lower cost</span>.",
            "Banking Security: Sonar/Snyk/OAuth2; cut <span class='text-amber-400 font-bold'>critical vulns 40%</span> and ensured PCI compliance.",
            "Migrated 200GB MongoDB → MySQL via Airflow; <span class='text-amber-400 font-bold'>40% faster queries</span>, <span class='text-amber-400 font-bold'>99.99% data accuracy</span>.",
            "React 18 + XState FSM designer; <span class='text-amber-400 font-bold'>60% faster workflow creation</span>, 67% adoption."
        ],
        tech: ["KAFKA", "REDIS", "MONGODB", "XSTATE", "AIRFLOW"]
    }
];

export default function Experience() {
    const [mounted, setMounted] = useState(false);
    const [streams, setStreams] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        const newStreams = Array.from({ length: 15 }).map(() =>
            " 0x" + Array.from({ length: 40 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' 0x')
        );
        setStreams(newStreams);
    }, []);

    return (
        <div className="h-full w-full p-6 overflow-hidden flex flex-col group relative">
            {/* Background Data Stream (Subtle Hex) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden font-mono text-[9px] select-none leading-none flex flex-wrap content-start">
                {mounted && streams.map((str, i) => (
                    <div key={i} className="animate-[scrollUp_40s_linear_infinite] whitespace-nowrap opacity-40 shrink-0 w-full" style={{ animationDelay: `${i * -2.5}s` }}>
                        {str}
                    </div>
                ))}
            </div>

            {/* Header Trace */}
            <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
                        <Activity size={18} className="text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.2em]">S_LIFELINE.SYS_LOG</h3>
                        <div className="text-[9px] text-slate-500 font-mono flex items-center mt-0.5">
                            <Terminal size={10} className="mr-1 opacity-50" />
                            <span>TRACE_ACTIVE: 0x7A29B</span>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex items-center space-x-4 opacity-40">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-mono text-slate-500">Uptime</span>
                        <span className="text-[10px] font-mono text-amber-300">1825.24h</span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <Cpu size={16} className="text-slate-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto lg:overflow-visible relative pr-1 scrollbar-none mb-4 items-start">
                {/* Horizontal Trace Line */}
                <div className="absolute top-[4.5rem] left-0 right-0 h-px bg-gradient-to-r from-amber-500/5 via-amber-500/20 to-amber-500/5 hidden lg:block"></div>

                {experiences.map((exp, index) => (
                    <div key={index} className="flex flex-col relative group/item min-h-0 mb-8 lg:mb-0">
                        {/* Process ID & Status Header */}
                        <div className="flex items-center justify-between mb-3 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05] group-hover/item:border-amber-500/30 transition-all shrink-0">
                            <span className="text-[9px] font-mono text-amber-400/80 font-bold">{exp.pid}</span>
                            <div className="flex items-center">
                                <span className={`text-[8px] font-mono mr-2 ${index === 0 ? 'text-green-500' : 'text-slate-600'}`}>
                                    {exp.status}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-green-500 animate-ping' : 'bg-slate-700'}`}></div>
                            </div>
                        </div>

                        <div className="mb-3 shrink-0 px-1">
                            <div className="text-[10px] font-mono text-slate-500 mb-1">{exp.period}</div>
                            <h4 className="text-[14px] lg:text-[16px] font-bold text-white uppercase tracking-tight group-hover/item:text-amber-300 transition-colors leading-tight">
                                {exp.role}
                            </h4>
                            <div className="text-[12px] lg:text-[13px] text-amber-400 font-mono font-bold mt-1.5 flex items-center">
                                {exp.company}
                                <Zap size={10} className="ml-2 text-amber-500/40" />
                            </div>
                        </div>

                        <div className="space-y-2.5 flex-1 lg:overflow-y-auto scrollbar-none px-1 py-1 min-h-0">
                            {exp.highlights.map((point, i) => (
                                <div key={i} className="flex items-start text-[11px] lg:text-[12px] text-slate-300 leading-relaxed font-bold break-words">
                                    <div className="w-1.5 h-1.5 rounded-full border border-amber-500/40 mt-1.5 mr-3 shrink-0 group-hover/item:border-amber-400 transition-colors"></div>
                                    <span dangerouslySetInnerHTML={{ __html: point }}></span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5 shrink-0 px-1 pb-1">
                            {exp.tech.map((t, i) => (
                                <span key={i} className="text-[9px] font-mono bg-amber-500/10 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20 hover:border-amber-400/50 transition-colors">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Metrics */}
            <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center text-[11px] text-slate-400 font-mono">
                        <div className="w-2 h-2 rounded-full bg-amber-500/50 mr-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        EDUC: B.TECH_CS.21
                    </div>
                    <div className="hidden sm:flex items-center text-[10px] text-slate-600 font-mono">
                        <span className="mr-2 uppercase tracking-tighter">Availability:</span>
                        <span className="text-amber-400 font-bold">ACTIVE_POOL</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-700 font-mono uppercase tracking-[0.3em] font-bold">STATE::SYNCED</div>
            </div>
        </div>
    );
}
