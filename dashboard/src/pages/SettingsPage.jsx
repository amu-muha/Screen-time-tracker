import { useEffect, useState } from 'react';
import { fetchDevice, fetchDevices, updateDevice } from '../api/client';

export default function SettingsPage({ deviceId, onSelectDevice, onRegisterNew, onBack }) {
  const [device, setDevice] = useState(null);
  const [allDevices, setAllDevices] = useState([]);
  const [label, setLabel] = useState('');
  const [captureTitles, setCaptureTitles] = useState(true);
  const [saved, setSaved] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    fetchDevice(deviceId).then(d => {
      setDevice(d);
      setLabel(d.label);
      setCaptureTitles(d.capture_titles);
    });
    fetchDevices().then(list => setAllDevices(list)).catch(() => {});
  }, [deviceId]);

  async function handleSave() {
    const updated = await updateDevice(deviceId, { label, capture_titles: captureTitles });
    setDevice(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!device) return null;

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Settings</h1>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--ink-soft)',
          fontSize: 14, cursor: 'pointer', fontWeight: 600
        }}>
          Back
        </button>
      </div>

      {allDevices.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
            Active device
          </label>
          <select
            value={deviceId}
            onChange={e => onSelectDevice && onSelectDevice(e.target.value)}
            style={{
              display: 'block', width: '100%', marginTop: 6,
              padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)',
              fontSize: 14, fontFamily: 'inherit', background: '#fff'
            }}
          >
            {allDevices.map(d => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.id.slice(0, 8)}...)
              </option>
            ))}
          </select>
        </div>
      )}

      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>Device label</label>
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        style={{
          display: 'block', width: '100%', marginTop: 6, marginBottom: 20,
          padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)',
          fontSize: 14, fontFamily: 'inherit'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Capture window titles</div>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
            Controls whether window titles are sent alongside app names.
          </div>
        </div>
        <input
          type="checkbox"
          checked={captureTitles}
          onChange={e => setCaptureTitles(e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.6, marginBottom: 20 }}>
        Raw usage events are kept for 90 days, then automatically removed.
        Aggregated totals and summaries are kept indefinitely.
      </p>

      <button
        onClick={() => setAdvancedOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none', color: 'var(--ink-soft)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 12
        }}
      >
        {advancedOpen ? '▾' : '▸'} Advanced
      </button>
      {advancedOpen && (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.6 }}>
          Sync interval is configured on the agent itself via
          <code> SYNC_INTERVAL_MS</code> in its <code>.env</code> file — most people
          shouldn't need to change this.
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={handleSave}
          style={{
            background: saved ? 'var(--cat-productivity)' : 'var(--ink)', color: '#fff',
            border: 'none', padding: '10px 18px', borderRadius: 10,
            fontWeight: 600, fontSize: 14, cursor: 'pointer'
          }}
        >
          {saved ? 'Saved' : 'Save changes'}
        </button>

        {onRegisterNew && (
          <button
            onClick={onRegisterNew}
            style={{
              background: 'transparent', color: 'var(--ink-soft)',
              border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 10,
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            + Register new device
          </button>
        )}
      </div>
    </div>
  );
}