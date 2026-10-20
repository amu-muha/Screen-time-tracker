import React, { useEffect, useState } from 'react';
import { X, Clock, Layers, Calendar, BarChart2 } from 'lucide-react';
import SemicircularGauge from './SemicircularGauge';
import { formatDuration, cleanAppName, getCategoryColor, getCategoryGradient } from '../utils/formatters';
import { fetchTimelineEvents } from '../api/client';
import './AppDetailModal.css';

export default function AppDetailModal({
  app,
  totalActiveSeconds = 1,
  goalSeconds = 8 * 3600,
  deviceId,
  onClose
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!app || !deviceId) return;
    setLoading(true);
    fetchTimelineEvents(deviceId)
      .then(events => {
        const matching = events.filter(e => e.app_name === app.app_name);
        setSessions(matching);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [app, deviceId, onClose]);

  if (!app) return null;

  const appName = cleanAppName(app.app_name);
  const category = app.category || 'Uncategorized';
  const categoryColor = getCategoryColor(category);

  const percentOfActive = totalActiveSeconds > 0
    ? Math.min(100, Math.round((app.total_seconds / totalActiveSeconds) * 100))
    : 0;

  const sessionCount = app.session_count || (sessions.length > 0 ? sessions.length : 1);
  const avgSessionSec = Math.round(app.total_seconds / Math.max(1, sessionCount));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__identity">
            <div
              className="modal-icon"
              style={{ background: getCategoryGradient(category) }}
            >
              {appName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="modal-title">{appName}</h3>
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
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Top Summary Stat Grid */}
        <div className="modal-stats-grid">
          <div className="modal-stat-box">
            <div className="modal-stat-label">
              <Clock size={13} />
              <span>Total Active Time</span>
            </div>
            <div className="modal-stat-val modal-stat-val--primary">
              {formatDuration(app.total_seconds)}
            </div>
          </div>

          <div className="modal-stat-box">
            <div className="modal-stat-label">
              <Layers size={13} />
              <span>Sessions Recorded</span>
            </div>
            <div className="modal-stat-val">{sessionCount}</div>
          </div>

          <div className="modal-stat-box">
            <div className="modal-stat-label">
              <BarChart2 size={13} />
              <span>Avg Session</span>
            </div>
            <div className="modal-stat-val">{formatDuration(avgSessionSec)}</div>
          </div>
        </div>

        {/* Visual Gauge */}
        <div className="modal-gauge-block">
          <SemicircularGauge
            percentage={percentOfActive}
            size={160}
            strokeWidth={13}
            color={categoryColor}
            label="share of screen time"
          />
        </div>

        {/* Recent Sessions List */}
        <div className="modal-sessions">
          <h4 className="modal-sessions__title">Today's Sessions</h4>
          {loading ? (
            <p className="modal-sessions__empty">Loading session history...</p>
          ) : sessions.length === 0 ? (
            <p className="modal-sessions__empty">
              Recorded in aggregate: {formatDuration(app.total_seconds)} across {sessionCount} session(s).
            </p>
          ) : (
            <div className="modal-sessions__list">
              {sessions.map((s, idx) => {
                const start = new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const end = new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={s.id || idx} className="modal-session-row">
                    <div className="modal-session-time">
                      <span className="session-dot" style={{ background: categoryColor }} />
                      <span>{start} – {end}</span>
                    </div>
                    {s.window_title && (
                      <span className="modal-session-window" title={s.window_title}>
                        {s.window_title}
                      </span>
                    )}
                    <span className="modal-session-dur">{formatDuration(s.duration_seconds)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
