import 'dotenv/config';
import { getUnsyncedEvents, markSynced } from './local-buffer.js';

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export const runtimeConfig = {
  captureTitles: process.env.CAPTURE_WINDOW_TITLES !== 'false'
};

export async function refreshDeviceConfig() {
  if (!API_KEY || !API_URL) return;
  try {
    const configUrl = API_URL.replace(/\/events\/?$/, '/devices/me');
    const res = await fetch(configUrl, {
      headers: { 'X-API-Key': API_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.capture_titles === 'boolean') {
        if (runtimeConfig.captureTitles !== data.capture_titles) {
          console.log(`[config] updated capture_titles from server: ${data.capture_titles}`);
          runtimeConfig.captureTitles = data.capture_titles;
        }
      }
    }
  } catch (err) {
    // Keep existing fallback if network fails
  }
}

async function sendOne(event) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      app_name: event.app_name,
      window_title: event.window_title,
      start_time: event.start_time,
      end_time: event.end_time
    })
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`API rejected event: ${res.status} ${JSON.stringify(body)}`);
  }
  if (typeof body.capture_titles === 'boolean' && runtimeConfig.captureTitles !== body.capture_titles) {
    console.log(`[config] updated capture_titles from server: ${body.capture_titles}`);
    runtimeConfig.captureTitles = body.capture_titles;
  }
}

export async function syncPendingEvents() {
  await refreshDeviceConfig();
  const pending = getUnsyncedEvents();
  if (pending.length === 0) return;

  console.log(`Syncing ${pending.length} pending event(s)...`);

  for (const event of pending) {
    let attempt = 0;
    const maxAttempts = 5;
    let delay = 1000; // starts at 1s, doubles each retry

    while (attempt < maxAttempts) {
      try {
        await sendOne(event);
        markSynced(event.id);
        console.log(`Synced event ${event.id} (${event.app_name})`);
        break;
      } catch (err) {
        attempt++;
        console.error(`Sync attempt ${attempt} failed for event ${event.id}: ${err.message}`);
        if (attempt >= maxAttempts) {
          console.error(`Giving up on event ${event.id} for now — will retry next sync cycle`);
          break;
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
}