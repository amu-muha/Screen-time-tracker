import React, { useState, useEffect } from 'react';
import { Radio, Clock, Calendar, BarChart3, ChevronRight, Activity, Laptop } from 'lucide-react';
import { formatDuration, cleanAppName, getCategoryColor, getCategoryGradient } from '../utils/formatters';
import './ActiveAppPanel.css';

export default function ActiveAppPanel({
  activeEvent,
  todayTotalSeconds = 0,
  appUsageList = [],
  onViewDetails
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer counting up for the active session
  useEffect(() => {
    if (!activeEvent || !activeEvent.start_time) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeEvent.start_time).getTime();
    const update = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startMs) / 1000)));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="panel active-panel active-panel--idle">
        <div className="active-panel__header">
          <span className="active-panel__eyebrow">Real-Time State</span>
          <span className="status-badge status-badge--idle">
            <span className="status-badge__dot" />
            Idle / Locked
          </span>
        </div>
        <div className="active-panel__empty">
          <Laptop size={32} className="active-panel__empty-icon" />
          <p className="active-panel__empty-text">No active foreground window detected</p>
          <span className="active-panel__empty-sub">Computer may be locked or screensaver active</span>
        </div>
      </div>
    );
  }

  const appName = cleanAppName(activeEvent.app_name);
  const category = activeEvent.category || 'Uncategorized';
  const categoryColor = getCategoryColor(category);

  // Find app total for today
  const matchingApp = appUsageList.find(a => a.app_name === activeEvent.app_name);
  const appTotalSeconds = matchingApp ? matchingApp.total_seconds : elapsedSeconds;
  const shareOfToday = todayTotalSeconds > 0
    ? Math.min(100, Math.round((appTotalSeconds / todayTotalSeconds) * 100))
    : 0;

  const sessionStartTimeStr = activeEvent.start_time
    ? new Date(activeEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const isActive = activeEvent.is_active !== false;

  return (
    <div className="panel active-panel">
      <div className="active-panel__header">
        <div>
          <span className="active-panel__eyebrow">Foreground Activity</span>
          <h3 className="active-panel__title">Currently Active</h3>
        </div>
        <div className={`status-badge ${isActive ? 'status-badge--live' : 'status-badge--idle'}`}>
          <span className="status-badge__dot" />
          {isActive ? 'Active Now' : 'Idle / Inactive'}
        </div>
      </div>

      <div className="active-panel__main">
        <div
          className="active-panel__icon-box"
          style={{ background: getCategoryGradient(category) }}
        >
          {appName.charAt(0).toUpperCase()}
        </div>

        <div className="active-panel__info">
          <div className="active-panel__app-title">
            <h4>{appName}</h4>
            <span
              className="category-pill"
              style={{
                background: `${categoryColor}18`,
                color: categoryColor,
                borderColor: `${categoryColor}30`
              }}
            >
              {category}
            </span>
          </div>

          {activeEvent.window_title && (
            <p className="active-panel__window-title" title={activeEvent.window_title}>
              {activeEvent.window_title}
            </p>
          )}
        </div>
      </div>

      <div className="active-panel__metrics">
        <div className="metric-box">
          <div className="metric-box__label">
            <Clock size={12} />
            <span>Current Session</span>
          </div>
          <div className="metric-box__value metric-box__value--accent">
            {formatDuration(elapsedSeconds)}
          </div>
          <span className="metric-box__sub">Started at {sessionStartTimeStr}</span>
        </div>

        <div className="metric-box">
          <div className="metric-box__label">
            <Calendar size={12} />
            <span>Today's Total</span>
          </div>
          <div className="metric-box__value">
            {formatDuration(appTotalSeconds)}
          </div>
          <span className="metric-box__sub">{shareOfToday}% of daily screen time</span>
        </div>
      </div>

      {onViewDetails && (
        <button
          className="active-panel__details-btn"
          onClick={() => onViewDetails(activeEvent.app_name)}
        >
          <span>View Application Details</span>
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}
