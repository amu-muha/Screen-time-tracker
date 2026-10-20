import React from 'react';
import { Calendar, Laptop, RefreshCw, Settings, Sparkles } from 'lucide-react';
import './TopHeader.css';

const RANGES = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: '7 Days' },
  { key: 'monthly', label: '30 Days' },
  { key: 'yearly', label: 'Year' }
];

export default function TopHeader({
  range = 'daily',
  onRangeChange,
  devices = [],
  activeDeviceId,
  onSelectDevice,
  onOpenSettings,
  isTracking = true,
  onManualRefresh,
  refreshing = false
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="top-header">
      {/* Left: Greeting and Date */}
      <div className="top-header__left">
        <h1 className="top-header__title">Dashboard</h1>
        <div className="top-header__date-badge">
          <Calendar size={13} />
          <span>{today}</span>
        </div>
      </div>

      {/* Right Controls: Device Picker, Range Selector, Refresh, Settings */}
      <div className="top-header__right">
        {/* Device Picker */}
        {devices.length > 0 && (
          <div className="device-picker">
            <Laptop size={14} className="device-picker__icon" />
            <select
              value={activeDeviceId}
              onChange={(e) => onSelectDevice && onSelectDevice(e.target.value)}
              className="device-picker__select"
              aria-label="Select active tracked device"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Range Tabs */}
        <div className="range-pills">
          {RANGES.map(r => (
            <button
              key={r.key}
              className={`range-pill ${r.key === range ? 'range-pill--active' : ''}`}
              onClick={() => onRangeChange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Manual Refresh Button */}
        <button
          className={`icon-btn ${refreshing ? 'icon-btn--spinning' : ''}`}
          onClick={onManualRefresh}
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw size={15} />
        </button>

        {/* Settings Button */}
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="Open Settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
