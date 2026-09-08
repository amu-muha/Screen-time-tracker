import './SummaryCards.css';

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function SummaryCards({ usage }) {
  const totalSeconds = usage.reduce((sum, row) => sum + row.total_seconds, 0);
  const topApp = usage[0];

  return (
    <div className="summary-row">
      <div className="summary-card">
        <div className="summary-card__label">Total time</div>
        <div className="summary-card__value">{usage.length ? formatDuration(totalSeconds) : '—'}</div>
      </div>
      <div className="summary-card">
        <div className="summary-card__label">Most used</div>
        <div className="summary-card__value">{topApp ? topApp.app_name : '—'}</div>
      </div>
      <div className="summary-card">
        <div className="summary-card__label">Apps tracked</div>
        <div className="summary-card__value">{usage.length}</div>
      </div>
    </div>
  );
}