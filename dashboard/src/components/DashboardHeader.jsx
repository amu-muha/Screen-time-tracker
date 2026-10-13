import './DashboardHeader.css';

const RANGES = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' }
];

export default function DashboardHeader({ range, onRangeChange, onOpenSettings }) {
  return (
    <div className="header">
      <h1 className="header__title">Screen Time</h1>
      <div className="header__controls">
        <div className="tabs">
          {RANGES.map(r => (
            <button
              key={r.key}
              className={`tabs__tab ${r.key === range ? 'tabs__tab--active' : ''}`}
              onClick={() => onRangeChange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button className="header__settings" onClick={onOpenSettings} aria-label="Settings">
          ⚙
        </button>
      </div>
    </div>
  );
}