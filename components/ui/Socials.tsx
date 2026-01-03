"use client";

import React, { useState } from "react";
import { Share2, Github, Linkedin, Mail, Twitter, ChevronRight, FileDown } from "lucide-react";
import ContactModal from "@/components/common/ContactModal";
import BinaryClock from "./BinaryClock";

export default function Socials() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    const links = [
        { icon: Github, label: "GH_Vault", color: "hover:text-white", sub: "Sources" },
        { icon: Linkedin, label: "LI_Network", color: "hover:text-blue-400", sub: "Profile" },
        { icon: Twitter, label: "TW_Stream", color: "hover:text-sky-400", sub: "Feeds" },
        { icon: Mail, label: "EM_Gateway", color: "hover:text-red-400", sub: "Message", onClick: () => setIsContactOpen(true) },
    ];

    return (
        <div className="p-5 h-full flex flex-col group/comms">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">
                    <Share2 size={14} className="mr-2 text-cyan-500" />
                    Comms_Interface.link
                </div>
                <div className="flex items-center space-x-2">
                    <div className="">
                        <BinaryClock />
                    </div>
                </div>
            </div>

            {/* Primary Action: Resume Download */}
            <div
                onClick={() => window.open('/resume.pdf', '_blank')}
                className="mb-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]"
            >
                <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/40 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                        <FileDown size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[9px] font-mono text-amber-500/60 font-bold uppercase tracking-[0.2em] mb-0.5">
                            S_IDENTITY.FETCH_RESUME()
                        </div>
                        <div className="text-[13px] text-white font-bold tracking-tight flex items-center group-hover:text-amber-50 transition-colors">
                            <span className="opacity-90">system_service.download</span>
                            <span className="text-amber-400/80">(</span>
                            <span className="text-amber-400">&apos;Resume.pdf&apos;</span>
                            <span className="text-amber-400/80">)</span>
                            <ChevronRight size={14} className="ml-1.5 text-amber-500/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
                <div className="text-[9px] font-mono text-amber-500/30 font-bold uppercase hidden md:block relative z-10">
                    VER: 2.0.FINAL
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {links.map((item, i) => (
                    <div
                        key={i}
                        onClick={item.onClick || (() => { })}
                        className="group flex flex-col p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Module Header */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center">
                                <item.icon size={18} className={`mr-3 text-slate-500 ${item.color} transition-colors group-hover:scale-110`} />
                                <div>
                                    <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tight group-hover:text-white transition-colors">
                                        {item.label}
                                    </div>
                                    <div className="text-[7px] font-mono text-cyan-500/50 uppercase tracking-[0.2em]">CONNECTED_LINK.0{i + 1}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="flex space-x-0.5 mb-1">
                                    {[1, 2, 3, 4].map(bar => (
                                        <div key={bar} className={`w-0.5 h-2 ${bar <= (4 - i) ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                                    ))}
                                </div>
                                <span className="text-[6px] font-mono text-slate-500 uppercase">Signal</span>
                            </div>
                        </div>

                        {/* Module Meta */}
                        <div className="flex items-center space-x-3 mt-auto relative z-10">
                            <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[7px] font-mono text-cyan-400 uppercase">
                                {item.sub}
                            </div>
                            <div className="h-px flex-1 bg-white/5 group-hover:bg-cyan-500/20 transition-colors"></div>
                            <ChevronRight size={12} className="text-slate-700 group-hover:text-cyan-500 transition-all group-hover:translate-x-1" />
                        </div>

                        {/* Scanner Effect */}
                        <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none -z-10"></div>
                        <div className="absolute top-0 right-0 p-1 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                            <Share2 size={32} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                <div className="text-[9px] text-slate-600 font-mono flex items-center space-x-4">
                    <span className="flex items-center"><div className="w-1 h-1 bg-cyan-500 rounded-full mr-1 anim-pulse"></div> ENCRYPTION: AES-256</span>
                    <span className="flex items-center px-3 border-x border-white/5"><div className="w-1 h-1 bg-green-500 rounded-full mr-1 anim-pulse"></div> SIGNAL: STABLE</span>
                </div>
            </div>

            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </div>
    );
}
