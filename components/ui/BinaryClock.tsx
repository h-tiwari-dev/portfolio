"use client";

import { useEffect, useState } from "react";

export default function BinaryClock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    const toBinary = (num: number) => num.toString(2).padStart(6, '0').split('');

    const hours = toBinary(time.getHours());
    const minutes = toBinary(time.getMinutes());
    const seconds = toBinary(time.getSeconds());

    const BitGroup = ({ label, bits }: { label: string, bits: string[] }) => (
        <div className="flex flex-col items-center">
            <div className="flex space-x-0.5 mb-1">
                {bits.map((bit, i) => (
                    <div
                        key={i}
                        className={`w-1 h-1 rounded-sm transition-all duration-500 ${bit === '1' ? 'bg-amber-400 shadow-[0_0_5px_#f59e0b]' : 'bg-white/10'}`}
                    />
                ))}
            </div>
            <span className="text-[6px] font-mono text-slate-500 font-bold">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/[0.03] border border-white/5 rounded-md">
            <div className="flex flex-col mr-1 sm:mr-2 pr-1 sm:pr-2 border-r border-white/5">
                <span className="text-[7px] font-mono text-amber-500/50 font-bold uppercase tracking-widest">Sys_Clock</span>
                <span className="text-[9px] font-mono text-slate-400 leading-none">
                    {time.getHours().toString().padStart(2, '0')}:
                    {time.getMinutes().toString().padStart(2, '0')}
                </span>
            </div>
            <div className="flex space-x-1.5 sm:space-x-2">
                <BitGroup label="HRS" bits={hours} />
                <BitGroup label="MIN" bits={minutes} />
                <BitGroup label="SEC" bits={seconds} />
            </div>
        </div>
    );
}
