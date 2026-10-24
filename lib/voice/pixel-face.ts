import type { Viseme } from '@/lib/voice/types';

export const FACE_W = 64;
export const FACE_H = 80;

export interface FaceFrame {
  rgba: Uint8ClampedArray;
  allowText: Uint8Array;
}

type Kind =
  | 'empty'
  | 'skin'
  | 'hair'
  | 'brow'
  | 'sclera'
  | 'iris'
  | 'pupil'
  | 'catch'
  | 'lip'
  | 'cavity'
  | 'teeth'
  | 'collar'
  | 'nostril';

interface Sample {
  kind: Kind;
  light: number;
  protect: boolean;
}

const EMPTY: Sample = { kind: 'empty', light: 0, protect: false };

const PALETTE: Record<Exclude<Kind, 'empty'>, number[][]> = {
  skin: [
    [5, 16, 15],
    [10, 38, 34],
    [20, 74, 66],
    [42, 124, 110],
    [92, 186, 166],
    [176, 232, 216],
  ],
  hair: [
    [2, 8, 7],
    [6, 20, 18],
    [12, 40, 34],
    [22, 64, 56],
  ],
  brow: [
    [2, 6, 6],
    [8, 18, 16],
  ],
  sclera: [
    [150, 214, 200],
    [214, 246, 236],
    [236, 255, 248],
  ],
  iris: [
    [8, 36, 34],
    [16, 78, 70],
    [36, 120, 108],
  ],
  pupil: [[1, 4, 6]],
  catch: [[232, 255, 248]],
  lip: [
    [8, 28, 26],
    [18, 64, 58],
    [40, 112, 100],
    [78, 160, 144],
  ],
  cavity: [[3, 7, 8]],
  teeth: [
    [150, 206, 194],
    [214, 242, 232],
  ],
  collar: [
    [6, 18, 16],
    [12, 32, 28],
  ],
  nostril: [[3, 10, 10]],
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const MOUTH: Record<Viseme, { rx: number; ry: number; lip: number; teeth: boolean }> = {
  rest: { rx: 0.084, ry: 0.008, lip: 0.014, teeth: false },
  mbp: { rx: 0.08, ry: 0, lip: 0.016, teeth: false },
  fv: { rx: 0.096, ry: 0.012, lip: 0.014, teeth: true },
  ee: { rx: 0.128, ry: 0.026, lip: 0.012, teeth: true },
  ah: { rx: 0.078, ry: 0.052, lip: 0.016, teeth: true },
  oh: { rx: 0.05, ry: 0.04, lip: 0.015, teeth: false },
  oo: { rx: 0.034, ry: 0.026, lip: 0.014, teeth: false },
  l: { rx: 0.058, ry: 0.02, lip: 0.014, teeth: false },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hash(x: number, y: number) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function falloff(dx: number, dy: number, rx: number, ry: number) {
  const a = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
  if (a >= 1) return 0;
  const t = 1 - a;
  return t * t;
}

function mouthSample(nx: number, ny: number, viseme: Viseme, jaw: number): Sample | null {
  const shape = MOUTH[viseme];
  const x = nx - 0.5;
  const y = ny - (0.648 + jaw * 0.35);
  const envelope = (x / (shape.rx + 0.02)) ** 2 + (y / (Math.max(shape.ry, 0.01) + shape.lip + 0.008)) ** 2;
  if (envelope > 1.05) return null;

  if (shape.ry === 0) {
    const pressed = (x / shape.rx) ** 2 + (y / 0.018) ** 2;
    if (pressed <= 1) return { kind: 'lip', light: 0.04, protect: true };
    return null;
  }

  const opening = (x / shape.rx) ** 2 + (y / shape.ry) ** 2;
  if (opening <= 1) {
    const teethBand = shape.teeth && y < -shape.ry * 0.35 && Math.abs(x) < shape.rx * 0.72;
    if (teethBand) return { kind: 'teeth', light: y < -shape.ry * 0.62 ? 0.86 : 0.62, protect: true };
    return { kind: 'cavity', light: 0.05, protect: true };
  }

  const lip = (x / (shape.rx + 0.012)) ** 2 + (y / (shape.ry + shape.lip)) ** 2;
  if (lip <= 1) {
    const upper = y < 0;
    return { kind: 'lip', light: upper ? 0.3 : 0.48, protect: true };
  }

  return null;
}

function shade(nx: number, ny: number, viseme: Viseme, blink: number, listen: number, look: number): Sample {
  const cx = 0.5;
  const headCy = 0.47;
  const jaw = viseme === 'ah' ? 0.03 : viseme === 'oh' ? 0.018 : viseme === 'oo' ? 0.01 : 0;
  const dx = nx - cx;
  const jawZone = ny > 0.63 && ny < 0.86 && Math.abs(dx) < 0.22 - Math.max(0, ny - 0.7) * 0.25;
  const sampleY = jaw && jawZone && ny > 0.66 + jaw ? ny - jaw : ny;
  const dy = sampleY - headCy;

  let hx = dx / 0.34;
  let hy = dy / 0.33;
  if (hy > 0.28) {
    const pinch = 1 - Math.min(1, (hy - 0.28) / 0.72) ** 2 * 0.18;
    hx /= Math.max(0.78, pinch);
  }
  if (hy > -0.15 && hy < 0.45) hx *= 0.94;
  const headD = hx * hx + hy * hy;
  const inHead = headD < 1;

  const earAt = (side: number) => {
    const ex = (nx - (cx + side * 0.33)) / 0.045;
    const ey = (sampleY - 0.5) / 0.08;
    return ex * ex + ey * ey;
  };
  const inEar = earAt(-1) < 1 || earAt(1) < 1;
  const neckHalf = 0.125;
  const inNeck = sampleY > 0.76 && sampleY < 0.94 && Math.abs(dx) < neckHalf;
  const shoulder = (dx / 0.46) ** 2 + ((sampleY - 0.98) / 0.16) ** 2;
  const inShoulder = sampleY > 0.82 && shoulder < 1;

  if (!inHead && !inEar && !inNeck && !inShoulder) return EMPTY;

  const mouth = mouthSample(nx, ny, viseme, jaw);
  if (mouth && (inHead || jawZone)) return mouth;

  if ((inShoulder || sampleY > 0.9) && !inHead) {
    return { kind: 'collar', light: 0.22 + hash(nx * 40, ny * 40) * 0.15, protect: false };
  }

  const absDx = Math.abs(dx);
  const hairLine = 0.3 + absDx * 0.16;
  const inHair = (inHead && sampleY < hairLine) || (inHead && absDx > 0.25 && sampleY < 0.5);

  const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, headD)));
  let light = hx * -0.38 + hy * -0.58 + nz * 0.72;
  light = light * 0.48 + 0.42;
  light -= Math.max(0, dx) * 0.62;
  light += Math.max(0, -dx) * 0.06;
  light += falloff(dx + 0.02, sampleY - 0.34, 0.11, 0.055) * 0.2;
  light += falloff(dx + 0.09, sampleY - 0.56, 0.07, 0.045) * 0.08;
  light -= falloff(dx + 0.105, sampleY - 0.455, 0.075, 0.05) * 0.5;
  light -= falloff(dx - 0.105, sampleY - 0.455, 0.075, 0.05) * 0.5;
  light -= falloff(dx, sampleY - 0.595, 0.04, 0.022) * 0.3;
  light -= Math.max(0, sampleY - 0.73) * 0.85;
  if (Math.abs(dx) < 0.014 && sampleY > 0.5 && sampleY < 0.585) light += 0.16;
  if (Math.abs(dx) < 0.012 && sampleY > 0.595 && sampleY < 0.64) light -= 0.14;
  if (headD > 0.72) light *= 1 - (headD - 0.72) * 1.15;
  if (inEar && !inHead) light *= earAt(-1) < 0.28 || earAt(1) < 0.28 ? 0.35 : 0.62;
  if (inNeck && !inHead) light *= 0.5;

  light *= 0.9 + hash(Math.floor(nx * 90), Math.floor(ny * 90)) * 0.12;
  light = clamp(light, 0, 1);
  light = Math.pow(light, 1.42) * 0.92;

  const open = (listen > 0 ? 1.16 : 1) * (1 - clamp(blink, 0, 1));
  const eyeCenters = [-0.108, 0.108];

  if (inHead && !inHair) {
    for (const ex of eyeCenters) {
      const eyeX = cx + ex;
      const ry = 0.024 * Math.max(open, 0);
      if (ry < 0.004) {
        if (Math.abs(nx - eyeX) < 0.05 && Math.abs(sampleY - 0.458) < 0.007) {
          return { kind: 'brow', light: 0.18, protect: true };
        }
        continue;
      }

      const edx = (nx - eyeX) / 0.052;
      const edy = (sampleY - 0.458) / ry;
      if (edx * edx + edy * edy > 1) continue;

      const pupilX = eyeX + look * 0.01;
      const iris = ((nx - pupilX) / 0.03) ** 2 + ((sampleY - 0.46) / (ry * 0.92)) ** 2;
      const pupil = ((nx - pupilX) / 0.012) ** 2 + ((sampleY - 0.462) / (Math.max(ry, 0.012) * 0.7)) ** 2;
      const catchlight =
        open > 0.45 &&
        nx > eyeX - 0.03 &&
        nx < eyeX - 0.012 &&
        sampleY > 0.446 &&
        sampleY < 0.456;

      if (pupil <= 1) return { kind: 'pupil', light: 0.04, protect: true };
      if (catchlight && iris > 1) return { kind: 'catch', light: 1, protect: true };
      if (iris <= 1) return { kind: 'iris', light: 0.4 + (1 - iris) * 0.25, protect: true };
      const lidShade = clamp(1 - (sampleY - (0.458 - ry)) / (ry * 0.7), 0, 1);
      return { kind: 'sclera', light: clamp(0.78 - lidShade * 0.2, 0, 1), protect: true };
    }

    for (const ex of eyeCenters) {
      const t = (nx - (cx + ex - 0.055)) / 0.1;
      if (t < 0 || t > 1) continue;
      const browY = 0.385 + (1 - t) * 0.012 + (listen > 0 ? -0.008 : 0);
      if (Math.abs(sampleY - browY) < 0.011) return { kind: 'brow', light: 0.15, protect: true };
    }

    if (falloff(nx - 0.472, sampleY - 0.588, 0.016, 0.011) > 0.45) {
      return { kind: 'nostril', light: 0.1, protect: true };
    }
    if (falloff(nx - 0.528, sampleY - 0.588, 0.016, 0.011) > 0.45) {
      return { kind: 'nostril', light: 0.1, protect: true };
    }
  }

  if (inHair) return { kind: 'hair', light: clamp(light * 0.55, 0, 1), protect: false };
  if (inNeck && !inHead) return { kind: 'skin', light: clamp(light * 0.7, 0, 1), protect: false };
  if (!inHead && inEar) return { kind: 'skin', light: clamp(light, 0, 1), protect: false };

  return { kind: 'skin', light, protect: false };
}

