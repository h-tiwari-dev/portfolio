'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GlobeScene from './GlobeScene';
import { useSection } from '@/contexts/SectionContext';

export default function ThreeBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const { activeSection } = useSection();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <GlobeScene isMobile={isMobile} activeSection={activeSection} />
        </Suspense>
        <fog attach="fog" args={['#0c0b0a', 4, 12]} />
      </Canvas>
    </div>
  );
}
