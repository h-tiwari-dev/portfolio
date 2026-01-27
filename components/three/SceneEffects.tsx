'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';
import { ShaderPass } from 'three-stdlib';

extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass });

export default function SceneEffects() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const cmp = new EffectComposer(gl);
    cmp.addPass(new RenderPass(scene, camera));
    return cmp;
  }, [gl, scene, camera]);

  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const lensingPassRef = useRef<ShaderPass | null>(null);

  useEffect(() => {
    // Bloom Pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.8, // strength
      0.7, // radius
      0.8 // threshold
    );
    bloomPassRef.current = bloomPass;
    composer.addPass(bloomPass);

    // Custom Lensing Shader Pass
    const lensingShader = {
      uniforms: {
        tDiffuse: { value: null },
        blackHoleScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
        lensingStrength: { value: 0.12 },
        lensingRadius: { value: 0.3 },
        aspectRatio: { value: size.width / size.height },
        chromaticAberration: { value: 0.005 },
      },
      vertexShader: `
        varying vec2 vUv; 
        void main() { 
          vUv = uv; 
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 blackHoleScreenPos;
        uniform float lensingStrength;
        uniform float lensingRadius;
        uniform float aspectRatio;
        uniform float chromaticAberration;
        varying vec2 vUv;
        
        void main() {
            vec2 screenPos = vUv;
            vec2 toCenter = screenPos - blackHoleScreenPos;
            toCenter.x *= aspectRatio;
            float dist = length(toCenter);
            
            float distortionAmount = lensingStrength / (dist * dist + 0.003);
            distortionAmount = clamp(distortionAmount, 0.0, 0.7);
            float falloff = smoothstep(lensingRadius, lensingRadius * 0.3, dist);
            distortionAmount *= falloff;
            
            vec2 offset = normalize(toCenter) * distortionAmount;
            offset.x /= aspectRatio;
            
            vec2 distortedUvR = screenPos - offset * (1.0 + chromaticAberration);
            vec2 distortedUvG = screenPos - offset;
            vec2 distortedUvB = screenPos - offset * (1.0 - chromaticAberration);
            
            float r = texture2D(tDiffuse, distortedUvR).r;
            float g = texture2D(tDiffuse, distortedUvG).g;
            float b = texture2D(tDiffuse, distortedUvB).b;
            
            gl_FragColor = vec4(r, g, b, 1.0);
        }
      `,
    };

    const lensingPass = new ShaderPass(lensingShader);
    lensingPassRef.current = lensingPass;
    composer.addPass(lensingPass);

    return () => {
      // Cleanup passes if needed, but composer is recreated on unmount usually
    };
  }, [composer, size]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    if (bloomPassRef.current) {
      bloomPassRef.current.resolution.set(size.width, size.height);
    }
    if (lensingPassRef.current) {
      lensingPassRef.current.uniforms.aspectRatio.value =
        size.width / size.height;
    }
  }, [composer, size]);

  const blackHolePos = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    // Update Lensing Uniforms
    if (lensingPassRef.current) {
      const screenPos = blackHolePos.clone().project(camera);
      lensingPassRef.current.uniforms.blackHoleScreenPos.value.set(
        (screenPos.x + 1) / 2,
        (screenPos.y + 1) / 2
      );
    }

    // Render
    composer.render();
  }, 1); // Priority 1 to render after default? Or take over?

  return null;
}
