'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import OrbitingSkills from './OrbitingSkills';
import BlackHoleCore, { SkillPosition } from './BlackHoleCore';
import StarField from './StarField';
import SceneEffects from './SceneEffects';
import AccretionParticles from './AccretionParticles';

interface GlobeSceneProps {
  isMobile?: boolean;
  activeSection?: string;
}

export default function GlobeScene({
  isMobile = false,
  activeSection = 'hero',
}: GlobeSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const skillPositionsRef = useRef<SkillPosition[]>([]);
  const showSkills = activeSection === 'skills';

  // Auto-rotate the scene slowly if needed, or let OrbitControls handle it
  // The snippet has stars rotating separately.
  // We'll let OrbitControls handle user interaction.

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />

      {/* Controls to rotate view */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.035}
        rotateSpeed={0.4}
        autoRotate={true}
        autoRotateSpeed={0.5}
        enableZoom={false} // Disable zoom to avoid conflict with page scroll
        minDistance={3}
        maxDistance={20}
        enablePan={false}
        target={[0, 0, 0]}
      />

      <group ref={sceneRef} position={[0, 0, 0]}>
        {/* The Black Hole Core (Disk, Event Horizon) */}
        <BlackHoleCore skillPositionsRef={showSkills ? skillPositionsRef : undefined} />

        {/* Swirling Accretion Matter */}
        <AccretionParticles />

        {/* Background Stars */}
        <StarField />

        {/*
          Orbiting Skills
          - Inside the scene so they exist in the same space
          - Note: If OrbitControls rotates camera, these stay fixed in world space relative to black hole.
          - If we want them to orbit the black hole, the OrbitingSkills component handles that animation.
          - Skills report their positions to destabilize the accretion disk
        */}
        <OrbitingSkills visible={showSkills} skillPositionsRef={skillPositionsRef} />
      </group>

      {/* Post-Processing Effects (Bloom + Lensing) */}
      <SceneEffects />
    </>
  );
}
