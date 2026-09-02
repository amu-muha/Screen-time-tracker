const TEST_DEVICE_ID = '11111111-1111-1111-1111-111111111111';

async function sendFakeEvent() {
  const now = new Date();
  const startTime = new Date(now.getTime() - 42_000); // 42s ago

  const fakeEvent = {
    device_id: TEST_DEVICE_ID,
    app_name: 'vscode',      // resolved to apps.id by the API, not sent as an id
    window_title: 'index.js — myproject',
    start_time: startTime.toISOString(),
    end_time: now.toISOString()
    // duration_seconds is NOT sent — it's a generated column in raw_events
  };

  const res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakeEvent)
  });

  console.log('Response:', res.status, await res.json());
}

sendFakeEvent();