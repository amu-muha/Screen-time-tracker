import React from 'react';
import { ArrowUpRight, Clock, Layers } from 'lucide-react';
import SemicircularGauge from './SemicircularGauge';
import { formatDuration, cleanAppName, getCategoryColor, getCategoryGradient } from '../utils/formatters';
import './AppUsageCard.css';

export default function AppUsageCard({
  app,
  totalActiveSeconds = 1,
  goalSeconds = 8 * 3600,
  isActive = false,
  rank = 1,
  onSelect
}) {
  const appName = cleanAppName(app.app_name);
  const category = app.category || 'Uncategorized';
  const categoryColor = getCategoryColor(category);

  // Percentage of today's total active screen time
  const percentOfActive = totalActiveSeconds > 0
    ? Math.min(100, Math.round((app.total_seconds / totalActiveSeconds) * 100))
    : 0;

  // Percentage relative to daily goal (e.g. 8 hours)
  const percentOfGoal = goalSeconds > 0
    ? Math.min(100, Math.round((app.total_seconds / goalSeconds) * 100))
    : 0;

  const sessions = app.session_count || 1;

  return (
    <div
      className={`app-card ${isActive ? 'app-card--active' : ''}`}
      onClick={() => onSelect && onSelect(app)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect && onSelect(app); }}
    >
      {/* Top Bar with Icon & Status */}
      <div className="app-card__header">
        <div className="app-card__identity">
          <div
            className="app-card__icon"
            style={{ background: getCategoryGradient(category) }}
          >
            {appName.charAt(0).toUpperCase()}
          </div>
          <div className="app-card__titles">
            <h4 className="app-card__name" title={appName}>{appName}</h4>
            <span
              className="app-card__category"
              style={{ color: categoryColor }}
            >
              {category}
            </span>
          </div>
        </div>

        <div className="app-card__badges">
          {isActive && (
            <span className="app-card__live-pill">
              <span className="live-dot" />
              Active
            </span>
          )}
          <span className="app-card__rank">#{rank}</span>
        </div>
      </div>

      {/* Main Duration Display */}
      <div className="app-card__duration-block">
        <div className="app-card__duration-value">
          {formatDuration(app.total_seconds)}
        </div>
        <div className="app-card__duration-label">Active Time</div>
      </div>

      {/* Semicircular Gauge (Core Design Requirement) */}
      <div className="app-card__gauge-wrap">
        <SemicircularGauge
          percentage={percentOfActive}
          size={140}
          strokeWidth={11}
          color={categoryColor}
          label="of screen time"
        />
      </div>

      {/* Footer Metrics & Action */}
      <div className="app-card__footer">
        <div className="app-card__meta">
          <span className="app-card__meta-item" title="Session count">
            <Layers size={13} />
            {sessions} {sessions === 1 ? 'session' : 'sessions'}
          </span>
          <span className="app-card__meta-item" title="Share of daily goal">
            <Clock size={13} />
            {percentOfGoal}% of goal
          </span>
        </div>

        <button className="app-card__view-btn" aria-label={`View details for ${appName}`}>
          <span>Details</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
