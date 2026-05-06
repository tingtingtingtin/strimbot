import { useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';
import type { RobotState, TrailPoint, OdometryMessage } from '../types/ros';

const MAX_TRAIL = 600;

function quatToYaw(q: { x: number; y: number; z: number; w: number }): number {
  // Extract yaw (rotation around Z) from quaternion
  return Math.atan2(
    2 * (q.w * q.z + q.x * q.y),
    1 - 2 * (q.y * q.y + q.z * q.z)
  );
}

const DEFAULT_STATE: RobotState = {
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: 0, w: 1 },
  theta: 0,
  linearVel: 0,
  angularVel: 0,
};

export function useOdometry(ros: ROSLIB.Ros | null) {
  const [robotState, setRobotState] = useState<RobotState>(DEFAULT_STATE);
  const trailRef = useRef<TrailPoint[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    if (!ros) return;

    const odom = new ROSLIB.Topic({
      ros,
      name: '/odom',
      messageType: 'nav_msgs/msg/Odometry',
      throttle_rate: 50,
    });

    odom.subscribe((message) => {
      const msg = message as OdometryMessage;
      const pos = msg.pose.pose.position;
      const ori = msg.pose.pose.orientation;
      const theta = quatToYaw(ori);
      const linearVel = msg.twist.twist.linear.x;
      const angularVel = msg.twist.twist.angular.z;

      setRobotState({
        position: { x: pos.x, y: pos.y, z: pos.z },
        orientation: ori,
        theta,
        linearVel,
        angularVel,
      });

      // Update trail
      trailRef.current = [
        ...trailRef.current.slice(-MAX_TRAIL),
        { x: pos.x, y: pos.y },
      ];
      setTrail([...trailRef.current]);
    });

    return () => odom.unsubscribe();
  }, [ros]);

  const clearTrail = () => {
    trailRef.current = [];
    setTrail([]);
  };

  return { robotState, trail, clearTrail };
}