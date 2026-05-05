import type { RobotState } from '../../types/ros';

interface TelemetryPanelProps {
  robotState: RobotState;
  connected: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="telem-row">
      <span className="telem-key">{label}</span>
      <span className="telem-val">{value}</span>
    </div>
  );
}

export function TelemetryPanel({ robotState, connected }: TelemetryPanelProps) {
  const { position, theta, linearVel, angularVel } = robotState;
  const thetaDeg = ((theta * 180) / Math.PI).toFixed(1);

  return (
    <div className="panel">
      <div className="panel-label">Odometry</div>
      <div
        className="status-badge"
        style={{ color: connected ? '#00ff88' : '#ff4a4a' }}
      >
        {connected ? '● CONNECTED' : '○ OFFLINE'}
      </div>
      <Row label="X" value={`${position.x.toFixed(3)} m`} />
      <Row label="Y" value={`${position.y.toFixed(3)} m`} />
      <Row label="θ" value={`${thetaDeg}°`} />
      <Row label="v_lin" value={`${linearVel.toFixed(2)} m/s`} />
      <Row label="v_ang" value={`${angularVel.toFixed(2)} r/s`} />
    </div>
  );
}