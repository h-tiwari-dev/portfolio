"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function ScrollSection({ children, className = "", id }: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`h-screen w-full flex items-center justify-center p-4 md:p-8 snap-start snap-always ${className}`}
    >
      {children}
    </motion.section>
  );
}
