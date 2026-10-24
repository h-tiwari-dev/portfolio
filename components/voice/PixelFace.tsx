'use client';

import { useEffect, useRef } from 'react';
import { FACE_H, FACE_W, renderFace, type FaceFrame } from '@/lib/voice/pixel-face';
import type { Viseme, VoiceMode } from '@/lib/voice/types';

const CODE = [
  'stt.assemble(req)',
  'llm.stream(tokens)',
  'tool.exec(schema)',
  'tts.speak(pcm)',
  'kafka.trace(stage)',
  'qwen3.asr(cuda)',
  'livekit.room',
  'cerebrum.latency',
  'oauth.allow(scope)',
  'redshift.stage',
  'rag.retrieve(k)',
  'guard.readonly(sql)',
].join('  ·  ');

interface PixelFaceProps {
  viseme: Viseme;
  mode: VoiceMode;
}

export default function PixelFace({ viseme, mode }: PixelFaceProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visemeRef = useRef(viseme);
  const modeRef = useRef(mode);
  visemeRef.current = viseme;
  modeRef.current = mode;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const small = document.createElement('canvas');
    small.width = FACE_W;
    small.height = FACE_H;
    const smallCtx = small.getContext('2d');
    if (!smallCtx) return;

    const textLayer = document.createElement('canvas');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    const onMotion = () => {
      reduced = motionQuery.matches;
    };
    motionQuery.addEventListener('change', onMotion);
    const cache = new Map<string, FaceFrame>();
    let scale = 0;
    let frame = 0;
    let blink = 0;
    let blinkPhase: 'wait' | 'closing' | 'opening' = 'wait';
    let nextBlink = performance.now() + 1600;
    let last = performance.now();

    const frameFor = (keyViseme: Viseme, blinkAmount: number, listen: number, look: number) => {
      const blinkQ = blinkAmount > 0.66 ? 1 : blinkAmount > 0.28 ? 0.55 : 0;
      const lookQ = look > 0.35 ? 1 : look < -0.35 ? -1 : 0;
      const key = `${keyViseme}|${blinkQ}|${listen}|${lookQ}`;
      let cached = cache.get(key);
      if (!cached) {
        cached = renderFace({ viseme: keyViseme, blink: blinkQ, listen, look: lookQ });
        cache.set(key, cached);
      }
      return cached;
    };

    const probe = renderFace({ viseme: 'rest', blink: 0, listen: 0, look: 0 });
    let minX = FACE_W;
    let minY = FACE_H;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < FACE_H; y += 1) {
      for (let x = 0; x < FACE_W; x += 1) {
        if (probe.rgba[(y * FACE_W + x) * 4 + 3] > 28) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    minX = Math.max(0, minX - 1);
    minY = Math.max(0, minY - 1);
    maxX = Math.min(FACE_W - 1, maxX + 1);
    maxY = Math.min(FACE_H - 1, maxY + 1);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const paintTextLayer = (width: number, height: number) => {
      textLayer.width = width;
      textLayer.height = height * 2;
      const g = textLayer.getContext('2d');
      if (!g) return;
      g.clearRect(0, 0, textLayer.width, textLayer.height);
      const line = Math.max(8, scale);
      g.font = `${line - 1}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      g.fillStyle = 'rgba(214, 255, 244, 0.95)';
      const source = `${CODE}  ${CODE}`;
      for (let y = line; y < textLayer.height; y += line * 2) {
        const shift = (y * 7) % 48;
        g.fillText(source.slice(shift), -((y * 3) % 80), y);
      }
    };

    const fit = () => {
      const next = Math.max(
        4,
        Math.floor(Math.min((wrap.clientWidth - 32) / cropW, (wrap.clientHeight - 32) / cropH))
      );
      if (next === scale && canvas.width === cropW * next) return;
      scale = next;
      canvas.width = cropW * scale;
      canvas.height = cropH * scale;
      paintTextLayer(canvas.width, canvas.height);
    };

    const resize = new ResizeObserver(fit);
    resize.observe(wrap);
    fit();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      try {
      const dt = Math.min(48, now - last);
      last = now;
      fit();

      if (!reduced) {
        if (blinkPhase === 'wait' && now >= nextBlink) blinkPhase = 'closing';
        if (blinkPhase === 'closing') {
          blink = Math.min(1, blink + dt / 70);
          if (blink >= 1) blinkPhase = 'opening';
        } else if (blinkPhase === 'opening') {
          blink = Math.max(0, blink - dt / 110);
          if (blink <= 0) {
            blinkPhase = 'wait';
            nextBlink = now + 2600 + Math.random() * 2800;
          }
        }
      } else {
        blink = 0;
      }

      const listening = modeRef.current === 'listening';
      const look = reduced || listening || modeRef.current === 'speaking' ? 0 : Math.sin(now / 2200);
      const face = frameFor(visemeRef.current, blink, listening ? 1 : 0, look);
      const image = smallCtx.createImageData(FACE_W, FACE_H);
      image.data.set(face.rgba);
      smallCtx.putImageData(image, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(small, minX, minY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.16;
      const scroll = reduced ? 0 : (now / 70) % (textLayer.height / 2);
      ctx.drawImage(textLayer, 0, -scroll);
      ctx.restore();

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const index = y * FACE_W + x;
          if (face.allowText[index]) continue;
          const pixel = index * 4;
          if (face.rgba[pixel + 3] === 0) continue;
          ctx.fillStyle = `rgba(${face.rgba[pixel]}, ${face.rgba[pixel + 1]}, ${face.rgba[pixel + 2]}, ${face.rgba[pixel + 3] / 255})`;
          ctx.fillRect((x - minX) * scale, (y - minY) * scale, scale, scale);
        }
      }
      } catch (error) {
        cancelAnimationFrame(frame);
        console.error(error);
      }
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      motionQuery.removeEventListener('change', onMotion);
    };
  }, []);

  return (
    <div ref={wrapRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className="relative">
        <span className="pointer-events-none absolute -left-3 -top-3 h-4 w-4 border-l border-t border-rose-500/80" />
        <span className="pointer-events-none absolute -right-3 -top-3 h-4 w-4 border-r border-t border-rose-500/80" />
        <span className="pointer-events-none absolute -bottom-3 -left-3 h-4 w-4 border-b border-l border-rose-500/80" />
        <span className="pointer-events-none absolute -right-3 -bottom-3 h-4 w-4 border-b border-r border-rose-500/80" />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Low resolution digital portrait. The mouth moves with the speech."
          className="block"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 28px rgba(64, 196, 176, 0.28))',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.28) 3px, transparent 4px)',
            mixBlendMode: 'multiply',
            maskImage: 'radial-gradient(ellipse at 50% 42%, #000 58%, transparent 82%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 42%, #000 58%, transparent 82%)',
          }}
        />
      </div>
    </div>
  );
}
