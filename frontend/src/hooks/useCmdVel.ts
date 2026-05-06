import { useRef, useCallback } from 'react';
import * as ROSLIB from 'roslib';

export function useCmdVel(ros: ROSLIB.Ros | null) {
  const topicRef = useRef<ROSLIB.Topic<unknown> | null>(null);

  const getOrCreateTopic = useCallback(() => {
    if (!ros) return null;
    if (!topicRef.current) {
      topicRef.current = new ROSLIB.Topic({
        ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/msg/Twist',
      });
    }
    return topicRef.current;
  }, [ros]);

  const publish = useCallback((linear: number, angular: number) => {
    const topic = getOrCreateTopic();
    if (!topic) return;
    topic.publish({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    });
  }, [getOrCreateTopic]);

  const stop = useCallback(() => publish(0, 0), [publish]);

  return { publish, stop };
}