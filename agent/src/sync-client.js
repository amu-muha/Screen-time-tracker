import 'dotenv/config';
import { getUnsyncedEvents, markSynced } from './local-buffer.js';

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

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

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`API rejected event: ${res.status} ${JSON.stringify(body)}`);
  }
}

export async function syncPendingEvents() {
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