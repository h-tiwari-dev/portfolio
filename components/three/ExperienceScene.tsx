'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExperienceSceneProps {
  activeIndex: number;
  progress: number;
}

const colors = {
  0: { primary: '#ff3366', secondary: '#ff6699' }, // hot magenta
  1: { primary: '#ffcc00', secondary: '#ffdd44' }, // electric gold
  2: { primary: '#ff5500', secondary: '#ff7733' }, // vivid orange
};

function FloatingShape({
  position,
  color,
  speed,
  rotationSpeed,
  scale = 1,
  shape = 'octahedron',
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  rotationSpeed: number;
  scale?: number;
  shape?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y =
      initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    meshRef.current.rotation.x += rotationSpeed * 0.01;
    meshRef.current.rotation.y += rotationSpeed * 0.015;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(0.5 * scale, 0);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(0.5 * scale, 0);
      case 'tetrahedron':
        return new THREE.TetrahedronGeometry(0.5 * scale, 0);
      case 'torus':
        return new THREE.TorusGeometry(0.4 * scale, 0.15 * scale, 16, 32);
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(0.35 * scale, 0.1 * scale, 64, 8);
      default:
        return new THREE.OctahedronGeometry(0.5 * scale, 0);
    }
  }, [shape, scale]);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={0.6}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function ParticleField({
  color,
  count = 50,
}: {
  color: string;
  count?: number;
}) {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!particlesRef.current) return;
    const positionAttr = particlesRef.current.geometry.attributes
      .position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      positionAttr.setX(i, positionAttr.getX(i) + velocities[i * 3]);
      positionAttr.setY(i, positionAttr.getY(i) + velocities[i * 3 + 1]);
      positionAttr.setZ(i, positionAttr.getZ(i) + velocities[i * 3 + 2]);

      // Wrap around
      if (Math.abs(positionAttr.getX(i)) > 4) velocities[i * 3] *= -1;
      if (Math.abs(positionAttr.getY(i)) > 3) velocities[i * 3 + 1] *= -1;
      if (Math.abs(positionAttr.getZ(i)) > 2) velocities[i * 3 + 2] *= -1;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function ConnectionLines({
  color,
  activeIndex,
}: {
  color: string;
  activeIndex: number;
}) {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  const lines = useMemo(() => {
    const result = [];
    const lineCount = 8 + activeIndex * 4;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 1;
      const height = (Math.random() - 0.5) * 3;

      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
      ];

      result.push(points);
    }

    return result;
  }, [activeIndex]);

  return (
    <group ref={linesRef}>
      {lines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}

export default function ExperienceScene({
  activeIndex,
  progress,
}: ExperienceSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentColors = colors[activeIndex as keyof typeof colors] || colors[0];

  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle rotation based on time
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    // React to progress
    groupRef.current.position.x = (progress - 0.5) * 0.5;
  });

  const shapes = useMemo(() => {
    const shapeTypes = [
      ['octahedron', 'icosahedron', 'torusKnot'],
      ['dodecahedron', 'torus', 'tetrahedron'],
      ['icosahedron', 'torusKnot', 'octahedron'],
    ];
    return shapeTypes[activeIndex] || shapeTypes[0];
  }, [activeIndex]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[5, 5, 5]}
        intensity={0.5}
        color={currentColors.primary}
      />
      <pointLight
        position={[-5, -5, -5]}
        intensity={0.3}
        color={currentColors.secondary}
      />

      {/* Central shape */}
      <FloatingShape
        position={[0, 0, 0]}
        color={currentColors.primary}
        speed={0.8}
        rotationSpeed={1}
        scale={1.5}
        shape={shapes[0]}
      />

      {/* Orbiting shapes */}
      <FloatingShape
        position={[-2, 1, -1]}
        color={currentColors.secondary}
        speed={1.2}
        rotationSpeed={1.5}
        scale={0.7}
        shape={shapes[1]}
      />
      <FloatingShape
        position={[2, -0.5, 1]}
        color={currentColors.primary}
        speed={1}
        rotationSpeed={0.8}
        scale={0.6}
        shape={shapes[2]}
      />
      <FloatingShape
        position={[1.5, 1.5, -1.5]}
        color={currentColors.secondary}
        speed={0.9}
        rotationSpeed={1.2}
        scale={0.5}
        shape={shapes[0]}
      />

      {/* Particle field */}
      <ParticleField color={currentColors.primary} count={60} />

      {/* Connection lines */}
      <ConnectionLines
        color={currentColors.secondary}
        activeIndex={activeIndex}
      />
    </group>
  );
}
