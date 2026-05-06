import { useEffect, useRef, useState } from 'react';
import * as ROSLIB from 'roslib';

const ROS_URL = 'ws://localhost:9090';

export function useRos() {
  const [connected, setConnected] = useState(false);
  const rosRef = useRef<ROSLIB.Ros | null>(null);

  // eslint-disable-next-line react-hooks/refs
  if (!rosRef.current) {
    rosRef.current = new ROSLIB.Ros({ url: ROS_URL });
  }

  useEffect(() => {
    const ros = rosRef.current!;
    ros.on('connection', () => setConnected(true));
    ros.on('error', () => setConnected(false));
    ros.on('close', () => setConnected(false));

    return () => ros.close();
  }, []);

  // eslint-disable-next-line react-hooks/refs
  return { ros: rosRef.current, connected };
}