const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function fetchUsage(range, deviceId) {
  const res = await fetch(`${API_BASE}/usage?range=${range}&device_id=${deviceId}`);
  if (!res.ok) throw new Error(`usage fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchInsights(range, deviceId) {
  const res = await fetch(`${API_BASE}/insights?range=${range}&device_id=${deviceId}`);
  if (res.status === 204) return null; // pending state, not an error (FR-20, T-23)
  if (!res.ok) throw new Error(`insight fetch failed: ${res.status}`);
  return res.json();
}

export async function registerDevice(label) {
  const res = await fetch(`${API_BASE}/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label })
  });
  if (!res.ok) throw new Error('device registration failed');
  return res.json(); // { device, api_key }
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error('devices fetch failed');
  return res.json();
}

export async function fetchDevice(deviceId) {
  const res = await fetch(`${API_BASE}/devices/${deviceId}`);
  if (!res.ok) throw new Error('device fetch failed');
  return res.json();
}

export async function updateDevice(deviceId, updates) {
  const res = await fetch(`${API_BASE}/devices/${deviceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('device update failed');
  return res.json();
}

export async function fetchActiveEvent(deviceId) {
  const res = await fetch(`${API_BASE}/events/active?device_id=${deviceId}`);
  if (!res.ok) throw new Error('active event fetch failed');
  return res.json();
}

export async function fetchTimelineEvents(deviceId, date) {
  const url = date
    ? `${API_BASE}/events?device_id=${deviceId}&date=${date}`
    : `${API_BASE}/events?device_id=${deviceId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('timeline events fetch failed');
  return res.json();
}

export async function fetchUsageHistory(deviceId, days = 7) {
  const res = await fetch(`${API_BASE}/usage/history?device_id=${deviceId}&days=${days}`);
  if (!res.ok) throw new Error('usage history fetch failed');
  return res.json();
}