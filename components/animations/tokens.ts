'use client';

export const motionDurations = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  page: 0.65,
} as const;

export const motionEasings = {
  standard: [0.25, 0.1, 0.25, 1],
  emphasized: [0.16, 1, 0.3, 1],
  decelerate: [0, 0, 0.2, 1],
} as const;

export const motionStaggers = {
  tight: 0.06,
  normal: 0.1,
  relaxed: 0.16,
} as const;
