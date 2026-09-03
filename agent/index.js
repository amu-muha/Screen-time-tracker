import { getFocusedWindow } from './src/window-detector/index.js';

const TEST_DEVICE_ID = '11111111-1111-1111-1111-111111111111';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5000; // FR-2 default

let currentEvent = null; // { app_name, window_title, start_time }

async function sendEvent(event, endTime) {
  const payload = {
    device_id: TEST_DEVICE_ID,
    app_name: event.app_name,
    window_title: event.window_title,
    start_time: event.start_time,
    end_time: endTime
  };

  try {
    const res = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Synced:', res.status, event.app_name);
  } catch (err) {
    console.error('Failed to sync event (will be handled by buffer in Slice 6):', err.message);
  }
}

async function poll() {
  let focused;
  try {
    focused = await getFocusedWindow();
  } catch (err) {
    console.error('[health-monitor]', err.message); // FR-6b
    return;
  }

  const now = new Date().toISOString();

  if (!currentEvent) {
    currentEvent = { ...focused, start_time: now };
    return;
  }

  const changed = currentEvent.app_name !== focused.app_name;

  if (changed) {
    await sendEvent(currentEvent, now);
    currentEvent = { ...focused, start_time: now };
  }
}

console.log(`Polling every ${POLL_INTERVAL_MS}ms`);
setInterval(poll, POLL_INTERVAL_MS);