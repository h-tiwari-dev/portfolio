'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleShader = {
  vertexShader: `
    uniform float uTime;
    attribute float aSpeed;
    attribute float aOffset;
    attribute float aRadius;
    
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      float life = mod(uTime * aSpeed + aOffset, 1.0);
      float fall = pow(life, 1.28);
      float currentRadius = mix(aRadius, 2.82, fall);
      float angularVelocity = 2.8 / max(currentRadius, 0.2);
      float angle = aOffset * 6.28318 + uTime * angularVelocity + fall * 5.6;
      float innerGlow = smoothstep(0.52, 1.0, life);
      
      vec3 pos = vec3(
        cos(angle) * currentRadius,
        sin(angle) * currentRadius,
        sin(angle * 3.0 + aOffset * 19.0 + uTime * 0.7) * 0.12 * (1.0 - life * 0.55)
      );

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      gl_PointSize = (46.0 / -mvPosition.z) * (0.35 + 0.85 * innerGlow);
      gl_Position = projectionMatrix * mvPosition;
      
      float fadeIn = smoothstep(0.0, 0.1, life);
      float fadeOut = 1.0 - smoothstep(0.88, 1.0, life);
      vAlpha = fadeIn * fadeOut * (0.36 + innerGlow * 0.82);
      
      vec3 colorOuter = vec3(0.12, 0.48, 1.0);
      vec3 colorMid = vec3(0.95, 0.18, 0.54);
      vec3 colorInner = vec3(1.0, 0.82, 0.42);
      vec3 colorWhiteHot = vec3(1.0, 0.95, 0.78);
      vColor = mix(colorOuter, colorMid, smoothstep(0.12, 0.62, life));
      vColor = mix(vColor, colorInner, smoothstep(0.5, 0.88, life));
      vColor = mix(vColor, colorWhiteHot, smoothstep(0.84, 1.0, life));
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      // Soft circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      float circle = 1.0 - smoothstep(0.4, 0.5, dist);
      
      if (circle < 0.01) discard;
      
      gl_FragColor = vec4(vColor, vAlpha * circle * 0.8);
    }
  `,
};

export default function AccretionParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const count = 5600;

  const { speeds, offsets, radii } = useMemo(() => {
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      speeds[i] = 0.08 + Math.random() * 0.24;
      offsets[i] = Math.random();
      radii[i] = 8.0 + Math.random() * 8.5;
    }
    return { speeds, offsets, radii };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
        state.clock.elapsedTime;
    }
  });

  return (
    // Rotate to match disk tilt
    <group rotation={[Math.PI / 3.0, 0, 0]}>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={new Float32Array(count * 3)} // Dummy positions, vertex shader handles placement
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSpeed"
            count={count}
            array={speeds}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aOffset"
            count={count}
            array={offsets}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRadius"
            count={count}
            array={radii}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={ParticleShader.vertexShader}
          fragmentShader={ParticleShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
