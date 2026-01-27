"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GlobeSceneProps {
  isMobile?: boolean;
}

function NetworkArc({
  start,
  end,
  color,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: THREE.Color;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(Math.random());

  const curve = useMemo(() => {
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(2.2);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.008, 8, false);
  }, [curve]);

  useFrame((_, delta) => {
    setProgress((p) => (p + delta * 0.15) % 1);
  });

  const pointOnCurve = curve.getPoint(progress);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={pointOnCurve}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial
          color="#22d3d4"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function GlobeScene({ isMobile = false }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });

  const detailLevel = isMobile ? 1 : 2;
  const arcCount = isMobile ? 6 : 10;

  const { wireframeGeometry, pointsGeometry, vertices } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, detailLevel);
    const wireGeo = new THREE.WireframeGeometry(geo);

    const positions = geo.attributes.position as THREE.BufferAttribute;
    const uniqueVertices: THREE.Vector3[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < positions.count; i++) {
      const v = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVertices.push(v);
      }
    }

    const pointsPositions = new Float32Array(uniqueVertices.length * 3);
    uniqueVertices.forEach((v, i) => {
      pointsPositions[i * 3] = v.x;
      pointsPositions[i * 3 + 1] = v.y;
      pointsPositions[i * 3 + 2] = v.z;
    });

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(pointsPositions, 3)
    );

    return {
      wireframeGeometry: wireGeo,
      pointsGeometry: pointsGeo,
      vertices: uniqueVertices,
    };
  }, [detailLevel]);

  const arcs = useMemo(() => {
    const connections: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const usedIndices = new Set<string>();

    for (let i = 0; i < arcCount; i++) {
      let startIdx, endIdx;
      let attempts = 0;
      do {
        startIdx = Math.floor(Math.random() * vertices.length);
        endIdx = Math.floor(Math.random() * vertices.length);
        attempts++;
      } while (
        (startIdx === endIdx ||
          usedIndices.has(`${startIdx}-${endIdx}`) ||
          usedIndices.has(`${endIdx}-${startIdx}`)) &&
        attempts < 50
      );

      if (startIdx !== endIdx) {
        usedIndices.add(`${startIdx}-${endIdx}`);
        connections.push({
          start: vertices[startIdx],
          end: vertices[endIdx],
        });
      }
    }

    return connections;
  }, [vertices, arcCount]);

  const wireframeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#f59e0b"),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const pointsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#22d3d4"),
        size: 0.04,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!globeRef.current) return;

    targetRotation.current.y = mouse.x * viewport.width * 0.01;
    targetRotation.current.x = mouse.y * viewport.height * 0.01;

    globeRef.current.rotation.y += 0.002;
    globeRef.current.rotation.x +=
      (targetRotation.current.x * 0.1 - globeRef.current.rotation.x * 0.1) *
      delta *
      2;
    globeRef.current.rotation.y +=
      (targetRotation.current.y * 0.1 - globeRef.current.rotation.y * 0.1 + 0.3) *
      delta *
      0.5;
  });

  const arcColor = useMemo(() => new THREE.Color("#f59e0b"), []);

  return (
    <group ref={globeRef} position={[0, 0, 0]}>
      <lineSegments geometry={wireframeGeometry} material={wireframeMaterial} />
      <points geometry={pointsGeometry} material={pointsMaterial} />

      {arcs.map((arc, i) => (
        <NetworkArc key={i} start={arc.start} end={arc.end} color={arcColor} />
      ))}

      <mesh>
        <sphereGeometry args={[1.75, 32, 32]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
