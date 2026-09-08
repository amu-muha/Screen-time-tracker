import './InsightPanel.css';

export default function InsightPanel({ insight, loading }) {
  return (
    <div className="insight-panel">
      <div className="insight-panel__label">Summary</div>
      {loading ? (
        <p className="insight-panel__text">Loading...</p>
      ) : insight ? (
        <p className="insight-panel__text">{insight.summary_text}</p>
      ) : (
        <p className="insight-panel__pending">
          This period isn't finished yet — a summary will appear once it wraps up.
        </p>
      )}
    </div>
  );
}