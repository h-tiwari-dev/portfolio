'use client';

import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SkillPosition } from './BlackHoleCore';

interface OrbitingSkillsProps {
  visible: boolean;
  skillPositionsRef?: MutableRefObject<SkillPosition[]>;
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
const categoryRadii = [11.0, 13.0, 15.0, 17.0];
const categoryTilts = [0, 0, 0, 0];
const categorySpeeds = [0.15, 0.12, 0.1, 0.08];

// Comet nucleus shader - creates rocky, irregular surface with proper 3D lighting
const CometNucleusShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;
    uniform float uSeed;

    // Simplex noise for surface displacement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    // Calculate displaced normal for proper lighting
    vec3 calculateNormal(vec3 pos, vec3 norm) {
      float eps = 0.01;
      vec3 seed = vec3(uSeed);

      float h0 = snoise((pos + seed) * 6.0) * 0.25 + snoise((pos + seed) * 12.0) * 0.15 + snoise((pos + seed) * 24.0) * 0.08;

      vec3 tangent = normalize(cross(norm, vec3(0.0, 1.0, 0.0)));
      if (length(tangent) < 0.01) tangent = normalize(cross(norm, vec3(1.0, 0.0, 0.0)));
      vec3 bitangent = normalize(cross(norm, tangent));

      vec3 p1 = pos + tangent * eps;
      vec3 p2 = pos + bitangent * eps;

      float h1 = snoise((p1 + seed) * 6.0) * 0.25 + snoise((p1 + seed) * 12.0) * 0.15 + snoise((p1 + seed) * 24.0) * 0.08;
      float h2 = snoise((p2 + seed) * 6.0) * 0.25 + snoise((p2 + seed) * 12.0) * 0.15 + snoise((p2 + seed) * 24.0) * 0.08;

      vec3 newNorm = normalize(norm + tangent * (h0 - h1) / eps * 0.5 + bitangent * (h0 - h2) / eps * 0.5);
      return newNorm;
    }

