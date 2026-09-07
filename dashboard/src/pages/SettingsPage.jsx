import { useEffect, useState } from 'react';
import { fetchDevice, updateDevice } from '../api/client';

export default function SettingsPage({ deviceId, onBack }) {
  const [device, setDevice] = useState(null);
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

      <button
        onClick={handleSave}
        style={{
          background: saved ? 'var(--cat-productivity)' : 'var(--ink)', color: '#fff',
          border: 'none', padding: '10px 18px', borderRadius: 10,
          fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 12
        }}
      >
        {saved ? 'Saved' : 'Save changes'}
      </button>
    </div>
  );
}