'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import GlobeScene from './GlobeScene';
import { useSection } from '@/contexts/SectionContext';

export default function ThreeBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const { activeSection } = useSection();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-auto">
      <Canvas
        eventSource={containerRef as React.MutableRefObject<HTMLElement>}
        className="touch-action-none" // Prevent browser gestures
        camera={{ position: [-16.0, 10.0, 16.0], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 3, // ACESFilmic
          toneMappingExposure: 1.2,
          outputColorSpace: 'srgb',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <GlobeScene isMobile={isMobile} activeSection={activeSection} />
        </Suspense>
        <fogExp2 attach="fog" args={['#020104', 0.025]} />
      </Canvas>
    </div>
  );
}