    void main() {
      vUv = uv;
      vec3 seed = vec3(uSeed);

      // Create irregular rocky surface with multiple octaves
      float noise1 = snoise((position + seed) * 6.0) * 0.25;  // Large bumps
      float noise2 = snoise((position + seed) * 12.0) * 0.15; // Medium detail
      float noise3 = snoise((position + seed) * 24.0) * 0.08; // Fine detail

      // Add craters
      float craterNoise = snoise((position + seed) * 4.0);
      float crater = smoothstep(0.3, 0.5, craterNoise) * -0.2;

      float displacement = noise1 + noise2 + noise3 + crater;
      vDisplacement = displacement;

      vec3 newPosition = position + normal * displacement;
      vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
      vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;

      // Calculate proper displaced normal for lighting
      vNormal = normalize(normalMatrix * calculateNormal(position, normal));

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uCoreColor;
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uLightDir;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 lightDir = normalize(uLightDir);

      // Base rocky colors - darker in crevices, lighter on peaks
      vec3 darkRock = vec3(0.08, 0.06, 0.05);
      vec3 midRock = vec3(0.18, 0.14, 0.12);
      vec3 lightRock = vec3(0.35, 0.30, 0.25);

      // Color based on displacement (height)
      float heightFactor = smoothstep(-0.3, 0.3, vDisplacement);
      vec3 baseColor = mix(darkRock, midRock, heightFactor);
      baseColor = mix(baseColor, lightRock, smoothstep(0.5, 1.0, heightFactor));

      // Diffuse lighting - strong directional light
      float NdotL = max(dot(normal, lightDir), 0.0);
      float diffuse = NdotL * 0.8 + 0.2; // Add ambient

      // Specular highlight for shininess on ice/mineral patches
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

      // Rim lighting for 3D pop
      float rim = 1.0 - max(dot(normal, viewDir), 0.0);
      rim = pow(rim, 3.0);

      // Apply lighting
      vec3 litColor = baseColor * diffuse;
      litColor += vec3(0.8, 0.7, 0.6) * spec * 0.3; // Specular
      litColor += uColor * rim * 0.4; // Colored rim light

      // Add subtle color tint in shadows
      litColor = mix(litColor, litColor * uColor * 0.5 + uColor * 0.1, (1.0 - NdotL) * 0.3);

      // Hot spots - glowing vents near edges
      float hotSpot = rim * smoothstep(0.0, 0.3, vDisplacement);
      litColor += uCoreColor * hotSpot * 0.3;

      // Fresnel glow at very edge
      float fresnel = pow(rim, 4.0);
      litColor += uColor * fresnel * 0.5;

      gl_FragColor = vec4(litColor, uOpacity);
    }
  `,
};

// Comet coma/tail shader - creates glowing gas effect
const CometComaShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDistFromCenter;

    void main() {
      vPosition = position;
      vNormal = normal;
      vDistFromCenter = length(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uIntensity;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDistFromCenter;

    void main() {
      // Radial falloff from center
      float falloff = 1.0 - smoothstep(0.0, 1.0, vDistFromCenter);
      falloff = pow(falloff, 1.5);

      // Fresnel for edge glow
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);

      // Combine for coma effect
      float alpha = (falloff * 0.6 + fresnel * 0.4) * uOpacity * uIntensity;

      // Pulsing
      float pulse = sin(uTime * 3.0) * 0.1 + 0.9;
      alpha *= pulse;

      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

interface SkillNodeProps {
  skill: { name: string; category: number };
  index: number;
  totalInCategory: number;
  visible: boolean;
  globalIndex: number;
  onPositionUpdate?: (index: number, position: SkillPosition) => void;
}

function SkillNode({
  skill,
  index,
  totalInCategory,
  visible,
  globalIndex,
  onPositionUpdate,
}: SkillNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const comaRef = useRef<THREE.Mesh>(null);
  const outerComaRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Points>(null);
  const textRef = useRef<any>(null);

  const initialAngle = useMemo(
    () => (index / totalInCategory) * Math.PI * 2,
    [index, totalInCategory]
  );

  const radius = categoryRadii[skill.category];
  const tilt = categoryTilts[skill.category];
  const speed = categorySpeeds[skill.category];
  const color = categoryColors[skill.category];
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  // Create nucleus material with unique seed per comet
  const nucleusSeed = useMemo(() => globalIndex * 7.31, [globalIndex]);
  const nucleusMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: CometNucleusShader.vertexShader,
      fragmentShader: CometNucleusShader.fragmentShader,
      uniforms: {
        uColor: { value: colorObj },
        uCoreColor: { value: new THREE.Color('#ffffff') },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uSeed: { value: nucleusSeed },
        uLightDir: { value: new THREE.Vector3(1, 1, 0.5).normalize() },
      },
      transparent: true,
    });
  }, [colorObj, nucleusSeed]);

  // Create coma material - reduced intensity to prevent white buildup
  const comaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: CometComaShader.vertexShader,
      fragmentShader: CometComaShader.fragmentShader,
      uniforms: {
        uColor: { value: colorObj },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uIntensity: { value: 0.6 }, // Reduced from 1.0
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [colorObj]);

  // Create outer coma material - reduced intensity
  const outerComaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: CometComaShader.vertexShader,
      fragmentShader: CometComaShader.fragmentShader,
      uniforms: {
        uColor: { value: colorObj },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uIntensity: { value: 0.2 }, // Reduced from 0.4
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [colorObj]);

  // Create tail particles
  const tailGeometry = useMemo(() => {
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Particles trail behind in a cone shape
      const t = i / particleCount;
      const spread = t * 0.8;
      positions[i * 3] = -t * 2.5 + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      sizes[i] = (1.0 - t) * 0.15 + 0.02;
      alphas[i] = (1.0 - t) * 0.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return geometry;
  }, []);

  // Tail particle material
  const tailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
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
    if (!groupRef.current || !nucleusRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * speed;

    // Calculate orbital position
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle) * tilt * radius * 0.3;

    groupRef.current.position.set(x, y, z);

    // Rotate tail to point away from center (sun direction)
    const sunDir = new THREE.Vector3(-x, -y, -z).normalize();
    if (tailRef.current) {
      tailRef.current.lookAt(groupRef.current.position.clone().add(sunDir));
    }

    // Report position for disk disturbance effect
    if (onPositionUpdate && visible) {
      onPositionUpdate(globalIndex, {
        x,
        z,
        radius,
        angle,
        color: colorObj,
      });
    }

    const finalOpacity = visible ? 1 : 0;

    // Update nucleus
    nucleusMaterial.uniforms.uTime.value = time;
    nucleusMaterial.uniforms.uOpacity.value = finalOpacity;

    // Light direction from black hole center (makes 3D form visible)
    const lightDir = new THREE.Vector3(-x, -y, -z).normalize();
    // Add some upward bias for better visibility
    lightDir.y += 0.3;
    lightDir.normalize();
    nucleusMaterial.uniforms.uLightDir.value.copy(lightDir);

    // Subtle rotation
    nucleusRef.current.rotation.y = time * 0.3;
    nucleusRef.current.rotation.x = time * 0.2;

    // Update coma - reduced opacity to prevent white buildup
    comaMaterial.uniforms.uTime.value = time;
    comaMaterial.uniforms.uOpacity.value = finalOpacity * 0.35;

    outerComaMaterial.uniforms.uTime.value = time;
    outerComaMaterial.uniforms.uOpacity.value = finalOpacity * 0.15;

    // Update tail
    tailMaterial.uniforms.uOpacity.value = finalOpacity;

    // Update text
    if (textRef.current) {
      textRef.current.fillOpacity = finalOpacity;
      textRef.current.outlineOpacity = finalOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rocky nucleus with surface detail - higher subdivision for visible bumps */}
      <mesh ref={nucleusRef} material={nucleusMaterial}>
        <icosahedronGeometry args={[0.2, 5]} />
      </mesh>

      {/* Inner coma - bright gas cloud */}
      <mesh ref={comaRef} material={comaMaterial}>
        <sphereGeometry args={[0.35, 32, 32]} />
      </mesh>

      {/* Outer coma - diffuse glow */}
      <mesh ref={outerComaRef} material={outerComaMaterial}>
        <sphereGeometry args={[0.55, 32, 32]} />
      </mesh>

      {/* Particle tail */}
      <points ref={tailRef} geometry={tailGeometry} material={tailMaterial} />

      {/* Dust sparkles around nucleus - reduced opacity */}
      <Sparkles
        count={12}
        scale={0.8}
        size={1.2}
        speed={0.4}
        opacity={visible ? 0.25 : 0}
        color={color}
        noise={0.2}
      />

      {/* Text label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={textRef}
          position={[0, 0.5, 0]}
          fontSize={0.22}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0}
          outlineWidth={0.025}
          outlineColor="#000000"
          outlineOpacity={0}
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
}: OrbitingSkillsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positionsRef = useRef<SkillPosition[]>([]);

  // Count skills per category
  const skillsByCategory = useMemo(() => {
    const counts: { [key: number]: number } = {};
    allSkills.forEach((skill) => {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Handle position updates from skill nodes
  const handlePositionUpdate = useMemo(() => {
    return (index: number, position: SkillPosition) => {
      positionsRef.current[index] = position;
      if (skillPositionsRef) {
        skillPositionsRef.current = [...positionsRef.current];
      }
    };
  }, [skillPositionsRef]);

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
            globalIndex={globalIndex}
            onPositionUpdate={handlePositionUpdate}
          />
        );
      })}
    </group>
  );
}
