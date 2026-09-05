import 'dotenv/config';
import { getFocusedWindow } from './src/window-detector/index.js';
import { bufferEvent } from './src/local-buffer.js';
import { syncPendingEvents } from './src/sync-client.js';

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5000;
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS) || 60000;

let currentEvent = null;

async function poll() {
  let focused;
  try {
    focused = await getFocusedWindow();
  } catch (err) {
    console.error('[health-monitor]', err.message);
    return;
  }

  const now = new Date().toISOString();

  if (!currentEvent) {
    currentEvent = { ...focused, start_time: now };
    return;
  }

  if (currentEvent.app_name !== focused.app_name) {
    bufferEvent({ ...currentEvent, end_time: now });
    currentEvent = { ...focused, start_time: now };
  }
}

console.log(`Polling every ${POLL_INTERVAL_MS}ms, syncing every ${SYNC_INTERVAL_MS}ms`);
setInterval(poll, POLL_INTERVAL_MS);
setInterval(syncPendingEvents, SYNC_INTERVAL_MS);

syncPendingEvents();