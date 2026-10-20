import React from 'react';
import { Clock, LayoutGrid, Activity, Trophy, Target } from 'lucide-react';
import { formatDuration, cleanAppName } from '../utils/formatters';
import './SummaryCards.css';

export default function SummaryCards({
  usage = [],
  activeEvent = null,
  goalSeconds = 8 * 3600
}) {
  const totalSeconds = usage.reduce((sum, row) => sum + row.total_seconds, 0);
  const appCount = usage.length;

  // Top app by duration
  const sortedUsage = [...usage].sort((a, b) => b.total_seconds - a.total_seconds);
  const topApp = sortedUsage[0];
  const topAppShare = totalSeconds > 0 && topApp ? Math.round((topApp.total_seconds / totalSeconds) * 100) : 0;

  // Active app duration & name
  const activeName = activeEvent?.app_name ? cleanAppName(activeEvent.app_name) : 'Idle / Inactive';
  const isCurrentlyTracking = Boolean(activeEvent?.is_active);

  // Goal progress
  const goalPercent = goalSeconds > 0 ? Math.min(100, Math.round((totalSeconds / goalSeconds) * 100)) : 0;

  return (
    <div className="summary-cards-row">
      {/* 1. Total Screen Time */}
      <div className="summary-metric-card">
        <div className="summary-metric-card__header">
          <span className="summary-metric-card__label">Active Screen Time</span>
          <div className="summary-metric-card__icon summary-metric-card__icon--blue">
            <Clock size={16} />
          </div>
        </div>
        <div className="summary-metric-card__value">
          {totalSeconds > 0 ? formatDuration(totalSeconds) : '0m'}
        </div>
        <div className="summary-metric-card__subtext">
          <span>{goalPercent}% of daily goal</span>
        </div>
      </div>

      {/* 2. Apps Tracked */}
      <div className="summary-metric-card">
        <div className="summary-metric-card__header">
          <span className="summary-metric-card__label">Applications Used</span>
          <div className="summary-metric-card__icon summary-metric-card__icon--purple">
            <LayoutGrid size={16} />
          </div>
        </div>
        <div className="summary-metric-card__value">
          {appCount} {appCount === 1 ? 'App' : 'Apps'}
        </div>
        <div className="summary-metric-card__subtext">
          <span>Logged today</span>
        </div>
      </div>

      {/* 3. Current Focus */}
      <div className="summary-metric-card">
        <div className="summary-metric-card__header">
          <span className="summary-metric-card__label">Current Focus</span>
          <div className="summary-metric-card__icon summary-metric-card__icon--emerald">
            <Activity size={16} />
          </div>
        </div>
        <div className="summary-metric-card__value summary-metric-card__value--ellipsis" title={activeName}>
          {isCurrentlyTracking && <span className="pulse-dot" />}
          {activeName}
        </div>
        <div className="summary-metric-card__subtext">
          <span>{isCurrentlyTracking ? 'Foreground session active' : 'Waiting for activity'}</span>
        </div>
      </div>

      {/* 4. Top Time Consumer */}
      <div className="summary-metric-card">
        <div className="summary-metric-card__header">
          <span className="summary-metric-card__label">Top Application</span>
          <div className="summary-metric-card__icon summary-metric-card__icon--amber">
            <Trophy size={16} />
          </div>
        </div>
        <div className="summary-metric-card__value summary-metric-card__value--ellipsis" title={topApp ? cleanAppName(topApp.app_name) : 'None'}>
          {topApp ? cleanAppName(topApp.app_name) : '—'}
        </div>
        <div className="summary-metric-card__subtext">
          <span>{topApp ? `${formatDuration(topApp.total_seconds)} (${topAppShare}%)` : 'No activity yet'}</span>
        </div>
      </div>
    </div>
  );
}