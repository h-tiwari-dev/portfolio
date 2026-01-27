'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarFieldShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float size;
    attribute float twinkle;
    varying vec3 vColor;
    varying float vTwinkle;
    
    void main() {
        vColor = color;
        vTwinkle = sin(uTime * 2.5 + twinkle) * 0.5 + 0.5;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vTwinkle;
    
    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= (0.2 + vTwinkle * 0.8);
        
        gl_FragColor = vec4(vColor, alpha);
    }
  `,
};

export default function StarField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, colors, sizes, twinkle } = useMemo(() => {
    const starCount = 15000; // Reduced slightly for performance in React context
    const starFieldRadius = 2000;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinkle = new Float32Array(starCount);

    const starPalette = [
      new THREE.Color(0x88aaff),
      new THREE.Color(0xffaaff),
      new THREE.Color(0xaaffff),
      new THREE.Color(0xffddaa),
      new THREE.Color(0xffeecc),
      new THREE.Color(0xffffff),
      new THREE.Color(0xff8888),
      new THREE.Color(0x88ff88),
      new THREE.Color(0xffff88),
      new THREE.Color(0x88ffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const phi = Math.acos(-1 + (2 * i) / starCount);
      const theta = Math.sqrt(starCount * Math.PI) * phi;
      const radius = Math.cbrt(Math.random()) * starFieldRadius + 100;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const starColor =
        starPalette[Math.floor(Math.random() * starPalette.length)].clone();
      starColor.multiplyScalar(Math.random() * 0.7 + 0.3);
      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;

      sizes[i] = Math.random() * 2.4 + 0.6; // Random size 0.6 to 3.0
      twinkle[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, twinkle };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;
    }
  });

  return (
    <points rotation={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-twinkle"
          count={twinkle.length}
          array={twinkle}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={StarFieldShader.vertexShader}
        fragmentShader={StarFieldShader.fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: 1 }, // Updated in loop
        }}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
