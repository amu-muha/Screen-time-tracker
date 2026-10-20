import { useEffect, useState } from 'react';
import { fetchDevices } from '../api/client';
import './DashboardHeader.css';

const RANGES = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' }
];

export default function DashboardHeader({ range, onRangeChange, deviceId, onSelectDevice, onOpenSettings }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchDevices().then(setDevices).catch(() => {});
  }, [deviceId]);

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 className="header__title">Screen Time</h1>
        {devices.length > 0 && (
          <select
            value={deviceId}
            onChange={e => onSelectDevice && onSelectDevice(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 13,
              fontWeight: 600,
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--ink)'
            }}
            aria-label="Select device"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="header__controls">
        <div className="tabs">
          {RANGES.map(r => (
            <button
              key={r.key}
              className={`tabs__tab ${r.key === range ? 'tabs__tab--active' : ''}`}
              onClick={() => onRangeChange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button className="header__settings" onClick={onOpenSettings} aria-label="Settings">
          ⚙
        </button>
      </div>
    </div>
  );
}