interface OptionsPanelProps {
  showTrail: boolean;
  onToggleTrail: () => void;
  onClearTrail: () => void;
}

export function OptionsPanel({ showTrail, onToggleTrail, onClearTrail }: OptionsPanelProps) {
  return (
    <div className="panel">
      <div className="panel-label">Options</div>
      <button
        className={`opt-btn ${showTrail ? 'active' : ''}`}
        onClick={onToggleTrail}
      >
        {showTrail ? '● Trail ON' : '○ Trail OFF'}
      </button>
      <button className="opt-btn" onClick={onClearTrail}>
        ✕ Clear Trail
      </button>
    </div>
  );
}