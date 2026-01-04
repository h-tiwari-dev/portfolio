"use client";

import { Cpu, Binary } from "lucide-react";
import NeuralCore from "./NeuralCore";

export default function Skills() {
    const categories = [
        {
            name: "Languages",
            skills: ["Python", "GoLang", "Rust", "C++", "SQL", "Java", "TypeScript", "JavaScript"]
        },
        {
            name: "Frontend/Web",
            skills: ["ReactJS", "Next.js", "Vue", "NuxtJs", "AngularJS", "HTML", "CSS", "Tailwind"]
        },
        {
            name: "Backend/Infra",
            skills: ["Node.js", "NestJS", "Kubernetes", "Docker", "Kafka", "Redis", "Airflow"]
        },
        {
            name: "Storage/ML",
            skills: ["MySQL", "Postgres", "MongoDB", "ClickHouse", "Pinecone", "PyTorch", "TensorFlow"]
        },
        {
            name: "DevOps & Tools",
            skills: ["Bash", "Git", "GitHub", "Linux", "Vim/NeoVim", "VS Code", "Jupyter"]
        }
    ];

    return (
        <div className="p-4 h-full overflow-hidden flex flex-col group relative">
            <NeuralCore />
            <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.2em] flex items-center">
                    <Cpu size={14} className="mr-2 text-amber-500/70" />
                    Core_Stack.kernel
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pr-1 content-between">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5 overflow-hidden mb-2">
                        <div className="text-[14px] font-mono text-slate-400 uppercase tracking-tighter flex items-center mb-0.5">
                            <div className="w-1 h-1 bg-amber-500/50 rounded-full mr-1.5"></div>
                            {cat.name}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {cat.skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="bg-amber-500/5 text-slate-300 text-[10px] font-mono px-2 py-1 rounded-sm border border-amber-500/10 hover:border-amber-400/40 transition-all cursor-default flex items-center group/skill"
                                >
                                    <span className="text-amber-500/30 mr-1.5 group-hover/skill:text-amber-500/60 transition-colors">[{`0x${(skill.length * i + 10).toString(16).toUpperCase()}`}]</span>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
