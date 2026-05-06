import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LidarPointsProps {
  points: React.RefObject<[number, number][]>;
}

export function LidarPoints({ points }: LidarPointsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = points.current;
    if (!p.length) return;

    // Points are already in world frame — place directly
    p.forEach((point, i) => {
      if (i >= meshRef.current!.count) return;
      dummy.position.set(point[0], point[1], 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    dummy.position.set(0, 0, -1000);
    dummy.updateMatrix();
    for (let i = p.length; i < meshRef.current.count; i++) {
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 360]}>
      <circleGeometry args={[0.02, 6]} />
      <meshBasicMaterial color="#ff4a6a" transparent opacity={0.8} />
    </instancedMesh>
  );
}