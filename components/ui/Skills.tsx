"use client";

import { Cpu, Binary } from "lucide-react";

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
        <div className="h-full w-full p-5 overflow-hidden flex flex-col group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-amber-400 uppercase tracking-[0.2em] flex items-center">
                    <Cpu size={14} className="mr-2 text-amber-500/70" />
                    Core_Stack.kernel
                </h3>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-2.5 overflow-hidden">
                        <div className="text-[12px] font-mono text-slate-400 uppercase tracking-tighter flex items-center mb-1">
                            <div className="w-1.5 h-1.5 bg-amber-500/50 rounded-full mr-2"></div>
                            {cat.name}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {cat.skills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="bg-amber-500/10 text-slate-200 text-[11px] font-mono px-2 py-1 rounded border border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/20 hover:text-white transition-all cursor-default"
                                >
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
