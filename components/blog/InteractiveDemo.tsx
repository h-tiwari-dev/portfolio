'use client';

import { useEffect, useMemo, useState } from 'react';

type DemoPreset = 'sorting' | 'traversal' | 'shortest-path' | 'chart';

type DemoState = {
  title: string;
  values: number[];
  labels: string[];
  active: number[];
  highlightPath?: number[];
};

function seededValues(count: number, min: number, max: number) {
  return seededValuesWithSeed(42, count, min, max);
}

function seededValuesWithSeed(seed: number, count: number, min: number, max: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  return Array.from({ length: count }, () =>
    Math.floor(next() * (max - min + 1)) + min
  );
}

function bubbleSortSteps(values: number[]) {
  const arr = [...values];
  const steps: DemoState[] = [
    {
      title: 'Initial array',
      values: [...arr],
      labels: arr.map((_, i) => `#${i + 1}`),
      active: [],
    },
  ];

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({
        title: `Compare positions ${j + 1} and ${j + 2}`,
        values: [...arr],
        labels: arr.map((_, idx) => `#${idx + 1}`),
        active: [j, j + 1],
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          title: `Swap ${j + 1} and ${j + 2}`,
          values: [...arr],
          labels: arr.map((_, idx) => `#${idx + 1}`),
          active: [j, j + 1],
        });
      }
    }
  }

  steps.push({
    title: 'Sorted',
    values: [...arr],
    labels: arr.map((_, i) => `#${i + 1}`),
    active: [],
  });
  return steps;
}

function traversalSteps() {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const sequence = [0, 1, 2, 3, 4, 5];
  const steps: DemoState[] = [];
  const visited: number[] = [];

  for (const node of sequence) {
    visited.push(node);
    steps.push({
      title: `BFS visit: ${labels[node]}`,
      values: visited.map((_, idx) => idx + 1).concat(
        Array.from({ length: labels.length - visited.length }, () => 0)
      ),
      labels,
      active: [...visited],
      highlightPath: [...visited],
    });
  }
  return steps;
}

function shortestPathSteps() {
  const labels = ['S', 'A', 'B', 'C', 'D', 'T'];
  const distanceProgress = [
    [0, 7, 2, 0, 0, 0],
    [0, 5, 2, 6, 0, 0],
    [0, 5, 2, 6, 9, 0],
    [0, 5, 2, 6, 8, 11],
    [0, 5, 2, 6, 8, 10],
  ];

  return distanceProgress.map((values, step) => ({
    title: `Dijkstra iteration ${step + 1}`,
    values,
    labels,
    active: values
      .map((v, i) => ({ v, i }))
      .filter((x) => x.v > 0 || x.i === 0)
      .map((x) => x.i),
    highlightPath: [0, 2, 3, 4, 5].slice(0, Math.min(step + 2, 5)),
  }));
}

function chartSteps(values: number[]) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return [
    {
      title: 'Weekly baseline',
      values,
      labels,
      active: [],
    },
    {
      title: 'Traffic spike',
      values: values.map((v, i) => (i === 3 ? v + 30 : v)),
      labels,
      active: [3],
    },
    {
      title: 'Weekend dip',
      values: values.map((v, i) => (i > 4 ? Math.max(5, v - 20) : v)),
      labels,
      active: [5, 6],
    },
  ];
}

function buildSteps(preset: DemoPreset, seed: number): DemoState[] {
  if (preset === 'sorting') return bubbleSortSteps(seededValuesWithSeed(seed, 8, 8, 95));
  if (preset === 'traversal') return traversalSteps();
  if (preset === 'shortest-path') return shortestPathSteps();
  return chartSteps(seededValuesWithSeed(seed, 7, 15, 80));
}

export default function InteractiveDemo({ preset = 'sorting' }: { preset?: DemoPreset }) {
  const [seed, setSeed] = useState(42);
  const [steps, setSteps] = useState<DemoState[]>(() => buildSteps(preset, 42));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[index];
  const maxValue = useMemo(
    () => Math.max(1, ...steps.flatMap((s) => s.values)),
    [steps]
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 650);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  function stepForward() {
    setIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function reset() {
    setPlaying(false);
    setIndex(0);
  }

  function randomize() {
    setPlaying(false);
    const nextSeed = (seed + 137) % 100000;
    setSeed(nextSeed);
    const next = buildSteps(preset, nextSeed);
    setSteps(next);
    setIndex(0);
  }

  return (
    <div className="my-8 border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Interactive Demo
          </p>
          <h4 className="text-sm sm:text-base text-white font-semibold">
            {current.title}
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Step {index + 1}/{steps.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {current.values.map((value, i) => {
          const height = `${Math.max(8, (value / maxValue) * 100)}%`;
          const active = current.active.includes(i);
          return (
            <div key={`${i}-${current.labels[i]}`} className="flex flex-col gap-1">
              <div className="h-24 sm:h-28 flex items-end border border-neutral-800 px-2 pb-2 bg-neutral-900">
                <div
                  className={`w-full transition-all duration-300 ${
                    active ? 'bg-rose-500' : 'bg-slate-500'
                  }`}
                  style={{ height }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={active ? 'text-rose-400' : 'text-slate-500'}>
                  {current.labels[i]}
                </span>
                <span className="text-slate-400">{value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="px-3 py-1.5 text-xs font-mono border border-neutral-700 text-slate-200 hover:border-rose-700 hover:text-white transition-colors"
        >
          Play
        </button>
        <button
          type="button"
          onClick={() => setPlaying(false)}
          className="px-3 py-1.5 text-xs font-mono border border-neutral-700 text-slate-200 hover:border-rose-700 hover:text-white transition-colors"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={stepForward}
          className="px-3 py-1.5 text-xs font-mono border border-neutral-700 text-slate-200 hover:border-rose-700 hover:text-white transition-colors"
        >
          Step
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 text-xs font-mono border border-neutral-700 text-slate-200 hover:border-rose-700 hover:text-white transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={randomize}
          className="px-3 py-1.5 text-xs font-mono border border-neutral-700 text-slate-200 hover:border-rose-700 hover:text-white transition-colors"
        >
          Randomize
        </button>
      </div>

      <noscript>
        <p className="mt-3 text-xs text-slate-500">
          Interactive demo requires JavaScript. Core article content remains available.
        </p>
      </noscript>
    </div>
  );
}
