import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RobotState } from '../../types/ros';

interface RobotMeshProps {
  robotState: RobotState;
}

export function RobotMesh({ robotState }: RobotMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const { x, y } = robotState.position;
    groupRef.current.position.set(x, y, 0);
    groupRef.current.rotation.set(0, 0, robotState.theta);
  });

  return (
    <group ref={groupRef}>
      {/* Glow halo */}
      <mesh>
        <circleGeometry args={[0.18, 32]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.08} />
      </mesh>

      {/* Body disc */}
      <mesh>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial color="#0f1829" />
      </mesh>
      <mesh>
        <ringGeometry args={[0.11, 0.13, 32]} />
        <meshBasicMaterial color="#4a9eff" />
      </mesh>

      {/* Direction indicator */}
      <mesh position={[0.1, 0, 0.01]}>
        <coneGeometry args={[0.04, 0.1, 8]} />
        <meshBasicMaterial color="#4a9eff" />
      </mesh>
    </group>
  );
}