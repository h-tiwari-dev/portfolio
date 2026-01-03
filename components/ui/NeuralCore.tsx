"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NeuralCore() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Central Core */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-32 h-32 rounded-full border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                />

                {/* Orbiting Paths */}
                {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 m-auto w-48 h-12 border-x border-amber-500/20 rounded-full"
                        style={{ rotate: rotation }}
                        animate={{
                            rotate: rotation + 360,
                            scale: [1, 1.05, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            rotate: { duration: 15 + i * 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                    />
                ))}

                {/* Neural Connections */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <motion.circle
                        cx="50" cy="50" r="1"
                        fill="#f59e0b"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.line
                            key={i}
                            x1="50" y1="50"
                            x2={50 + Math.cos(i * Math.PI / 6) * 35}
                            y2={50 + Math.sin(i * Math.PI / 6) * 35}
                            stroke="#f59e0b"
                            strokeWidth="0.2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: [0, 1, 0.2],
                                opacity: [0, 0.4, 0]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