function colorize(sample: Sample, x: number, y: number): [number, number, number, number] {
  if (sample.kind === 'empty') return [0, 0, 0, 0];
  const palette = PALETTE[sample.kind];
  const dither = (BAYER[y & 3][x & 3] / 16 - 0.5) * (1 / palette.length);
  const index = clamp(Math.floor((sample.light + dither) * palette.length), 0, palette.length - 1);
  let [r, g, b] = palette[index];

  if (sample.kind !== 'cavity' && sample.kind !== 'pupil' && sample.kind !== 'teeth' && y % 4 === 3) {
    r = Math.round(r * 0.7);
    g = Math.round(g * 0.7);
    b = Math.round(b * 0.7);
  }

  return [r, g, b, 255];
}

export function renderFace(options: {
  viseme: Viseme;
  blink: number;
  listen: number;
  look: number;
}): FaceFrame {
  const rgba = new Uint8ClampedArray(FACE_W * FACE_H * 4);
  const allowText = new Uint8Array(FACE_W * FACE_H);
  const steps = 3;

  for (let y = 0; y < FACE_H; y++) {
    for (let x = 0; x < FACE_W; x++) {
      let light = 0;
      let weight = 0;
      const counts = new Map<Kind, number>();

      for (let sy = 0; sy < steps; sy++) {
        for (let sx = 0; sx < steps; sx++) {
          const nx = (x + (sx + 0.5) / steps) / FACE_W;
          const ny = (y + (sy + 0.5) / steps) / FACE_H;
          const sample = shade(nx, ny, options.viseme, options.blink, options.listen, options.look);
          counts.set(sample.kind, (counts.get(sample.kind) ?? 0) + 1);
          if (sample.kind !== 'empty') {
            light += sample.light;
            weight += 1;
          }
        }
      }

      let kind: Kind = 'empty';
      const featureRank: Kind[] = ['pupil', 'catch', 'teeth', 'cavity', 'iris', 'nostril', 'brow', 'sclera', 'lip'];
      const strong = new Set<Kind>(['pupil', 'teeth', 'catch']);
      for (const candidate of featureRank) {
        const count = counts.get(candidate) ?? 0;
        const need = candidate === 'cavity' ? 4 : strong.has(candidate) ? 1 : 2;
        if (count >= need) {
          kind = candidate;
          break;
        }
      }
      if (kind === 'empty') {
        const skin = counts.get('skin') ?? 0;
        const hair = counts.get('hair') ?? 0;
        const collar = counts.get('collar') ?? 0;
        const filled = skin + hair + collar;
        if (filled >= 4) kind = hair > skin ? 'hair' : collar > skin ? 'collar' : 'skin';
      }

      const sample: Sample = {
        kind,
        light: weight ? light / weight : 0,
        protect: false,
      };
      let [r, g, b, a] = colorize(sample, x, y);
      if (kind === 'collar' && a > 0) {
        const fade = clamp((0.97 - y / FACE_H) / 0.12, 0, 1);
        a = Math.round(a * fade * fade);
      }
      const index = (y * FACE_W + x) * 4;
      rgba[index] = r;
      rgba[index + 1] = g;
      rgba[index + 2] = b;
      rgba[index + 3] = a;
      allowText[y * FACE_W + x] =
        a > 200 && (kind === 'skin' || kind === 'hair') && y / FACE_H < 0.72 ? 1 : 0;
    }
  }

  return { rgba, allowText };
}
