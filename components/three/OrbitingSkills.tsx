'use client';

import { useEffect, useMemo, useRef, useState, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SkillPosition } from './BlackHoleCore';

interface OrbitingSkillsProps {
  visible: boolean;
  skillPositionsRef?: MutableRefObject<SkillPosition[]>;
  activeCategory?: number | null;
  controlsRef?: MutableRefObject<any>;
  isMobile?: boolean;
}

interface Skill {
  name: string;
  category: number;
  kind: 'planet' | 'star' | 'ringed' | 'ice';
}

const allSkills: Skill[] = [
  { name: 'Python', category: 0, kind: 'planet' },
  { name: 'TypeScript', category: 0, kind: 'star' },
  { name: 'Go', category: 0, kind: 'ice' },
  { name: 'SQL', category: 0, kind: 'ringed' },
  { name: 'Node.js', category: 1, kind: 'planet' },
  { name: 'NestJS', category: 1, kind: 'ice' },
  { name: 'GraphQL', category: 1, kind: 'ringed' },
  { name: 'WebSockets', category: 1, kind: 'star' },
  { name: 'OAuth 2.0', category: 1, kind: 'planet' },
  { name: 'Microservices', category: 1, kind: 'ice' },
  { name: 'Event Driven', category: 1, kind: 'ringed' },
  { name: 'Distributed', category: 1, kind: 'star' },
  { name: 'PostgreSQL', category: 2, kind: 'ringed' },
  { name: 'MySQL', category: 2, kind: 'planet' },
  { name: 'MongoDB', category: 2, kind: 'planet' },
  { name: 'Redis', category: 2, kind: 'ice' },
  { name: 'Kafka', category: 2, kind: 'star' },
  { name: 'Redshift', category: 2, kind: 'ringed' },
  { name: 'AWS', category: 2, kind: 'ice' },
  { name: 'Kubernetes', category: 2, kind: 'ringed' },
  { name: 'Gemini', category: 3, kind: 'star' },
  { name: 'RAG', category: 3, kind: 'planet' },
  { name: 'Function Calling', category: 3, kind: 'ringed' },
  { name: 'Tool Execution', category: 3, kind: 'ice' },
  { name: 'Qwen3 ASR/TTS', category: 3, kind: 'star' },
  { name: 'LiveKit', category: 3, kind: 'planet' },
  { name: 'CUDA', category: 3, kind: 'ice' },
  { name: 'AI Evaluation', category: 3, kind: 'ringed' },
];

const categoryColors = ['#00f0ff', '#f8fafc', '#ff3b18', '#9d00ff'];
const categorySecondaryColors = ['#48ffbf', '#7dd3fc', '#ffb000', '#ff4fd8'];
const categoryRadii = [9.8, 11.8, 13.8, 15.8];
const categoryTilts = [0.08, -0.06, 0.1, -0.08];
const categorySpeeds = [0.18, 0.145, 0.12, 0.096];
const LOCAL_TAIL_AXIS = new THREE.Vector3(-1, 0, 0);
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(-16, 10, 16);

const OrbitRailShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uIndex;
    varying vec2 vUv;

    void main() {
      float dash = sin(vUv.x * 6.28318 * 34.0 - uTime * (0.9 + uIndex * 0.16)) * 0.5 + 0.5;
      float bead = pow(dash, 10.0);
      float tube = 1.0 - smoothstep(0.18, 0.5, abs(vUv.y - 0.5));
      vec3 color = mix(uColor * 0.35, vec3(1.0), bead * 0.25);
      float alpha = tube * (0.025 + bead * 0.16) * uOpacity;
      gl_FragColor = vec4(color * (0.65 + bead), alpha);
    }
  `,
};

const PlanetShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uSeed;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

      float ridge = sin(position.y * 11.0 + uTime * 0.4 + uSeed * 12.0) * 0.018;
      ridge += sin(position.x * 17.0 + position.z * 9.0 + uSeed * 21.0) * 0.012;
      vec3 displaced = position + normal * ridge;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uSeed;
    uniform float uKind;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 lightDir = normalize(vec3(-0.45, 0.72, 0.5));

      float bands = sin((vUv.y + uSeed * 0.17) * 34.0 + sin(vUv.x * 6.28318 + uTime * 0.12) * 1.6) * 0.5 + 0.5;
      float storms = hash(floor((vUv + vec2(uSeed, uTime * 0.006)) * vec2(18.0, 9.0)));
      float crater = smoothstep(0.7, 1.0, storms) * 0.22;
      float starPulse = sin(uTime * 3.0 + uSeed * 18.0) * 0.14 + 0.86;

      vec3 planetColor = mix(uColorA * 0.42, uColorB, bands);
      planetColor += uColorA * crater;

      float diffuse = max(dot(normal, lightDir), 0.0) * 0.7 + 0.22;
      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.4);
      float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 28.0);

      float starCore = smoothstep(0.25, 0.95, rim) + pow(bands, 8.0) * 0.35;
      vec3 color = planetColor * diffuse;
      color += uColorB * rim * 0.72;
      color += vec3(1.0) * spec * 0.35;
      color = mix(color, uColorB * (1.4 + starCore), step(0.5, uKind) * 0.42 * starPulse);

      gl_FragColor = vec4(color, uOpacity);
    }
  `,
};

