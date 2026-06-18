'use client';

import { useMemo, useRef, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

const BLACK_HOLE_RADIUS = 2.6; // Doubled from 1.3
const DISK_INNER_RADIUS = 3.0; // Doubled from 1.5
const DISK_OUTER_RADIUS = 14.0; // Increased from 8.0
const DISK_TILT_ANGLE = Math.PI / 3.0;
const MAX_SKILL_DISTURBANCES = 28; // Maximum skills to track for disturbance
const PHOTON_RING_RADIUS = BLACK_HOLE_RADIUS * 1.28;
const AURA_RADIUS = BLACK_HOLE_RADIUS * 2.55;

export interface SkillPosition {
  x: number;
  z: number;
  radius: number;
  angle: number;
  color: THREE.Color;
}

export interface BlackHoleCoreProps {
  skillPositionsRef?: MutableRefObject<SkillPosition[]>;
}

const EventHorizonShader = {
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
    uniform float uTime;
    uniform vec3 uCameraPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    void main() {
        vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
        float fresnel = 1.0 - abs(dot(normalize(vNormal), viewDirection));
        float razorRim = pow(fresnel, 7.0);
        float softRim = pow(fresnel, 2.4);
        
        float shear = sin(vWorldPosition.y * 6.0 + uTime * 1.7) * 0.5 + 0.5;
        float pulse = sin(uTime * 2.1) * 0.12 + 0.88;
        vec3 ember = vec3(1.0, 0.36, 0.08);
        vec3 violet = vec3(0.46, 0.22, 1.0);
        vec3 glowColor = mix(ember, violet, shear * 0.35);
        
        float alpha = (softRim * 0.18 + razorRim * 0.55) * pulse;
        vec3 color = glowColor * (softRim * 0.5 + razorRim * 2.2);
        gl_FragColor = vec4(color, alpha);
    }
  `,
};

const GravitationalAuraShader = {
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
    uniform float uTime;
    uniform vec3 uCameraPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
      float fresnel = 1.0 - abs(dot(normalize(vNormal), viewDirection));
      float outerHalo = pow(fresnel, 3.2);
      float thinCaustic = pow(fresnel, 12.0);
      float pulse = sin(uTime * 0.9) * 0.08 + 0.92;

      vec3 blue = vec3(0.16, 0.44, 1.0);
      vec3 rose = vec3(1.0, 0.18, 0.42);
      vec3 color = mix(blue, rose, thinCaustic) * pulse;
      float alpha = outerHalo * 0.075 + thinCaustic * 0.16;

      gl_FragColor = vec4(color, alpha);
    }
  `,
};

const PhotonRingShader = {
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

      vec3 displaced = position;
      displaced.z += sin(uv.x * 6.28318 * 8.0 + uTime * 1.4) * 0.006;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uCameraPosition;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 1.6);
      float thread = sin((vUv.x + uTime * 0.055) * 6.28318 * 12.0) * 0.5 + 0.5;
      float hotSpot = pow(thread, 5.0);
      float tube = 1.0 - smoothstep(0.18, 0.5, abs(vUv.y - 0.5));
      float pulse = sin(uTime * 2.8 + vUv.x * 6.28318 * 2.0) * 0.08 + 0.92;

      vec3 hot = vec3(1.0, 0.68, 0.28);
      vec3 rose = vec3(1.0, 0.22, 0.48);
      vec3 violet = vec3(0.48, 0.3, 1.0);
      vec3 color = mix(rose, hot, hotSpot);
      color = mix(color, violet, smoothstep(0.62, 1.0, vUv.y) * 0.35);

      float alpha = tube * (0.26 + hotSpot * 0.56 + fresnel * 0.28) * pulse * uOpacity;
      gl_FragColor = vec4(color * (1.35 + hotSpot * 1.6), alpha);
    }
  `,
};

const DiskShader = {
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vRadius;
    varying float vAngle;
    varying float vWarp;
    varying vec2 vPosition2D;
    void main() {
        vUv = uv;
        vRadius = length(position.xy);
        vAngle = atan(position.y, position.x);
        vPosition2D = position.xy;

        float normalizedRadius = smoothstep(${DISK_INNER_RADIUS.toFixed(
          2
        )}, ${DISK_OUTER_RADIUS.toFixed(2)}, vRadius);
        float innerPull = pow(1.0 - normalizedRadius, 1.8);
        float corrugation = sin(vAngle * 5.0 + uTime * 0.75) * 0.08;
        corrugation += sin(vAngle * 11.0 - uTime * 0.46) * 0.035;
        vWarp = corrugation * innerPull;

        vec3 displaced = position;
        displaced.z += vWarp;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorHot;
    uniform vec3 uColorMid1;
    uniform vec3 uColorMid2;
    uniform vec3 uColorMid3;
    uniform vec3 uColorOuter;
    uniform float uNoiseScale;
    uniform float uFlowSpeed;
    uniform float uDensity;

    // Skill disturbance uniforms
    uniform vec2 uSkillPositions[${MAX_SKILL_DISTURBANCES}];
    uniform int uActiveSkills;
    uniform float uDisturbanceStrength;

    varying vec2 vUv;
    varying float vRadius;
    varying float vAngle;
    varying float vWarp;
    varying vec2 vPosition2D;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    // Calculate flow disturbance from orbiting skills - affects turbulence pattern only
    float calculateDisturbance(vec2 pos, float time) {
        float totalDisturbance = 0.0;

        for (int i = 0; i < ${MAX_SKILL_DISTURBANCES}; i++) {
            if (i >= uActiveSkills) break;

            vec2 skillPos = uSkillPositions[i];
            float dist = length(pos - skillPos);

            // Gentle ripple in flow pattern
            float rippleWave = sin(dist * 1.5 - time * 2.0) * 0.5 + 0.5;
            float rippleFalloff = exp(-dist * 1.0) * smoothstep(2.0, 0.0, dist);

            // Wake turbulence trailing behind skill
            float skillAngle = atan(skillPos.y, skillPos.x);
            float posAngle = atan(pos.y, pos.x);
            float angleDiff = abs(mod(skillAngle - posAngle + 3.14159, 6.28318) - 3.14159);
            float wakeFactor = smoothstep(0.6, 0.0, angleDiff) * smoothstep(2.5, 0.0, dist) * 0.25;

            totalDisturbance += (rippleWave * rippleFalloff * 0.3 + wakeFactor) * uDisturbanceStrength;
        }

        return clamp(totalDisturbance, 0.0, 0.4);
    }

    void main() {
        float normalizedRadius = smoothstep(${DISK_INNER_RADIUS.toFixed(
          2
        )}, ${DISK_OUTER_RADIUS.toFixed(2)}, vRadius);
        float innerHeat = pow(1.0 - normalizedRadius, 1.65);

        float disturbance = calculateDisturbance(vPosition2D, uTime);

        float spiral = vAngle * 5.5 - (1.0 / (normalizedRadius + 0.08)) * 3.4;
        spiral += uTime * 0.72 + disturbance * 0.55;
        float filamentA = sin(spiral) * 0.5 + 0.5;
        float filamentB = sin(spiral * 1.9 + uTime * 0.38) * 0.5 + 0.5;

        vec2 noiseUv = vec2(
          vUv.x + uTime * uFlowSpeed * (2.35 / (vRadius * 0.28 + 1.0)) + sin(spiral) * 0.14,
          vUv.y * 0.82 + cos(spiral) * 0.12 + vWarp * 0.2
        );

        noiseUv += disturbance * 0.09;

        float noiseVal1 = snoise(vec3(noiseUv * uNoiseScale, uTime * 0.16));
        float noiseVal2 = snoise(vec3(noiseUv * uNoiseScale * 3.2 + 0.8, uTime * 0.24));
        float noiseVal3 = snoise(vec3(noiseUv * uNoiseScale * 7.0 + 1.5, uTime * 0.34));
        float disturbanceNoise = snoise(vec3(noiseUv * uNoiseScale * 5.5, uTime * 0.46 + disturbance * 2.0)) * disturbance * 0.22;

        float noiseVal = (noiseVal1 * 0.42 + noiseVal2 * 0.34 + noiseVal3 * 0.24 + disturbanceNoise);
        noiseVal = (noiseVal + 1.0) * 0.5;

        vec3 color = uColorHot;
        color = mix(color, uColorMid1, smoothstep(0.06, 0.24, normalizedRadius));
        color = mix(color, uColorMid2, smoothstep(0.22, 0.48, normalizedRadius));
        color = mix(color, uColorMid3, smoothstep(0.45, 0.72, normalizedRadius));
        color = mix(color, uColorOuter, smoothstep(0.68, 1.0, normalizedRadius));

        float doppler = 0.72 + pow(max(0.0, cos(vAngle - 0.45 - uTime * 0.05)), 2.0) * 0.68;
        float backLensedArc = pow(max(0.0, sin(vAngle + 0.12)), 6.0) * (1.0 - smoothstep(0.32, 0.78, normalizedRadius));
        float filament = pow(filamentA, 3.0) * 0.65 + pow(filamentB, 6.0) * 0.45;
        float innerPhotonHeat = exp(-pow((vRadius - ${DISK_INNER_RADIUS.toFixed(
          2
        )}) / 0.46, 2.0));

        float darkLane = smoothstep(0.02, 0.34, abs(vUv.y - 0.5));
        color *= 0.62 + noiseVal * 0.78 + filament * 0.52;

        float brightness = innerHeat * 3.8 + 0.22;
        brightness *= 0.52 + noiseVal * 1.22 + filament * 0.9;
        brightness *= doppler;
        brightness += backLensedArc * 1.1 + innerPhotonHeat * 2.0;

        float pulse = sin(uTime * 1.7 + normalizedRadius * 14.0 + vAngle * 2.4) * 0.08 + 0.92;
        brightness *= pulse;

        float alpha = uDensity * (0.16 + noiseVal * 0.74 + filament * 0.34);
        alpha *= smoothstep(0.0, 0.11, normalizedRadius);
        alpha *= (1.0 - smoothstep(0.86, 1.0, normalizedRadius));
        alpha *= darkLane;
        alpha += innerPhotonHeat * 0.18 + backLensedArc * 0.08;
        alpha = clamp(alpha, 0.0, 0.92);

        gl_FragColor = vec4(color * brightness, alpha);
    }
  `,
};

