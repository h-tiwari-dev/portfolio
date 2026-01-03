"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Terminal, Send, ShieldCheck, Mail, User, MessageSquare } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");

        // Simulated transmission animation
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setStatus("success");
                setTimeout(() => {
                    onClose();
                    setStatus("idle");
                    setFormData({ name: "", email: "", message: "" });
                }, 2500);
            }
            setProgress(p);
        }, 150);
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-lg bg-[#0a0f1e] border border-indigo-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                    >
                        {/* Terminal Header */}
                        <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-2">
                                <Terminal size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">
                                    S_MESSAGE_DISPATCHER.EXE
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Status Bar */}
                        <div className="bg-black/40 px-4 py-2 flex items-center space-x-4 border-b border-white/5 shrink-0">
                            <div className="flex items-center text-[9px] font-mono">
                                <span className="text-slate-500 mr-2">STATE:</span>
                                <span className={status === "success" ? "text-green-500" : "text-indigo-400"}>
                                    {status === "idle" ? "READY_TO_DISPATCH" : status === "sending" ? "UPLOADING_PACKETS" : "DISPATCH_SUCCESS"}
                                </span>
                            </div>
                            <div className="flex items-center text-[9px] font-mono">
                                <span className="text-slate-500 mr-2">ID:</span>
                                <span className="text-slate-300">MSG_{Math.random().toString(36).substring(7).toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-6">
                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                        <ShieldCheck size={32} className="text-green-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Transmission Complete</h3>
                                        <p className="text-[11px] font-mono text-slate-500 mt-1 uppercase">Message has been encrypted and dispatched to destination gateway.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Name Input */}
                                        <div className="space-y-1.5 group">
                                            <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                                <User size={10} className="mr-1.5" />
                                                <span>USER_NAME:</span>
                                            </div>
                                            <input
                                                required
                                                placeholder="JOHN_DOE"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-1.5 group">
                                            <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                                <Mail size={10} className="mr-1.5" />
                                                <span>SET_SOURCE_EMAIL:</span>
                                            </div>
                                            <input
                                                required
                                                type="email"
                                                placeholder="SOURCE@PROVIDER.COM"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        {/* Message Input */}
                                        <div className="space-y-1.5 group">
                                            <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                                <MessageSquare size={10} className="mr-1.5" />
                                                <span>SET_PAYLOAD:</span>
                                            </div>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="ENCRYPTED_MESSAGE_BLOCK"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all resize-none"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="pt-2">
                                        {status === "sending" ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400">
                                                    <span className="animate-pulse">TRANSMITTING...</span>
                                                    <span>{Math.round(progress)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                                                    />
                                                </div>
                                                <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
                                                    Packet fragmentation detected // Re-routing via node_delta
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="w-full h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/60 transition-all flex items-center justify-center space-x-3 group active:scale-[0.98]"
                                            >
                                                <Send size={16} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-widest">Execute Dispatch</span>
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Terminal Footer */}
                        <div className="bg-black/60 p-3 border-t border-white/5 text-center shrink-0">
                            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.3em]">
                                Secure_Link_V3.8 // End_to_End_Encryption_Active
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
