import { useState } from 'react';
import './index.css';
import { useRos } from './hooks/useRos';
import { useOdometry } from './hooks/useOdometry';
import { useCmdVel } from './hooks/useCmdVel';
import { useLidar } from './hooks/useLidar';
import { Scene } from './components/scene/Scene';
import { TelemetryPanel } from './components/panels/TelemetryPanel';
import { ControlPanel } from './components/panels/ControlPanel';
import { OptionsPanel } from './components/panels/OptionsPanel';

export default function App() {
  const { ros, connected } = useRos();
  const { robotState, robotStateRef, trail, clearTrail } = useOdometry(ros);
  const { publish, stop } = useCmdVel(ros);
  const { points: lidarPoints } = useLidar(ros, robotStateRef);
  const [showTrail, setShowTrail] = useState(true);

  const handleToggleTrail = () => {
    if (showTrail) clearTrail();
    setShowTrail((v) => !v);
  };

  return (
    <div id="root">
      <header className="header">
        <span className="header-title">ROS2 · Turtlebot3 Visualizer</span>
        <span className="header-sub">ws://localhost:9090</span>
      </header>
      <div className="layout">
        <div className="canvas-wrap">
          <Scene
            robotState={robotState}
            trail={trail}
            showTrail={showTrail}
            lidarPoints={lidarPoints}
          />
        </div>
        <aside className="sidebar">
          <TelemetryPanel robotState={robotState} connected={connected} />
          <ControlPanel onMove={publish} onStop={stop} connected={connected} />
          <OptionsPanel
            showTrail={showTrail}
            onToggleTrail={handleToggleTrail}
            onClearTrail={clearTrail}
          />
        </aside>
      </div>
    </div>
  );
}