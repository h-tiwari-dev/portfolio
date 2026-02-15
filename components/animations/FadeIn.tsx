'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { motionDurations, motionEasings, motionStaggers } from './tokens';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({
  children,
  className = '',
  delay = 0,
}: AnimatedContainerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? motionDurations.fast : motionDurations.slow,
        delay,
        ease: motionEasings.standard,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({
  children,
  className = '',
  delay = 0,
}: AnimatedContainerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? motionDurations.fast : motionDurations.page,
        delay,
        ease: motionEasings.standard,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className = '',
  stagger = motionStaggers.normal,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: reduced ? 0 : stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: motionDurations.slow, ease: motionEasings.standard }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  className = '',
  delay = 0,
  from = 'left',
}: AnimatedContainerProps & { from?: 'left' | 'right' | 'up' | 'down' }) {
  const reduced = useReducedMotion();
  const axis =
    from === 'left'
      ? { x: -24, y: 0 }
      : from === 'right'
      ? { x: 24, y: 0 }
      : from === 'up'
      ? { x: 0, y: -24 }
      : { x: 0, y: 24 };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, ...axis }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: reduced ? motionDurations.fast : motionDurations.normal,
        delay,
        ease: motionEasings.emphasized,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  className = '',
  delay = 0,
}: AnimatedContainerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{
        duration: reduced ? motionDurations.fast : motionDurations.normal,
        delay,
        ease: motionEasings.emphasized,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Backward-compatible alias
export const StaggerContainer = StaggerGroup;
