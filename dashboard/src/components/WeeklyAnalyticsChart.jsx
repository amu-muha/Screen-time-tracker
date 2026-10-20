import React, { useState, useEffect } from 'react';
import { BarChart3, ChevronRight, Info } from 'lucide-react';
import { fetchUsageHistory } from '../api/client';
import { formatDuration, formatDigitalTime, getCategoryColor } from '../utils/formatters';
import './WeeklyAnalyticsChart.css';

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyAnalyticsChart({ deviceId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    fetchUsageHistory(deviceId, 7)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [deviceId]);

  // Aggregate by day of week (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Day of week index (Monday = 0, Sunday = 6)
    const dayOfWeek = (d.getDay() + 6) % 7;
    last7Days.push({
      dateStr,
      label: DAYS_SHORT[dayOfWeek],
      fullDay: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      categories: {}
    });
  }

  let grandTotalSeconds = 0;
  const categoryTotals = {};

  // Populate data from API
  history.forEach(row => {
    grandTotalSeconds += row.total_seconds;
    categoryTotals[row.category] = (categoryTotals[row.category] || 0) + row.total_seconds;

    const dayObj = last7Days.find(d => d.dateStr === row.usage_date);
    if (dayObj) {
      dayObj.categories[row.category] = (dayObj.categories[row.category] || 0) + row.total_seconds;
    }
  });

  // Find top category
  let topCategory = 'Development';
  let topCategorySec = 0;
  Object.entries(categoryTotals).forEach(([cat, sec]) => {
    if (sec > topCategorySec) {
      topCategorySec = sec;
      topCategory = cat;
    }
  });

  // Find max daily hours to scale bars (min 6h for clean proportions)
  const maxSeconds = Math.max(
    6 * 3600,
    ...last7Days.map(d => Object.values(d.categories).reduce((sum, v) => sum + v, 0))
  );

  return (
    <div className="panel analytics-panel">
      <div className="analytics-panel__header">
        <div>
          <span className="analytics-panel__eyebrow">7-Day Activity</span>
          <div className="analytics-panel__total-time">
            {formatDigitalTime(grandTotalSeconds)}
          </div>
        </div>

        {topCategorySec > 0 && (
          <div className="analytics-panel__top-badge">
            <span
              className="top-dot"
              style={{ background: getCategoryColor(topCategory) }}
            />
            <span className="top-name">{topCategory}</span>
            <span className="top-duration">{formatDuration(topCategorySec)}</span>
          </div>
        )}
      </div>

      {/* Stacked Horizontal Bars by Day */}
      <div className="analytics-bars">
        {last7Days.map((day, idx) => {
          const dayTotal = Object.values(day.categories).reduce((s, v) => s + v, 0);

          return (
            <div
              key={day.dateStr}
              className="analytics-bar-row"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className="analytics-day-label">{day.label}</span>
              <div className="analytics-bar-track">
                {Object.entries(day.categories).map(([cat, sec]) => {
                  const widthPct = (sec / maxSeconds) * 100;
                  return (
                    <div
                      key={cat}
                      className="analytics-bar-segment"
                      style={{
                        width: `${widthPct}%`,
                        background: getCategoryColor(cat)
                      }}
                      title={`${cat}: ${formatDuration(sec)}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Scale */}
      <div className="analytics-scale">
        <span>0h</span>
        <span>{Math.round((maxSeconds / 3600) * 0.25)}h</span>
        <span>{Math.round((maxSeconds / 3600) * 0.5)}h</span>
        <span>{Math.round((maxSeconds / 3600) * 0.75)}h</span>
        <span>{Math.round(maxSeconds / 3600)}h</span>
      </div>

      {/* Tooltip on Hover */}
      {hoveredDay && (
        <div className="analytics-hover-card">
          <div className="analytics-hover-title">{hoveredDay.fullDay}</div>
          {Object.keys(hoveredDay.categories).length === 0 ? (
            <div className="analytics-hover-empty">No usage recorded</div>
          ) : (
            Object.entries(hoveredDay.categories).map(([cat, sec]) => (
              <div key={cat} className="analytics-hover-row">
                <span className="analytics-hover-cat">
                  <span className="cat-bullet" style={{ background: getCategoryColor(cat) }} />
                  {cat}
                </span>
                <span className="analytics-hover-dur">{formatDuration(sec)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