const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uSeed;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float rim = 1.0 - abs(dot(normalize(vNormal), viewDir));
      float pulse = sin(uTime * 2.0 + uSeed * 9.0) * 0.12 + 0.88;
      float alpha = (pow(rim, 2.2) * 0.55 + pow(rim, 8.0) * 0.42) * pulse * uOpacity;
      gl_FragColor = vec4(uColor * (0.9 + rim), alpha);
    }
  `,
};

const RingShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uSeed;
    varying vec2 vUv;

    void main() {
      float stripe = sin(vUv.x * 6.28318 * 28.0 + uTime * 0.7 + uSeed) * 0.5 + 0.5;
      float alpha = (0.18 + pow(stripe, 7.0) * 0.42) * uOpacity;
      gl_FragColor = vec4(uColor * (0.75 + stripe * 0.8), alpha);
    }
  `,
};

interface OrbitRailProps {
  radius: number;
  color: string;
  index: number;
  visible: boolean;
}

function OrbitRail({ radius, color, index, visible }: OrbitRailProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const uniforms = useMemo(
    () => ({
      uColor: { value: colorObj },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uIndex: { value: index },
    }),
    [colorObj, index]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    const material = materialRef.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.uniforms.uOpacity.value,
      visible ? 1 : 0,
      0.08
    );
  });

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={0}>
      <torusGeometry args={[radius, 0.012, 8, 360]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={OrbitRailShader.vertexShader}
        fragmentShader={OrbitRailShader.fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface ConstellationLinesProps {
  active: boolean;
  color: string;
  indices: number[];
  positionsRef: MutableRefObject<THREE.Vector3[]>;
  visible: boolean;
}

function ConstellationLines({
  active,
  color,
  indices,
  positionsRef,
  visible,
}: ConstellationLinesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const segmentCount = Math.max(indices.length - 1, 0);
  const geometry = useMemo(() => {
    const positions = new Float32Array(segmentCount * 2 * 3);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    return bufferGeometry;
  }, [segmentCount]);

  useFrame(() => {
    if (!lineRef.current || segmentCount === 0) return;

    const attribute = geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;

    for (let i = 0; i < segmentCount; i++) {
      const from = positionsRef.current[indices[i]];
      const to = positionsRef.current[indices[i + 1]];
      const offset = i * 6;

      if (from && to) {
        array[offset] = from.x;
        array[offset + 1] = from.y;
        array[offset + 2] = from.z;
        array[offset + 3] = to.x;
        array[offset + 4] = to.y;
        array[offset + 5] = to.z;
      }
    }

    attribute.needsUpdate = true;
    const material = lineRef.current.material as THREE.LineBasicMaterial;
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      visible && active ? 0.58 : 0,
      0.08
    );
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} renderOrder={2}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

interface SkillNodeProps {
  skill: Skill;
  index: number;
  totalInCategory: number;
  visible: boolean;
  globalIndex: number;
  activeCategory: number | null;
  hoveredSkill: number | null;
  focusedSkill: number | null;
  visualPositionsRef: MutableRefObject<THREE.Vector3[]>;
  onHover: (index: number | null) => void;
  onFocus: (index: number | null) => void;
  onPositionUpdate?: (index: number, position: SkillPosition) => void;
}

function SkillNode({
  skill,
  index,
  totalInCategory,
  visible,
  globalIndex,
  activeCategory,
  hoveredSkill,
  focusedSkill,
  visualPositionsRef,
  onHover,
  onFocus,
  onPositionUpdate,
}: SkillNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Points>(null);
  const textRef = useRef<any>(null);
  const scaleTargetRef = useRef(new THREE.Vector3(1, 1, 1));
  const tangentRef = useRef(new THREE.Vector3());
  const radialOutRef = useRef(new THREE.Vector3());
  const tailDirectionRef = useRef(new THREE.Vector3());
  const worldPositionRef = useRef(new THREE.Vector3());
  const projectedPositionRef = useRef(new THREE.Vector3());
  const labelScaleRef = useRef(new THREE.Vector3(1, 1, 1));

  const initialAngle = useMemo(
    () => (index / totalInCategory) * Math.PI * 2 + skill.category * 0.36,
    [index, totalInCategory, skill.category]
  );

  const radius = categoryRadii[skill.category];
  const tilt = categoryTilts[skill.category];
  const speed = categorySpeeds[skill.category];
  const colorA = categoryColors[skill.category];
  const colorB = categorySecondaryColors[skill.category];
  const colorObj = useMemo(() => new THREE.Color(colorA), [colorA]);
  const colorObjB = useMemo(() => new THREE.Color(colorB), [colorB]);
  const seed = useMemo(
    () => globalIndex * 0.157 + skill.category * 0.41,
    [globalIndex, skill.category]
  );
  const scale = useMemo(() => 0.24 + (globalIndex % 4) * 0.035, [globalIndex]);
  const isStar = skill.kind === 'star';
  const hasRing = skill.kind === 'ringed';
  const isHovered = hoveredSkill === globalIndex;
  const isFocused = focusedSkill === globalIndex;
  const categoryIsActive =
    activeCategory === null || activeCategory === skill.category;
  const isEmphasized = isHovered || isFocused || categoryIsActive;

  const bodyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PlanetShader.vertexShader,
      fragmentShader: PlanetShader.fragmentShader,
      uniforms: {
        uColorA: { value: colorObj },
        uColorB: { value: colorObjB },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uSeed: { value: seed },
        uKind: { value: isStar ? 1 : 0 },
      },
      transparent: true,
      depthWrite: true,
    });
  }, [colorObj, colorObjB, seed, isStar]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: {
        uColor: { value: colorObj },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: seed },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
  }, [colorObj, seed]);

  const ringMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: RingShader.vertexShader,
      fragmentShader: RingShader.fragmentShader,
      uniforms: {
        uColor: { value: colorObjB },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: seed },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [colorObjB, seed]);

  const tailGeometry = useMemo(() => {
    const particleCount = isStar ? 84 : 56;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const spread = t * (isStar ? 0.55 : 0.38);
      positions[i * 3] = -t * (isStar ? 3.2 : 2.45);
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      sizes[i] = (1.0 - t) * (isStar ? 0.14 : 0.1) + 0.016;
      alphas[i] =
        Math.pow(1.0 - t, isStar ? 1.45 : 1.9) * (isStar ? 0.75 : 0.52);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return geometry;
  }, [isStar]);

  const tailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (290.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      uniforms: {
        uColor: { value: colorObj },
        uOpacity: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [colorObj]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * speed;
    const precession = Math.sin(time * 0.08 + globalIndex * 0.83) * 0.055;
    const orbitalAngle = angle + precession;
    const currentRadius = radius + Math.sin(time * 0.21 + globalIndex) * 0.18;

    const x = Math.cos(orbitalAngle) * currentRadius;
    const z = Math.sin(orbitalAngle) * currentRadius;
    const y =
      Math.sin(orbitalAngle * 1.6 + globalIndex * 0.4) * 0.18 +
      tilt * currentRadius;

    groupRef.current.position.set(x, y, z);
    visualPositionsRef.current[globalIndex].set(x, y, z);

    const targetScale = isFocused ? 1.55 : isHovered ? 1.28 : 1;
    scaleTargetRef.current.set(targetScale, targetScale, targetScale);
    groupRef.current.scale.lerp(scaleTargetRef.current, 0.08);

    const tangent = tangentRef.current
      .set(-Math.sin(orbitalAngle), 0, Math.cos(orbitalAngle))
      .normalize();
    const radialOut = radialOutRef.current.set(x, y, z).normalize();
    const tailDir = tailDirectionRef.current
      .copy(tangent)
      .multiplyScalar(-0.86)
      .add(radialOut.multiplyScalar(0.28))
      .normalize();
    if (tailRef.current) {
      tailRef.current.quaternion.setFromUnitVectors(LOCAL_TAIL_AXIS, tailDir);
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.y = time * (isStar ? 0.8 : 0.32) + seed;
      bodyRef.current.rotation.x = Math.sin(time * 0.17 + seed) * 0.18;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = -time * 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.22 + seed;
    }

    if (onPositionUpdate && visible) {
      onPositionUpdate(globalIndex, {
        x,
        z,
        radius: currentRadius,
        angle: orbitalAngle,
        color: colorObj,
      });
    }

    const opacity = visible ? (isEmphasized ? 1 : 0.16) : 0;
    bodyMaterial.uniforms.uTime.value = time;
    bodyMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      bodyMaterial.uniforms.uOpacity.value,
      opacity,
      0.08
    );
    atmosphereMaterial.uniforms.uTime.value = time;
    atmosphereMaterial.uniforms.uOpacity.value =
      bodyMaterial.uniforms.uOpacity.value *
      (isFocused ? 1.1 : isHovered ? 0.86 : isStar ? 0.75 : 0.56);
    ringMaterial.uniforms.uTime.value = time;
    ringMaterial.uniforms.uOpacity.value =
      bodyMaterial.uniforms.uOpacity.value * (hasRing || isFocused ? 0.92 : 0);
    tailMaterial.uniforms.uOpacity.value =
      bodyMaterial.uniforms.uOpacity.value *
      (isFocused ? 1.0 : isStar ? 0.9 : 0.58);

    if (textRef.current) {
      groupRef.current.getWorldPosition(worldPositionRef.current);
      projectedPositionRef.current.copy(worldPositionRef.current);
      projectedPositionRef.current.project(state.camera);

      const isInView =
        Math.abs(projectedPositionRef.current.x) < 1.08 &&
        Math.abs(projectedPositionRef.current.y) < 1.04 &&
        projectedPositionRef.current.z < 1;
      const depthFactor = THREE.MathUtils.clamp(
        1.08 - (projectedPositionRef.current.z + 0.2) * 0.72,
        0,
        1
      );
      const labelBase = isFocused
        ? 1
        : isHovered
        ? 0.95
        : activeCategory === skill.category
        ? 0.82
        : activeCategory === null
        ? isStar
          ? 0.38
          : 0.22
        : 0;
      const labelOpacity =
        bodyMaterial.uniforms.uOpacity.value *
        labelBase *
        depthFactor *
        (isInView ? 1 : 0);
      const labelScale = isFocused
        ? 1.28
        : isHovered
        ? 1.14
        : 0.9 + depthFactor * 0.18;

      textRef.current.fillOpacity = THREE.MathUtils.lerp(
        textRef.current.fillOpacity ?? 0,
        labelOpacity,
        0.1
      );
      textRef.current.outlineOpacity = THREE.MathUtils.lerp(
        textRef.current.outlineOpacity ?? 0,
        labelOpacity * 0.95,
        0.1
      );
      labelScaleRef.current.set(labelScale, labelScale, labelScale);
      textRef.current.scale.lerp(labelScaleRef.current, 0.08);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={tailRef} geometry={tailGeometry} material={tailMaterial} />

      <mesh
        ref={bodyRef}
        material={bodyMaterial}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(globalIndex);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onFocus(isFocused ? null : globalIndex);
        }}
      >
        <sphereGeometry args={[scale * (isStar ? 0.88 : 1), 48, 32]} />
      </mesh>

      <mesh
        ref={atmosphereRef}
        material={atmosphereMaterial}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(globalIndex);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onFocus(isFocused ? null : globalIndex);
        }}
      >
        <sphereGeometry args={[scale * (isStar ? 1.95 : 1.62), 48, 32]} />
      </mesh>

      {hasRing && (
        <mesh
          ref={ringRef}
          rotation={[Math.PI / 2.7, 0.2, 0.45]}
          material={ringMaterial}
        >
          <torusGeometry args={[scale * 1.45, scale * 0.035, 8, 160]} />
        </mesh>
      )}

      {isStar && (
        <Sparkles
          count={18}
          scale={scale * 3.2}
          size={1.5}
          speed={0.7}
          opacity={visible ? 0.45 : 0}
          color={colorA}
          noise={0.35}
        />
      )}

      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={textRef}
          position={[0, scale * 2.05, 0]}
          fontSize={0.2}
          color={colorA}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0}
          outlineWidth={0.03}
          outlineColor="#02040a"
          outlineOpacity={0}
          maxWidth={1.8}
        >
          {skill.name}
        </Text>
      </Billboard>
    </group>
  );
}

