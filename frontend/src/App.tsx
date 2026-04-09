import { useEffect, useRef, useState } from "react";
import * as ROSLIB from 'roslib';

interface Position {
  x: number;
  y: number;
  z: number;
}

type NavState = 'idle' | 'navigating' | 'canceling' | 'succeeded' | 'failed';

// action_msgs/msg/GoalStatus codes
const STATUS_EXECUTING  = 2;
const STATUS_CANCELING  = 3;
const STATUS_SUCCEEDED  = 4;
const STATUS_CANCELED   = 5;
const STATUS_ABORTED    = 6;

const PORT = 9090;

const App = () => {
  const [connected, setConnected] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
  const [navState, setNavState] = useState<NavState>('idle');
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [goalX, setGoalX] = useState('1.0');
  const [goalY, setGoalY] = useState('0.0');

  const goalPoseTopic = useRef<ROSLIB.Topic | null>(null);
  const cancelService = useRef<ROSLIB.Service | null>(null);

  useEffect(() => {
    const ros = new ROSLIB.Ros({ url: `ws://localhost:${PORT}` });

    ros.on('connection', () => { console.log('connected to ws'); setConnected(true); });
    ros.on('error',      (e: any) => { console.log('ws error', e); setConnected(false); });
    ros.on('close',      () => { console.log('ws closed'); setConnected(false); });

    // Odometry
    const odomListener = new ROSLIB.Topic({
      ros,
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

    // Goal pose publisher — Nav2 BT navigator listens here
    goalPoseTopic.current = new ROSLIB.Topic({
      ros,
      name: '/goal_pose',
      messageType: 'geometry_msgs/msg/PoseStamped',
    });

    // Cancel service — action_msgs/srv/CancelGoal
    cancelService.current = new ROSLIB.Service({
      ros,
      name: '/navigate_to_pose/_action/cancel_goal',
      serviceType: 'action_msgs/srv/CancelGoal',
    });

    // Navigation status — derives idle/navigating/succeeded/failed
    const statusListener = new ROSLIB.Topic({
      ros,
      name: '/navigate_to_pose/_action/status',
      messageType: 'action_msgs/msg/GoalStatusArray',
    });
    statusListener.subscribe((message: any) => {
      const list: any[] = message.status_list ?? [];
      if (list.length === 0) { setNavState('idle'); return; }
      const code: number = list[list.length - 1].status;
      if      (code === STATUS_EXECUTING)                       setNavState('navigating');
      else if (code === STATUS_CANCELING)                       setNavState('canceling');
      else if (code === STATUS_SUCCEEDED)                     { setNavState('succeeded'); setDistanceRemaining(null); }
      else if (code === STATUS_CANCELED || code === STATUS_ABORTED) { setNavState('failed'); setDistanceRemaining(null); }
      else                                                      setNavState('idle');
    });

    // Navigation feedback — distance remaining
    const feedbackListener = new ROSLIB.Topic({
      ros,
      name: '/navigate_to_pose/_action/feedback',
      messageType: 'nav2_msgs/action/NavigateToPose_FeedbackMessage',
    });
    feedbackListener.subscribe((message: any) => {
      const dist = message.feedback?.distance_remaining;
      if (dist !== undefined) setDistanceRemaining(parseFloat(dist.toFixed(2)));
    });

    return () => {
      odomListener.unsubscribe();
      statusListener.unsubscribe();
      feedbackListener.unsubscribe();
      ros.close();
    };
  }, []);

  const sendGoal = () => {
    const x = parseFloat(goalX);
    const y = parseFloat(goalY);
    if (!goalPoseTopic.current || isNaN(x) || isNaN(y)) return;

    goalPoseTopic.current.publish({
      header: { frame_id: 'map', stamp: { sec: 0, nanosec: 0 } },
      pose: {
        position:    { x, y, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
    });
    setNavState('navigating');
    setDistanceRemaining(null);
  };

  const cancelGoal = () => {
    if (!cancelService.current) return;
    // Empty goal_id cancels all active goals
    const req = new ROSLIB.ServiceRequest({
      goal_info: { goal_id: { uuid: [] }, stamp: { sec: 0, nanosec: 0 } },
    });
    cancelService.current.callService(req, () => setNavState('idle'));
  };

  const stateColor: Record<NavState, string> = {
    idle:       '#888',
    navigating: '#0070f3',
    canceling:  'orange',
    succeeded:  'green',
    failed:     'red',
  };

  const canNavigate = connected && navState !== 'navigating' && navState !== 'canceling';
  const canCancel   = connected && (navState === 'navigating' || navState === 'canceling');

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>React ROS 2 Control Panel</h1>

      {/* Connection status */}
      <div style={{ marginBottom: '20px' }}>
        Status:
        <span style={{ color: connected ? 'green' : 'red', fontWeight: 'bold', marginLeft: '10px' }}>
          {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Live odometry */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Live Odometry</h3>
        <p>X: {position.x}</p>
        <p>Y: {position.y}</p>
      </div>

      {/* Navigation state */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Navigation</h3>
        <p>
          State:{' '}
          <span style={{ color: stateColor[navState], fontWeight: 'bold', textTransform: 'uppercase' }}>
            {navState}
          </span>
        </p>
        {distanceRemaining !== null && (
          <p>Distance remaining: {distanceRemaining} m</p>
        )}
      </div>

      {/* Send goal */}
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h3>Send Goal</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <label>
            X:&nbsp;
            <input
              type="number"
              value={goalX}
              onChange={e => setGoalX(e.target.value)}
              style={{ width: '80px' }}
            />
          </label>
          <label>
            Y:&nbsp;
            <input
              type="number"
              value={goalY}
              onChange={e => setGoalY(e.target.value)}
              style={{ width: '80px' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={sendGoal} disabled={!canNavigate}>Navigate</button>
          <button onClick={cancelGoal} disabled={!canCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default App;
