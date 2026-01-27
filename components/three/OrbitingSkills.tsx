'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitingSkillsProps {
  visible: boolean;
}

const allSkills = [
  // Languages - Magenta orbit
  { name: 'Python', category: 0 },
  { name: 'TypeScript', category: 0 },
  { name: 'GoLang', category: 0 },
  { name: 'Rust', category: 0 },
  { name: 'Java', category: 0 },
  // Frontend - Yellow orbit
  { name: 'React', category: 1 },
  { name: 'Next.js', category: 1 },
  { name: 'Vue', category: 1 },
  { name: 'Tailwind', category: 1 },
  // Backend - Orange orbit
  { name: 'Node.js', category: 2 },
  { name: 'Docker', category: 2 },
  { name: 'Kubernetes', category: 2 },
  { name: 'Kafka', category: 2 },
  // Data/ML - Pink orbit
  { name: 'PostgreSQL', category: 3 },
  { name: 'MongoDB', category: 3 },
  { name: 'PyTorch', category: 3 },
  { name: 'Redis', category: 3 },
];

const categoryColors = [
  '#ff3366', // Magenta - Languages
  '#ffcc00', // Yellow - Frontend
  '#ff5500', // Orange - Backend
  '#ff6699', // Pink - Data/ML
];

const categoryRadii = [2.8, 3.2, 3.6, 4.0];
const categoryTilts = [0.2, -0.15, 0.1, -0.25];
const categorySpeeds = [0.15, 0.12, 0.1, 0.08];

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

    // Fade out when close to camera (z > 2.0) to prevent blocking view
    // Camera is at z=5. Max radius is 4.
    const distToCamera = 5 - z;
    const fadeThreshold = 3.0; // Start fading when closer than this (z > 2.0)
    const minDistance = 1.5; // Fully transparent when this close (z > 3.5)

    let distanceOpacity = 1;
    if (distToCamera < fadeThreshold) {
      distanceOpacity = Math.max(
        0,
        (distToCamera - minDistance) / (fadeThreshold - minDistance)
      );
    }

    // Apply visibility prop (section active or not)
    const finalOpacity = visible ? distanceOpacity : 0;

    // Pulsing glow effect
    const pulse = 0.8 + Math.sin(time * 2 + index) * 0.2;
    nodeRef.current.scale.setScalar(pulse);

    // Update materials manually for performance
    const nodeMat = nodeRef.current.material as THREE.MeshBasicMaterial;
    if (nodeMat) {
      nodeMat.opacity = finalOpacity * 0.9;
    }

    const glowMat = glowRef.current?.material as THREE.MeshBasicMaterial;
    if (glowMat) {
      glowMat.opacity = finalOpacity * 0.3;
    }

    // Update Text opacity
    if (textRef.current) {
      textRef.current.fillOpacity = finalOpacity;
      textRef.current.outlineOpacity = finalOpacity * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glowing node sphere */}
      <mesh ref={nodeRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0} // Controlled in useFrame
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0} // Controlled in useFrame
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Text label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={textRef}
          position={[0, 0.2, 0]}
          fontSize={0.1}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0} // Controlled in useFrame
          outlineWidth={0.01}
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
      opacity={visible ? 0.2 : 0}
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
    <group ref={groupRef}>
      {/* Orbit rings */}
      {categoryRadii.map((radius, i) => (
        <OrbitRing
          key={i}
          radius={radius}
          color={categoryColors[i]}
          tilt={categoryTilts[i]}
          visible={visible}
        />
      ))}

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
