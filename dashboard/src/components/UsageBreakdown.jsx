import './UsageBreakdown.css';

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

const CATEGORY_VAR = {
  Development: '--cat-development',
  Communication: '--cat-communication',
  Browsing: '--cat-browsing',
  System: '--cat-system',
  Entertainment: '--cat-entertainment',
  Productivity: '--cat-productivity'
};

function categoryColor(category) {
  return `var(${CATEGORY_VAR[category] || '--cat-other'})`;
}

export default function UsageBreakdown({ usage }) {
  if (usage.length === 0) {
    return (
      <div className="breakdown">
        <div className="breakdown__heading">Breakdown</div>
        <p className="breakdown__empty">Nothing tracked for this period yet.</p>
      </div>
    );
  }

  const max = usage[0].total_seconds;

  return (
    <div className="breakdown">
      <div className="breakdown__heading">Breakdown</div>
      <div className="breakdown__list">
        {usage.map(row => (
          <div key={row.app_name} className="breakdown__row">
            <div className="breakdown__row-top">
              <span className="breakdown__app-name">{row.app_name}</span>
              <span className="breakdown__duration">{formatDuration(row.total_seconds)}</span>
            </div>
            <div className="breakdown__track">
              <div
                className="breakdown__fill"
                style={{
                  width: `${Math.max(6, (row.total_seconds / max) * 100)}%`,
                  background: categoryColor(row.category)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}