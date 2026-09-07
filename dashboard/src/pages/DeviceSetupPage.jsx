import { useState } from 'react';
import { registerDevice } from '../api/client';

export default function DeviceSetupPage({ onRegistered }) {
  const [label, setLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await registerDevice(label || 'My device');
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result.api_key);
    setCopied(true);
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 0 }}>Set up your device</h1>

      {!result ? (
        <>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
            The tracking agent runs quietly in the background on this PC. On Linux with
            a Wayland session, it needs the "Focused Window D-Bus" GNOME Shell extension
            installed and enabled to detect the active window.
          </p>
          <form onSubmit={handleRegister}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
              Device label
            </label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. My laptop"
              style={{
                display: 'block', width: '100%', marginTop: 6, marginBottom: 16,
                padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)',
                fontSize: 14, fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--ink)', color: '#fff', border: 'none',
                padding: '10px 18px', borderRadius: 10, fontWeight: 600,
                fontSize: 14, cursor: 'pointer'
              }}
            >
              Register this device
            </button>
          </form>
          {error && <p style={{ color: '#B91C1C', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
            Device registered. Copy this API key now — it won't be shown again.
          </p>
          <div style={{
            background: 'var(--border)', borderRadius: 10, padding: '12px 14px',
            fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', marginBottom: 12
          }}>
            {result.api_key}
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--cat-productivity)' : 'var(--ink)', color: '#fff',
              border: 'none', padding: '10px 18px', borderRadius: 10,
              fontWeight: 600, fontSize: 14, cursor: 'pointer', marginRight: 8
            }}
          >
            {copied ? 'Copied' : 'Copy key'}
          </button>
          <button
            onClick={() => onRegistered(result.device.id)}
            style={{
              background: 'transparent', color: 'var(--ink-soft)',
              border: '1px solid var(--border)', padding: '10px 18px',
              borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer'
            }}
          >
            Continue to dashboard
          </button>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 16 }}>
            Paste this key as <code>API_KEY</code> in the agent's <code>.env</code> file, then
            start the agent to begin tracking.
          </p>
        </>
      )}
    </div>
  );
}