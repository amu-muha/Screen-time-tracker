import React from 'react';
import { Sparkles, TrendingUp, Compass, Award, Lightbulb } from 'lucide-react';
import { formatDuration, cleanAppName, getCategoryColor } from '../utils/formatters';
import './InsightPanel.css';

export default function InsightPanel({ insight, usage = [], loading = false, goalSeconds = 8 * 3600 }) {
  const totalSeconds = usage.reduce((acc, u) => acc + u.total_seconds, 0);
  const sorted = [...usage].sort((a, b) => b.total_seconds - a.total_seconds);
  const topApp = sorted[0];

  // Category breakdown
  const catTotals = {};
  usage.forEach(u => {
    const cat = u.category || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + u.total_seconds;
  });

  const topCategoryEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="panel insights-card">
      <div className="insights-card__header">
        <div className="insights-card__badge">
          <Sparkles size={14} />
          <span>Productivity & Usage Insights</span>
        </div>
      </div>

      {/* Primary AI or Computed Summary */}
      <div className="insights-card__main">
        {loading ? (
          <p className="insights-card__loading">Calculating usage insights...</p>
        ) : insight?.summary_text ? (
          <div className="insights-card__ai-summary">
            <p className="ai-summary-text">{insight.summary_text}</p>
          </div>
        ) : topApp ? (
          <div className="insights-card__computed-summary">
            <p className="computed-summary-lead">
              Your primary focus today has been <strong>{cleanAppName(topApp.app_name)}</strong>, accounting for{' '}
              {totalSeconds > 0 ? Math.round((topApp.total_seconds / totalSeconds) * 100) : 0}% of your total screen time ({formatDuration(topApp.total_seconds)}).
            </p>
          </div>
        ) : (
          <div className="insights-card__empty">
            <Lightbulb size={20} className="insights-empty-icon" />
            <p>Once more activity is recorded today, detailed usage patterns and summaries will appear here.</p>
          </div>
        )}
      </div>

      {/* Grounded Factual Highlights */}
      {usage.length > 0 && (
        <div className="insights-highlights">
          {topCategoryEntry && (
            <div className="insight-pill">
              <span className="insight-pill__dot" style={{ background: getCategoryColor(topCategoryEntry[0]) }} />
              <span className="insight-pill__text">
                Top Category: <strong>{topCategoryEntry[0]}</strong> ({formatDuration(topCategoryEntry[1])})
              </span>
            </div>
          )}

          <div className="insight-pill">
            <Compass size={13} className="insight-pill__icon" />
            <span className="insight-pill__text">
              Context switches: <strong>{usage.reduce((s, u) => s + (u.session_count || 1), 0)} sessions</strong> across {usage.length} apps
            </span>
          </div>

          {goalSeconds > 0 && (
            <div className="insight-pill">
              <Award size={13} className="insight-pill__icon" />
              <span className="insight-pill__text">
                {totalSeconds >= goalSeconds
                  ? 'Daily screen time goal reached'
                  : `${formatDuration(goalSeconds - totalSeconds)} remaining until daily goal`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}