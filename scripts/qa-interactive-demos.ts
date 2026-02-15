import { readFileSync } from 'fs';
import { resolve } from 'path';

const interactiveDemoPath = resolve(
  process.cwd(),
  'components/blog/InteractiveDemo.tsx'
);
const markdocRendererPath = resolve(
  process.cwd(),
  'components/blog/MarkdocRenderer.tsx'
);

const interactiveSource = readFileSync(interactiveDemoPath, 'utf8');
const markdocSource = readFileSync(markdocRendererPath, 'utf8');

const requiredControls = ['Play', 'Pause', 'Step', 'Reset', 'Randomize'];
const requiredPresets = ['sorting', 'traversal', 'shortest-path', 'chart'];
const missing: string[] = [];

for (const control of requiredControls) {
  const controlRegex = new RegExp(`>\\s*${control}\\s*<`, 'm');
  if (!controlRegex.test(interactiveSource)) {
    missing.push(`missing control button: ${control}`);
  }
}

for (const preset of requiredPresets) {
  if (!interactiveSource.includes(`'${preset}'`)) {
    missing.push(`missing preset: ${preset}`);
  }
}

if (!markdocSource.includes('interactiveDemo')) {
  missing.push('missing Markdoc interactiveDemo tag');
}

if (!markdocSource.includes('InteractiveDemo')) {
  missing.push('InteractiveDemo component not registered in Markdoc renderer');
}

if (missing.length) {
  console.error('Interactive demo QA failed:');
  for (const issue of missing) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Interactive demo QA passed.');
