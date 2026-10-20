import React from 'react';
import { Target, Bell, Play, Pause, Sparkles } from 'lucide-react';
import { formatDigitalTime, formatDuration } from '../utils/formatters';
import './ScreenTimeRing.css';

export default function ScreenTimeRing({
  totalSeconds = 0,
  goalSeconds = 8 * 3600,
  onOpenGoalModal,
  isTracking = true
}) {
  const percentage = goalSeconds > 0 ? Math.min(100, Math.round((totalSeconds / goalSeconds) * 100)) : 0;
  
  // Ring SVG calculations
  const size = 260;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const remainingSeconds = Math.max(0, goalSeconds - totalSeconds);
  const goalHours = Math.round(goalSeconds / 3600);

  return (
    <div className="panel ring-panel">
      <div className="ring-panel__header">
        <div>
          <span className="ring-panel__eyebrow">Overview</span>
          <h2 className="ring-panel__title">Total Screen Time</h2>
        </div>
        <button
          className="ring-panel__goal-badge"
          onClick={onOpenGoalModal}
          title="Click to edit daily screen time goal"
        >
          <Target size={14} />
          <span>Goal: {goalHours}h</span>
        </button>
      </div>

      <div className="ring-panel__visual">
        <svg
          width={size}
          height={size}
          className="ring-svg"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ring-gradient-start)" />
              <stop offset="50%" stopColor="var(--ring-gradient-middle)" />
              <stop offset="100%" stopColor="var(--ring-gradient-end)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
          />

          {/* Progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        {/* Center Content */}
        <div className="ring-center">
          <div className="ring-center__target">
            <Bell size={13} className="ring-center__icon" />
            <span>Target: {goalHours}:00</span>
          </div>

          <div className="ring-center__time">
            {formatDigitalTime(totalSeconds)}
          </div>

          <div className="ring-center__percent">
            {percentage}%
          </div>

          <div className="ring-center__status">
            {remainingSeconds > 0 ? (
              <span>{formatDuration(remainingSeconds)} left today</span>
            ) : (
              <span className="ring-center__completed">Goal reached!</span>
            )}
          </div>
        </div>
      </div>

      <div className="ring-panel__actions">
        <button className="ring-btn ring-btn--secondary" onClick={onOpenGoalModal}>
          <Target size={15} />
          Set Goal
        </button>

        <div className={`tracking-pill ${isTracking ? 'tracking-pill--active' : 'tracking-pill--paused'}`}>
          <span className="tracking-dot" />
          <span>{isTracking ? 'Active' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
}
