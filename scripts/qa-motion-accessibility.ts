import { readFileSync } from 'fs';
import { resolve } from 'path';

const fadeInPath = resolve(process.cwd(), 'components/animations/FadeIn.tsx');
const source = readFileSync(fadeInPath, 'utf8');

const checks: Array<{ label: string; ok: boolean }> = [
  { label: 'useReducedMotion hook imported', ok: source.includes('useReducedMotion') },
  { label: 'FadeIn reduced-motion branch', ok: source.includes('reduced ? { opacity: 0 }') },
  { label: 'SlideIn reduced-motion branch', ok: source.includes("from = 'left'") && source.includes('reduced ? { opacity: 1 }') },
  { label: 'ScaleIn reduced-motion branch', ok: source.includes('scale: 0.95') && source.includes('reduced ? motionDurations.fast') },
  { label: 'Stagger reduced-motion behavior', ok: source.includes('staggerChildren: reduced ? 0 : stagger') },
];

const failed = checks.filter((check) => !check.ok);

if (failed.length) {
  console.error('Motion accessibility QA failed:');
  for (const check of failed) {
    console.error(`- ${check.label}`);
  }
  process.exit(1);
}

console.log('Motion accessibility QA passed.');
