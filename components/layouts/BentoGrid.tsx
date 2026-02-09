import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
    children: React.ReactNode;
}

export const BentoGrid = ({ children }: BentoGridProps) => {
    return (
        <div className="w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-12 gap-4 h-screen box-border overflow-hidden">
            {children}
        </div>
    );
};

export const BentoItem = ({
    children,
    className = "",
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className={`
        bg-slate-900
        border border-slate-700
        overflow-hidden
        shadow-lg hover:border-indigo-700 transition-all duration-300
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
};
