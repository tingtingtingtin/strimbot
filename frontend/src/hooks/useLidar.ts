import { useEffect, useRef } from 'react';
import * as ROSLIB from 'roslib';
import type { RobotState } from '../types/ros';

interface LaserScan {
  angle_min: number;
  angle_max: number;
  angle_increment: number;
  ranges: number[];
  range_min: number;
  range_max: number;
}

export function useLidar(ros: ROSLIB.Ros | null, robotStateRef: React.RefObject<RobotState>) {
  const points = useRef<[number, number][]>([]);

  useEffect(() => {
    if (!ros) return;

    const scan = new ROSLIB.Topic({
      ros,
      name: '/scan',
      messageType: 'sensor_msgs/msg/LaserScan',
    });

    scan.subscribe((msg) => {
      const { angle_min, angle_increment, ranges, range_min, range_max } = msg as LaserScan;

      // Capture robot pose at scan time
      const { x, y } = robotStateRef.current.position;
      const theta = robotStateRef.current.theta;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const pts: [number, number][] = [];
      ranges.forEach((r, i) => {
        if (!isFinite(r) || r < range_min || r > range_max) return;
        const angle = angle_min + i * angle_increment;
        const lx = r * Math.cos(angle);
        const ly = r * Math.sin(angle);
        // Bake world-frame transform immediately using pose at scan time
        pts.push([
          x + cos * lx - sin * ly,
          y + sin * lx + cos * ly,
        ]);
      });

      points.current = pts;
    });

    return () => scan.unsubscribe();
  }, [ros, robotStateRef]);

  return { points };
}