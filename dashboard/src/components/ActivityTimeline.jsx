import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { formatDuration, cleanAppName, getCategoryColor } from '../utils/formatters';
import { fetchTimelineEvents } from '../api/client';
import './ActivityTimeline.css';

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default function ActivityTimeline({ deviceId, onSelectSession }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    fetchTimelineEvents(deviceId, selectedDate)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [deviceId, selectedDate]);

  // Current time position indicator
  const now = new Date();
  const isToday = selectedDate === now.toISOString().slice(0, 10);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startDayMinutes = 8 * 60; // 08:00
  const endDayMinutes = 22 * 60; // 22:00
  const timelineHeight = 560; // px
  const currentLineTop = Math.max(0, Math.min(timelineHeight,
    ((currentMinutes - startDayMinutes) / (endDayMinutes - startDayMinutes)) * timelineHeight
  ));

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const formattedDateHeader = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="panel timeline-panel">
      <div className="timeline-panel__header">
        <div>
          <span className="timeline-panel__eyebrow">Continuous Log</span>
          <h3 className="timeline-panel__title">Activity Timeline</h3>
        </div>

        <div className="date-nav">
          <button className="date-nav__btn" onClick={() => changeDate(-1)} aria-label="Previous day">
            <ChevronLeft size={16} />
          </button>
          <span className="date-nav__label">{formattedDateHeader}</span>
          <button
            className="date-nav__btn"
            onClick={() => changeDate(1)}
            disabled={isToday}
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="timeline-scroll">
        <div className="timeline-grid" style={{ minHeight: timelineHeight }}>
          {/* Current Time Line */}
          {isToday && currentMinutes >= startDayMinutes && currentMinutes <= endDayMinutes && (
            <div className="timeline-current-line" style={{ top: `${currentLineTop}px` }}>
              <span className="timeline-current-dot" />
              <span className="timeline-current-label">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Time markers */}
          <div className="timeline-hours">
            {HOURS.map(hour => (
              <div key={hour} className="timeline-hour-slot">
                <span className="timeline-hour-text">{hour}</span>
                <div className="timeline-hour-line" />
              </div>
            ))}
          </div>

          {/* Session Cards Column */}
          <div className="timeline-sessions">
            {loading ? (
              <div className="timeline-empty">Loading timeline events...</div>
            ) : events.length === 0 ? (
              <div className="timeline-empty">
                No activity recorded for {formattedDateHeader}.
              </div>
            ) : (
              events.map((ev, i) => {
                const start = new Date(ev.start_time);
                const end = new Date(ev.end_time);
                const startMin = start.getHours() * 60 + start.getMinutes();
                const durationMin = Math.max(5, (end - start) / 60000);

                // Calculate top offset
                const topPct = Math.max(0, ((startMin - startDayMinutes) / (endDayMinutes - startDayMinutes)) * 100);
                const heightPx = Math.max(48, Math.min(140, durationMin * 1.5));
                const categoryColor = getCategoryColor(ev.category);
                const appName = cleanAppName(ev.app_name);

                return (
                  <div
                    key={ev.id || i}
                    className="timeline-card"
                    style={{
                      borderLeftColor: categoryColor,
                      marginTop: i === 0 ? '12px' : '8px'
                    }}
                    onClick={() => onSelectSession && onSelectSession(ev)}
                  >
                    <div className="timeline-card__top">
                      <span className="timeline-card__name">{appName}</span>
                      <span className="timeline-card__duration">
                        {formatDuration(ev.duration_seconds || durationMin * 60)}
                      </span>
                    </div>

                    {ev.window_title && (
                      <p className="timeline-card__title" title={ev.window_title}>
                        {ev.window_title}
                      </p>
                    )}

                    <div className="timeline-card__meta">
                      <span className="timeline-card__time">
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className="timeline-card__category"
                        style={{ color: categoryColor, background: `${categoryColor}15` }}
                      >
                        {ev.category || 'App'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
