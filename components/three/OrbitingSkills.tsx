'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Line, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitingSkillsProps {
  visible: boolean;
}

const allSkills = [
  // Languages - Cyan
  { name: 'Python', category: 0 },
  { name: 'TypeScript', category: 0 },
  { name: 'GoLang', category: 0 },
  { name: 'Rust', category: 0 },
  { name: 'Java', category: 0 },
  // Frontend - White
  { name: 'React', category: 1 },
  { name: 'Next.js', category: 1 },
  { name: 'Vue', category: 1 },
  { name: 'Tailwind', category: 1 },
  // Backend - Red-Orange
  { name: 'Node.js', category: 2 },
  { name: 'Docker', category: 2 },
  { name: 'Kubernetes', category: 2 },
  { name: 'Kafka', category: 2 },
  // Data/ML - Electric Purple
  { name: 'PostgreSQL', category: 3 },
  { name: 'MongoDB', category: 3 },
  { name: 'PyTorch', category: 3 },
  { name: 'Redis', category: 3 },
];

const categoryColors = [
  '#00f0ff', // Cyan - Languages
  '#ffffff', // White - Frontend
  '#ff3300', // Red-Orange - Backend
  '#9d00ff', // Electric Purple - Data/ML
];

// Align orbits to the new Black Hole Disk tilt (Math.PI / 3.0)
const categoryRadii = [11.0, 13.0, 15.0, 17.0]; // Pushed out to fit larger disk (radius 14)
const categoryTilts = [0, 0, 0, 0]; // Flatten orbits perfectly to avoid messy intersections
const categorySpeeds = [0.15, 0.12, 0.1, 0.08]; // Slightly slower for scale

interface SkillNodeProps {
  skill: { name: string; category: number };
  index: number;
  totalInCategory: number;
  visible: boolean;
}

function SkillNode({ skill, index, totalInCategory, visible }: SkillNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null); // Ref for the Text component
  const initialAngle = useMemo(
    () => (index / totalInCategory) * Math.PI * 2,
    [index, totalInCategory]
  );

  const radius = categoryRadii[skill.category];
  const tilt = categoryTilts[skill.category];
  const speed = categorySpeeds[skill.category];
  const color = categoryColors[skill.category];

  useFrame((state) => {
    if (!groupRef.current || !nodeRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * speed;

    // Calculate orbital position
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle) * tilt * radius * 0.3;

    groupRef.current.position.set(x, y, z);

    // Visibility purely based on section
    const finalOpacity = visible ? 1 : 0;

    // Pulsing glow effect
    const pulse = 0.8 + Math.sin(time * 3 + index) * 0.2; // Faster pulse
    nodeRef.current.scale.setScalar(pulse);

    // Update materials manually for performance
    const nodeMat = nodeRef.current.material as THREE.MeshBasicMaterial;
    if (nodeMat) {
      nodeMat.opacity = finalOpacity;
    }

    const glowMat = glowRef.current?.material as THREE.MeshBasicMaterial;
    if (glowMat) {
      glowMat.opacity = finalOpacity * 0.4;
    }

    // Update Text opacity
    if (textRef.current) {
      textRef.current.fillOpacity = finalOpacity;
      textRef.current.outlineOpacity = finalOpacity * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Trail */}
      <Trail
        width={1.5} // Wider trail
        length={12} // Longer trail
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
        <mesh ref={nodeRef}>
          <sphereGeometry args={[0.15, 16, 16]} /> {/* Larger core */}
          <meshBasicMaterial
            color="#ffffff" // White core for hot look
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Trail>

      {/* Outer Glow Halo (attached to group, moves with it) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 32, 32]} /> {/* Large soft glow */}
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Particle Dust / Sparkles */}
      <Sparkles
        count={12}
        scale={0.8}
        size={2}
        speed={0.4}
        opacity={visible ? 0.6 : 0}
        color={color}
        noise={0.2}
      />

      {/* Text label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={textRef}
          position={[0, 0.25, 0]}
          fontSize={0.18}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0} // Controlled in useFrame
          outlineWidth={0.02}
          outlineColor="#000000"
          outlineOpacity={0} // Controlled in useFrame
        >
          {skill.name}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitRing({
  radius,
  color,
  tilt,
  visible,
}: {
  radius: number;
  color: string;
  tilt: number;
  visible: boolean;
}) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle) * tilt * radius * 0.3;
      pts.push([x, y, z]);
    }
    return pts;
  }, [radius, tilt]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={visible ? 0.08 : 0}
    />
  );
}

export default function OrbitingSkills({ visible }: OrbitingSkillsProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Count skills per category
  const skillsByCategory = useMemo(() => {
    const counts: { [key: number]: number } = {};
    allSkills.forEach((skill) => {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Track index within each category
  const categoryIndices: { [key: number]: number } = {};

  return (
    // Rotate to match the Black Hole Accretion Disk tilt
    // Disk is tilted at Math.PI/3
    <group ref={groupRef} rotation={[Math.PI / 3.0, 0, 0]}>
      {/* Orbit rings - Removed as requested */}
      {/* 
      {categoryRadii.map((radius, i) => (
        <OrbitRing
          key={i}
          radius={radius}
          color={categoryColors[i]}
          tilt={categoryTilts[i]}
          visible={visible}
        />
      ))} 
      */}

      {/* Skill nodes */}
      {allSkills.map((skill, globalIndex) => {
        const indexInCategory = categoryIndices[skill.category] || 0;
        categoryIndices[skill.category] = indexInCategory + 1;

        return (
          <SkillNode
            key={globalIndex}
            skill={skill}
            index={indexInCategory}
            totalInCategory={skillsByCategory[skill.category]}
            visible={visible}
          />
        );
      })}
    </group>
  );
}
