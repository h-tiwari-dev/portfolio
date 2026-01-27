'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import OrbitingSkills from './OrbitingSkills';
import BlackHoleCore from './BlackHoleCore';
import StarField from './StarField';
import SceneEffects from './SceneEffects';

interface GlobeSceneProps {
  isMobile?: boolean;
  activeSection?: string;
}

export default function GlobeScene({
  isMobile = false,
  activeSection = 'hero',
}: GlobeSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const showSkills = activeSection === 'skills';

  // Auto-rotate the scene slowly if needed, or let OrbitControls handle it
  // The snippet has stars rotating separately.
  // We'll let OrbitControls handle user interaction.

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />

      {/* Controls to rotate view */}
      <OrbitControls
        enableDamping
        dampingFactor={0.035}
        rotateSpeed={0.4}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minDistance={3}
        maxDistance={20}
        enablePan={false}
        target={[0, 0, 0]}
      />

      <group ref={sceneRef} position={[0, 0, 0]}>
        {/* The Black Hole Core (Disk, Event Horizon) */}
        <BlackHoleCore />

        {/* Background Stars */}
        <StarField />

        {/* 
          Orbiting Skills 
          - Inside the scene so they exist in the same space
          - Note: If OrbitControls rotates camera, these stay fixed in world space relative to black hole.
          - If we want them to orbit the black hole, the OrbitingSkills component handles that animation.
        */}
        <OrbitingSkills visible={showSkills} />
      </group>

      {/* Post-Processing Effects (Bloom + Lensing) */}
      <SceneEffects />
    </>
  );
}
