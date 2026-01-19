import { useEffect, useState } from "react";
import * as ROSLIB from 'roslib';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface TwistMessage {
  linear: { x: number; y: number; z: number };
  angular: { x: number; y: number; z: number };
}

const PORT = 9090;

const App = () => {
  const [connected, setConnected] = useState(false);
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const rosConnection = new ROSLIB.Ros({ 
      url: `ws://localhost:${PORT}`,
    });

    rosConnection.on('connection', () => {
      console.log('connected to ws');
      setConnected(true);
    });

    rosConnection.on('error', (error: any) => {
      console.log('error connecting to ws server: ', error);
      setConnected(false);
    });

    rosConnection.on('close', () => {
      console.log('connection to ws server closed');
      setConnected(false);
    });

    setRos(rosConnection);

    const odomListener = new ROSLIB.Topic({
      ros: rosConnection,
      name: '/odom',
      messageType: 'nav_msgs/msg/Odometry',
      throttle_rate: 100,
    });

    odomListener.subscribe((message: any) => {
      const pos = message.pose.pose.position;
      setPosition({
        x: parseFloat(pos.x.toFixed(2)),
        y: parseFloat(pos.y.toFixed(2)),
        z: parseFloat(pos.z.toFixed(2)),
      });
    });

    return () => {
      odomListener.unsubscribe();
      rosConnection.close();
    };
  }, []);

  const move = (linear: number, angular: number) => {
    if (!ros) return;
    // console.log(linear, angular)

    const cmdVel = new ROSLIB.Topic({
      ros: ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/msg/Twist',
    });

    const twist: TwistMessage = {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    };

    cmdVel.publish(twist);
  } ;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>React ROS 2 Control Panel</h1>
      
      {/* Connection Status Indicator */}
      <div style={{ marginBottom: '20px' }}>
        Status: 
        <span style={{ 
          color: connected ? 'green' : 'red', 
          fontWeight: 'bold', 
          marginLeft: '10px' 
        }}>
          {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Telemetry Display */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>📍 Live Odometry</h3>
        <p>X: {position.x}</p>
        <p>Y: {position.y}</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: '10px' }}>
        <div></div>
        <button onMouseDown={() => move(0.5, 0)} onMouseUp={() => move(0, 0)}>⬆️</button>
        <div></div>
        <button onMouseDown={() => move(0, 0.5)} onMouseUp={() => move(0, 0)}>⬅️</button>
        <button onMouseDown={() => move(0, 0)} onMouseUp={() => move(0, 0)}>🛑</button>
        <button onMouseDown={() => move(0, -0.5)} onMouseUp={() => move(0, 0)}>➡️</button>
        <div></div>
        <button onMouseDown={() => move(-0.5, 0)} onMouseUp={() => move(0, 0)}>⬇️</button>
        <div></div>
      </div>
    </div>
  );
}

export default App;