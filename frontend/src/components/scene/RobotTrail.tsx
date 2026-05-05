import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { TrailPoint } from '../../types/ros';

interface RobotTrailProps {
  trail: TrailPoint[];
}

export function RobotTrail({ trail }: RobotTrailProps) {
  const points = useMemo(() => {
    if (trail.length < 2) return null;
    return trail.map((p) => [p.x, p.y, 0] as [number, number, number]);
  }, [trail]);

  if (!points) return null;

  return (
    <Line
      points={points}
      color="#00ff88"
      lineWidth={1.2}
      transparent
      opacity={0.45}
    />
  );
}