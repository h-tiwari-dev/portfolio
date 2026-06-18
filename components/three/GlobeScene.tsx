'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, OrbitControls } from '@react-three/drei';
import OrbitingSkills from './OrbitingSkills';
import BlackHoleCore, { SkillPosition } from './BlackHoleCore';
import StarField from './StarField';
import SceneEffects from './SceneEffects';
import AccretionParticles from './AccretionParticles';

interface GlobeSceneProps {
  isMobile?: boolean;
  activeSection?: string;
  activeSkillCategory?: number | null;
}

const sectionOrder = ['hero', 'experience', 'skills', 'connect'];
const sectionColors = ['#ff3366', '#ffcc00', '#00f0ff', '#9d00ff'];

const sectionViews = {
  hero: {
    camera: new THREE.Vector3(-16, 10, 16),
    target: new THREE.Vector3(0, 0, 0),
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
  },
  experience: {
    camera: new THREE.Vector3(-10.5, 6.2, 13.2),
    target: new THREE.Vector3(-0.9, 0.35, 0),
    position: new THREE.Vector3(-0.7, 0.12, 0.1),
    rotation: new THREE.Euler(0.05, 0.3, -0.03),
  },
  skills: {
    camera: new THREE.Vector3(-15.5, 9.4, 17.2),
    target: new THREE.Vector3(0, 0, 0),
    position: new THREE.Vector3(0, -0.25, 0),
    rotation: new THREE.Euler(0.02, 0.08, 0),
  },
  connect: {
    camera: new THREE.Vector3(-7.2, 4.8, 10.2),
    target: new THREE.Vector3(0.7, -0.1, 0),
    position: new THREE.Vector3(0.45, -0.15, -0.2),
    rotation: new THREE.Euler(-0.03, -0.22, 0.02),
  },
};

const tetherPoints = [
  new THREE.Vector3(-6.6, 3.7, 6.3),
  new THREE.Vector3(5.8, 2.4, 5.1),
  new THREE.Vector3(7.0, -1.2, -5.2),
  new THREE.Vector3(-5.8, -2.5, -6.4),
];

const TetherShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      float thread = sin(vUv.x * 6.28318 * 42.0 - uTime * 2.2) * 0.5 + 0.5;
      float flow = smoothstep(0.0, uProgress, vUv.x);
      float head = 1.0 - smoothstep(0.0, 0.09, abs(vUv.x - uProgress));
      float pulse = sin(uTime * 1.6 + vUv.x * 9.0) * 0.12 + 0.88;

      vec3 rose = vec3(1.0, 0.2, 0.4);
      vec3 gold = vec3(1.0, 0.8, 0.1);
      vec3 cyan = vec3(0.0, 0.95, 1.0);
      vec3 violet = vec3(0.62, 0.0, 1.0);
      vec3 color = mix(rose, gold, smoothstep(0.15, 0.35, vUv.x));
      color = mix(color, cyan, smoothstep(0.42, 0.7, vUv.x));
      color = mix(color, violet, smoothstep(0.72, 1.0, vUv.x));

      float alpha = (0.05 + thread * 0.13 + head * 0.42) * pulse;
      alpha += flow * 0.08;
      gl_FragColor = vec4(color * (0.8 + thread * 0.9 + head * 1.6), alpha);
    }
  `,
};

function TetherMarker({
  position,
  color,
  active,
}: {
  position: THREE.Vector3;
  color: string;
  active: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(new THREE.Vector3());
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pulse = active
      ? 1.0 + Math.sin(state.clock.elapsedTime * 3.2) * 0.1
      : 0.72;
    scaleRef.current.set(pulse, pulse, pulse);
    groupRef.current.scale.lerp(scaleRef.current, active ? 0.12 : 0.06);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[active ? 0.22 : 0.13, 28, 18]} />
        <meshBasicMaterial
          color={colorObj}
          transparent
          opacity={active ? 0.95 : 0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Billboard follow>
        <mesh>
          <ringGeometry args={[0.36, 0.39, 96]} />
          <meshBasicMaterial
            color={colorObj}
            transparent
            opacity={active ? 0.5 : 0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

function SceneTether({
  activeSection,
  isMobile,
}: {
  activeSection: string;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const activeIndex = Math.max(sectionOrder.indexOf(activeSection), 0);
  const progress = (activeIndex + 1) / sectionOrder.length;

  const curve = useMemo(() => {
    const guidePoints = [
      tetherPoints[0],
      new THREE.Vector3(-1.4, 4.8, 7.3),
      tetherPoints[1],
      new THREE.Vector3(7.8, 0.3, 0.4),
      tetherPoints[2],
      new THREE.Vector3(0.4, -3.5, -7.5),
      tetherPoints[3],
      new THREE.Vector3(-7.8, 0.4, -0.4),
    ];
    return new THREE.CatmullRomCurve3(guidePoints, true, 'catmullrom', 0.72);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: progress },
    }),
    [progress]
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.08) * 0.12;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.04;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.06
      );
    }
  });

  return (
    <group ref={groupRef} visible={!isMobile}>
      <mesh renderOrder={1}>
        <tubeGeometry args={[curve, 360, 0.028, 8, true]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={TetherShader.vertexShader}
          fragmentShader={TetherShader.fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {tetherPoints.map((point, index) => (
        <TetherMarker
          key={sectionOrder[index]}
          position={point}
          color={sectionColors[index]}
          active={index === activeIndex}
        />
      ))}
    </group>
  );
}

export default function GlobeScene({
  isMobile = false,
  activeSection = 'hero',
  activeSkillCategory = null,
}: GlobeSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const skillPositionsRef = useRef<SkillPosition[]>([]);
  const showSkills = activeSection === 'skills';

  useFrame((state) => {
    const view =
      sectionViews[activeSection as keyof typeof sectionViews] ??
      sectionViews.hero;

    if (sceneRef.current) {
      sceneRef.current.position.lerp(view.position, 0.04);
      sceneRef.current.rotation.x = THREE.MathUtils.lerp(
        sceneRef.current.rotation.x,
        view.rotation.x,
        0.035
      );
      sceneRef.current.rotation.y = THREE.MathUtils.lerp(
        sceneRef.current.rotation.y,
        view.rotation.y,
        0.035
      );
      sceneRef.current.rotation.z = THREE.MathUtils.lerp(
        sceneRef.current.rotation.z,
        view.rotation.z,
        0.035
      );
    }

    if (!showSkills && controlsRef.current) {
      state.camera.position.lerp(view.camera, 0.032);
      controlsRef.current.target.lerp(view.target, 0.045);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />

      {/* Controls to rotate view */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.035}
        rotateSpeed={0.4}
        autoRotate={activeSection === 'hero'}
        autoRotateSpeed={0.5}
        enableZoom={false} // Disable zoom to avoid conflict with page scroll
        minDistance={3}
        maxDistance={20}
        enablePan={false}
        target={[0, 0, 0]}
      />

      <group ref={sceneRef} position={[0, 0, 0]}>
        <SceneTether activeSection={activeSection} isMobile={isMobile} />

        {/* The Black Hole Core (Disk, Event Horizon) */}
        <BlackHoleCore
          skillPositionsRef={showSkills ? skillPositionsRef : undefined}
        />

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
        <OrbitingSkills
          visible={showSkills}
          skillPositionsRef={skillPositionsRef}
          activeCategory={activeSkillCategory}
          controlsRef={controlsRef}
          isMobile={isMobile}
        />
      </group>

      {/* Post-Processing Effects (Bloom + Lensing) */}
      <SceneEffects />
    </>
  );
}