export default function BlackHoleCore({
  skillPositionsRef,
}: BlackHoleCoreProps) {
  const diskRef = useRef<THREE.Mesh>(null);
  const horizonRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const photonRingRef = useRef<THREE.Mesh>(null);
  const secondaryPhotonRingRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Initialize skill position arrays for uniforms
  const initialSkillPositions = useMemo(() => {
    return new Array(MAX_SKILL_DISTURBANCES)
      .fill(null)
      .map(() => new THREE.Vector2(0, 0));
  }, []);

  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uColorHot: { value: new THREE.Color(0xfff1a6) },
      uColorMid1: { value: new THREE.Color(0xff9a3d) },
      uColorMid2: { value: new THREE.Color(0xff356d) },
      uColorMid3: { value: new THREE.Color(0x8d47ff) },
      uColorOuter: { value: new THREE.Color(0x1f7fff) },
      uNoiseScale: { value: 2.85 },
      uFlowSpeed: { value: 0.26 },
      uDensity: { value: 1.08 },
      // Skill disturbance uniforms - affects flow turbulence only
      uSkillPositions: { value: initialSkillPositions },
      uActiveSkills: { value: 0 },
      uDisturbanceStrength: { value: 0.24 },
    }),
    [initialSkillPositions]
  );

  const horizonUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
    }),
    []
  );

  const auraUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
    }),
    []
  );

  const photonRingUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uOpacity: { value: 1.0 },
    }),
    []
  );

  const secondaryPhotonRingUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uOpacity: { value: 0.42 },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (diskRef.current) {
      diskRef.current.rotation.z = time * 0.05; // Rotate disk
      const material = diskRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;

      // Update skill positions from ref for flow disturbance
      if (skillPositionsRef?.current) {
        const skills = skillPositionsRef.current;
        const positions = material.uniforms.uSkillPositions.value;

        for (let i = 0; i < MAX_SKILL_DISTURBANCES; i++) {
          if (i < skills.length) {
            // Transform skill position to disk-local coordinates
            positions[i].set(skills[i].x, skills[i].z);
          } else {
            positions[i].set(1000, 1000); // Move unused positions far away
          }
        }
        material.uniforms.uActiveSkills.value = Math.min(
          skills.length,
          MAX_SKILL_DISTURBANCES
        );
      }
    }
    if (horizonRef.current) {
      (
        horizonRef.current.material as THREE.ShaderMaterial
      ).uniforms.uTime.value = time;
      (
        horizonRef.current.material as THREE.ShaderMaterial
      ).uniforms.uCameraPosition.value.copy(camera.position);
    }
    if (auraRef.current) {
      const material = auraRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;
      material.uniforms.uCameraPosition.value.copy(camera.position);
    }
    if (photonRingRef.current) {
      const material = photonRingRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;
      material.uniforms.uCameraPosition.value.copy(camera.position);
    }
    if (secondaryPhotonRingRef.current) {
      const material = secondaryPhotonRingRef.current
        .material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time * 0.82;
      material.uniforms.uCameraPosition.value.copy(camera.position);
    }
  });

  return (
    <group>
      {/* Wide gravitational lensing aura */}
      <mesh ref={auraRef} renderOrder={0}>
        <sphereGeometry args={[AURA_RADIUS, 128, 64]} />
        <shaderMaterial
          vertexShader={GravitationalAuraShader.vertexShader}
          fragmentShader={GravitationalAuraShader.fragmentShader}
          uniforms={auraUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Core Black Hole Sphere (The Void) */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[BLACK_HOLE_RADIUS, 128, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event Horizon Glow */}
      <mesh ref={horizonRef}>
        <sphereGeometry args={[BLACK_HOLE_RADIUS * 1.05, 128, 64]} />
        <shaderMaterial
          vertexShader={EventHorizonShader.vertexShader}
          fragmentShader={EventHorizonShader.fragmentShader}
          uniforms={horizonUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Camera-facing photon rings */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh
          ref={secondaryPhotonRingRef}
          renderOrder={4}
          scale={[1.34, 0.84, 1]}
        >
          <torusGeometry args={[PHOTON_RING_RADIUS, 0.035, 16, 256]} />
          <shaderMaterial
            vertexShader={PhotonRingShader.vertexShader}
            fragmentShader={PhotonRingShader.fragmentShader}
            uniforms={secondaryPhotonRingUniforms}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh ref={photonRingRef} renderOrder={5}>
          <torusGeometry args={[PHOTON_RING_RADIUS, 0.075, 20, 320]} />
          <shaderMaterial
            vertexShader={PhotonRingShader.vertexShader}
            fragmentShader={PhotonRingShader.fragmentShader}
            uniforms={photonRingUniforms}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* Accretion Disk */}
      <mesh ref={diskRef} rotation={[DISK_TILT_ANGLE, 0, 0]} renderOrder={1}>
        <ringGeometry args={[DISK_INNER_RADIUS, DISK_OUTER_RADIUS, 256, 128]} />
        <shaderMaterial
          vertexShader={DiskShader.vertexShader}
          fragmentShader={DiskShader.fragmentShader}
          uniforms={diskUniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
