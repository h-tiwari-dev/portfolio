"use client";

import React, { useState } from "react";
import { Share2, Github, Linkedin, Mail, BookOpen, ChevronRight, FileDown, ExternalLink, Binary } from "lucide-react";
import ContactModal from "@/components/common/ContactModal";
import BinaryClock from "./BinaryClock";

export default function Socials() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    const links = [
        { icon: Github, label: "GH_Vault", color: "group-hover:text-white", sub: "Source_Control", url: "https://github.com/h-tiwari-dev", id: "01" },
        { icon: Linkedin, label: "LI_Network", color: "group-hover:text-blue-400", sub: "Social_Sync", url: "https://www.linkedin.com/in/tiwari-ai-harsh/", id: "02" },
        { icon: BookOpen, label: "BG_Hub", color: "group-hover:text-purple-400", sub: "Tech_Logs", url: "https://htiwaridev.hashnode.dev", id: "03" },
        { icon: Mail, label: "EM_Gateway", color: "group-hover:text-red-400", sub: "Direct_Comms", onClick: () => setIsContactOpen(true), id: "04" },
    ];

    return (
        <div className="p-4 h-full flex flex-col group/comms relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 shrink-0 relative z-10 gap-y-2 sm:gap-y-0">
                <div className="flex items-center text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">
                    <Share2 size={14} className="mr-2 text-cyan-500" />
                    Comms_Interface.link
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <div className="opacity-80">
                        <BinaryClock />
                    </div>
                </div>
            </div>

            {/* Primary Action: Resume Download */}
            <div
                onClick={() => window.open('/harsh_resume_new.pdf', '_blank')}
                className="mb-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)] shrink-0"
            >
                <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/40 transition-all">
                        <FileDown size={20} className="text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[9px] font-mono text-amber-500/60 font-bold uppercase tracking-tight">
                            Identity.fetch_resume()
                        </div>
                        <div className="text-[10px] sm:text-[12px] text-white font-bold tracking-tight flex flex-wrap items-center gap-y-0.5">
                            <span className="opacity-70">system_service.dl</span>
                            <span className="text-amber-400/80">(</span>
                            <span className="text-amber-400 break-all sm:break-normal">&apos;harsh_resume_new.pdf&apos;</span>
                            <span className="text-amber-400/80">)</span>
                            <ChevronRight size={14} className="ml-1 text-amber-500/40" />
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex flex-col items-end text-[8px] font-mono text-amber-500/30 font-bold uppercase">
                    <span>DL_STATUS: READY</span>
                    <span>VER: 3.1.C</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
                {links.map((item, i) => (
                    <div
                        key={i}
                        onClick={item.onClick || (() => window.open(item.url, '_blank'))}
                        className="group flex flex-col p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Static Deco Lines */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>

                        <div className="flex items-start justify-between relative z-10 mb-auto">
                            <div className="flex items-center">
                                <item.icon size={22} className={`mr-3 text-slate-500 ${item.color} transition-all duration-300 group-hover:scale-110`} />
                                <div>
                                    <h4 className="text-[14px] font-mono text-slate-200 font-bold uppercase tracking-tight group-hover:text-white transition-colors">
                                        {item.label}
                                    </h4>
                                    <div className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest mt-0.5">
                                        Channel.{item.id}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
                                {[1, 2, 3, 4].map(bar => (
                                    <div key={bar} className={`w-1 h-3 ${bar <= (4 - i) ? 'bg-cyan-500 shadow-[0_0_5px_#06b6d4]' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Space Filler: Technical Meta */}
                        <div className="flex-1 flex items-center justify-center opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none my-1">
                            <Binary size={40} className="text-white" />
                        </div>

                        {/* Module Footer */}
                        <div className="flex items-center justify-between relative z-10 mt-auto pt-2 border-t border-white/5">
                            <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-mono text-slate-500/80 group-hover:text-cyan-400/80 transition-colors">
                                    {item.sub}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="text-[7px] font-mono text-slate-600 uppercase">protocol: SSL/WS</span>
                                <ExternalLink size={10} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                            </div>
                        </div>

                        {/* Scanner Beam Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:animate-[scan_2s_linear_infinite] pointer-events-none"></div>
                    </div>
                ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 flex justify-center shrink-0">
                <div className="text-[8px] text-slate-600 font-mono flex flex-wrap justify-center gap-x-6 gap-y-1">
                    <span className="flex items-center"><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2 shadow-[0_0_5px_#06b6d4]"></div> UPLINK: STABLE</span>
                    <span className="flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shadow-[0_0_5px_#22c55e]"></div> LATENCY: 12ms</span>
                    <span className="flex items-center"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2 shadow-[0_0_5px_#f59e0b]"></div> BUFFER: 0%</span>
                </div>
            </div>

            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </div>
    );
}
