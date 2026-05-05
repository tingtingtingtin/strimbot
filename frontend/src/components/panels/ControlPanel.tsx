interface ControlPanelProps {
  onMove: (linear: number, angular: number) => void;
  onStop: () => void;
  connected: boolean;
}

interface BtnProps {
  label: string;
  linear: number;
  angular: number;
  onMove: (l: number, a: number) => void;
  onStop: () => void;
  disabled: boolean;
}

function CtrlBtn({ label, linear, angular, onMove, onStop, disabled }: BtnProps) {
  return (
    <button
      className="ctrl-btn"
      disabled={disabled}
      onMouseDown={() => onMove(linear, angular)}
      onMouseUp={onStop}
      onMouseLeave={onStop}
      onTouchStart={(e) => { e.preventDefault(); onMove(linear, angular); }}
      onTouchEnd={onStop}
    >
      {label}
    </button>
  );
}

export function ControlPanel({ onMove, onStop, connected }: ControlPanelProps) {
  const props = { onMove, onStop, disabled: !connected };

  return (
    <div className="panel">
      <div className="panel-label">Velocity Control</div>
      <div className="ctrl-grid">
        <span />
        <CtrlBtn label="▲" linear={0.5} angular={0} {...props} />
        <span />
        <CtrlBtn label="↺" linear={0} angular={0.5} {...props} />
        <button className="ctrl-btn stop-btn" onMouseDown={onStop} disabled={!connected}>■</button>
        <CtrlBtn label="↻" linear={0} angular={-0.5} {...props} />
        <span />
        <CtrlBtn label="▼" linear={-0.5} angular={0} {...props} />
        <span />
      </div>
    </div>
  );
}