export default function OrbitingSkills({
  visible,
  skillPositionsRef,
  activeCategory = null,
  controlsRef,
  isMobile = false,
}: OrbitingSkillsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positionsRef = useRef<SkillPosition[]>([]);
  const visualPositionsRef = useRef<THREE.Vector3[]>(
    allSkills.map(() => new THREE.Vector3())
  );
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [focusedSkill, setFocusedSkill] = useState<number | null>(null);
  const { camera, gl } = useThree();
  const cameraTargetRef = useRef(new THREE.Vector3());
  const desiredCameraRef = useRef(new THREE.Vector3());
  const outwardRef = useRef(new THREE.Vector3());
  const centerRef = useRef(new THREE.Vector3());

  const skillsByCategory = useMemo(() => {
    const counts: { [key: number]: number } = {};
    allSkills.forEach((skill) => {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    });
    return counts;
  }, []);

  const skillIndicesByCategory = useMemo(() => {
    return categoryRadii.map((_, category) =>
      allSkills
        .map((skill, index) => (skill.category === category ? index : -1))
        .filter((index) => index !== -1)
    );
  }, []);

  const handlePositionUpdate = useMemo(() => {
    return (index: number, position: SkillPosition) => {
      positionsRef.current[index] = position;
      if (skillPositionsRef) {
        skillPositionsRef.current = [...positionsRef.current];
      }
    };
  }, [skillPositionsRef]);

  const categoryIndices: { [key: number]: number } = {};
  const hoveredCategory =
    hoveredSkill !== null ? allSkills[hoveredSkill]?.category : null;
  const focusedCategory =
    focusedSkill !== null ? allSkills[focusedSkill]?.category : null;
  const highlightedCategory =
    activeCategory ?? hoveredCategory ?? focusedCategory ?? null;

  useEffect(() => {
    if (!visible) {
      setFocusedSkill(null);
      setHoveredSkill(null);
    }
  }, [visible]);

  useEffect(() => {
    if (
      activeCategory !== null &&
      focusedSkill !== null &&
      allSkills[focusedSkill]?.category !== activeCategory
    ) {
      setFocusedSkill(null);
    }
  }, [activeCategory, focusedSkill]);

  useEffect(() => {
    gl.domElement.style.cursor =
      hoveredSkill !== null || focusedSkill !== null ? 'pointer' : 'auto';
    return () => {
      gl.domElement.style.cursor = 'auto';
    };
  }, [gl, hoveredSkill, focusedSkill]);

  useFrame(() => {
    if (!visible || !controlsRef?.current || !groupRef.current) return;

    const controls = controlsRef.current;
    if (focusedSkill !== null) {
      const localPosition = visualPositionsRef.current[focusedSkill];
      if (localPosition) {
        cameraTargetRef.current
          .copy(localPosition)
          .applyMatrix4(groupRef.current.matrixWorld);
        outwardRef.current.copy(cameraTargetRef.current);
        if (outwardRef.current.lengthSq() < 0.001) {
          outwardRef.current.set(0, 0.4, 1);
        }
        outwardRef.current.normalize();
        desiredCameraRef.current
          .copy(cameraTargetRef.current)
          .addScaledVector(outwardRef.current, isMobile ? 6.2 : 4.6);
        desiredCameraRef.current.y += isMobile ? 1.4 : 1.0;

        camera.position.lerp(desiredCameraRef.current, 0.055);
        controls.target.lerp(cameraTargetRef.current, 0.09);
      }
    } else {
      controls.target.lerp(centerRef.current, 0.045);
      if (camera.position.length() < 15) {
        camera.position.lerp(DEFAULT_CAMERA_POSITION, 0.025);
      }
    }
    controls.update();
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 3.0, 0, 0]}>
      {categoryRadii.map((radius, i) => (
        <OrbitRail
          key={i}
          radius={radius}
          color={categoryColors[i]}
          index={i}
          visible={
            visible &&
            (highlightedCategory === null || highlightedCategory === i)
          }
        />
      ))}

      {skillIndicesByCategory.map((indices, category) => (
        <ConstellationLines
          key={category}
          active={highlightedCategory === category}
          color={categoryColors[category]}
          indices={indices}
          positionsRef={visualPositionsRef}
          visible={visible}
        />
      ))}

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
            globalIndex={globalIndex}
            activeCategory={highlightedCategory}
            hoveredSkill={hoveredSkill}
            focusedSkill={focusedSkill}
            visualPositionsRef={visualPositionsRef}
            onHover={setHoveredSkill}
            onFocus={setFocusedSkill}
            onPositionUpdate={handlePositionUpdate}
          />
        );
      })}
    </group>
  );
}
