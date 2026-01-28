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
      // Animate radius: spiral inwards
      // r = initialRadius - (time * speed) % range
      // Cycle creates continuous flow
      
      float life = mod(uTime * aSpeed + aOffset, 1.0); // 0 to 1
      
      // Radius shrinks as life goes 0 -> 1
      // Start at 16.0, end at 2.6 (Horizon)
      float currentRadius = mix(16.0, 2.8, life); // Stop just before horizon
      
      // Angle spins faster as radius gets smaller (Conservation of angular momentum)
      // angle = constant + time * baseSpeed / radius
      float angle = aOffset * 6.28 + uTime * (2.0 / currentRadius);
      
      vec3 pos = vec3(
        cos(angle) * currentRadius,
        sin(angle) * currentRadius,
        (sin(angle * 3.0 + uTime) * 0.1) // Slight vertical wobble
      );

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size depends on radius (bigger when closer?) or just perspective
      gl_PointSize = (40.0 / -mvPosition.z) * (0.5 + 0.5 * life); // Grow slightly as they fall in
      gl_Position = projectionMatrix * mvPosition;
      
      // Fade in at start, fade out at end
      float fadeIn = smoothstep(0.0, 0.1, life);
      float fadeOut = 1.0 - smoothstep(0.9, 1.0, life);
      vAlpha = fadeIn * fadeOut;
      
      // Color shifts from Blue (outer) to Hot White/Orange (inner)
      vec3 colorOuter = vec3(0.2, 0.6, 1.0); // Cyan/Blue
      vec3 colorInner = vec3(1.0, 0.8, 0.5); // Hot Orange/White
      vColor = mix(colorOuter, colorInner, life * life); // Exponential heat up
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

  const count = 4000; // Number of particles

  const { speeds, offsets, radii } = useMemo(() => {
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      speeds[i] = 0.1 + Math.random() * 0.2; // Random fall-in speed
      offsets[i] = Math.random(); // Random start position in cycle
      radii[i] = 10.0 + Math.random() * 6.0; // Base radius var
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
