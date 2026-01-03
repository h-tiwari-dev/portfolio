"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Terminal, Send, ShieldCheck, Mail, User, Lock, Cpu, CheckCircle2 } from "lucide-react";

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
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-lg bg-[#0c0b0a] border border-amber-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                    >
                        {/* Terminal Header */}
                        <div className="bg-amber-500/10 px-4 py-2 border-b border-amber-500/20 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Terminal size={14} className="text-amber-400" />
                                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">Secure_Comm_Terminal // 0xAF32</span>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Status Bar */}
                        <div className="bg-black/40 px-4 py-1.5 border-b border-white/5 flex items-center space-x-4">
                            <div className="flex items-center text-[9px] text-slate-500">
                                <ShieldCheck size={10} className="mr-1 text-green-500" />
                                <span className="uppercase tracking-tighter">Encrypted</span>
                            </div>
                            <div className="flex items-center text-[9px] text-slate-500">
                                <Cpu size={10} className="mr-1 text-amber-500/50" />
                                <span className="uppercase tracking-tighter">Host: local_node</span>
                            </div>
                        </div>

                        <div className="p-6">
                            {status === 'idle' ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Name Field */}
                                        <div className="space-y-1.5 group">
                                            <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                                <User size={10} className="mr-1.5" />
                                                <span>USER_NAME:</span>
                                            </div>
                                            <input
                                                required
                                                placeholder="JOHN_DOE"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/[0.03] transition-all"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-1.5 group">
                                            <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                                <Mail size={10} className="mr-1.5" />
                                                <span>SET_SOURCE_EMAIL:</span>
                                            </div>
                                            <input
                                                required
                                                type="email"
                                                placeholder="SOURCE@PROVIDER.COM"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/[0.03] transition-all"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Message Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center text-[9px] font-mono text-slate-500 mb-1">
                                            <Lock size={10} className="mr-1.5" />
                                            <span>PAYLOAD_RAW:</span>
                                        </div>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="INITIATING_MESSAGE_BUFFER..."
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[12px] font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/[0.03] transition-all resize-none"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    {/* Transmission Trigger */}
                                    <button
                                        type="submit"
                                        className="w-full group/btn relative overflow-hidden bg-amber-500 text-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-amber-400 transition-all active:scale-[0.98]"
                                    >
                                        <Send size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        <span className="text-[12px] font-mono tracking-[0.2em] uppercase">Execute_Dispatch</span>

                                        {/* Scanline effect on button */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                    </button>
                                </form>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    {status === 'sending' ? (
                                        <>
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse rounded-full"></div>
                                                <Cpu size={48} className="text-amber-500 animate-[spin_3s_linear_infinite]" />
                                            </div>
                                            <div className="text-amber-400 font-mono text-[11px] uppercase tracking-[0.3em] mb-4">
                                                Transmitting_Packets...
                                            </div>
                                            <div className="w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2 }}
                                                    className="h-full bg-amber-500"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
                                                <CheckCircle2 size={32} className="text-green-500" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Transmission_Complete</h4>
                                            <p className="text-[12px] text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                            <button
                                                onClick={onClose}
                                                className="mt-8 text-[10px] text-amber-400 font-mono border border-amber-400/30 px-6 py-2 rounded-full hover:bg-amber-400/10 transition-all uppercase tracking-widest"
                                            >
                                                Return_to_Dashboard
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
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
