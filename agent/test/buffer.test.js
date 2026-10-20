import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const testDbPath = path.join(os.tmpdir(), `test_agent_${Date.now()}_${Math.random().toString(36).slice(2)}.db`);
process.env.SQLITE_DB_PATH = testDbPath;

const { bufferEvent, getUnsyncedEvents, markSynced } = await import('../src/local-buffer.js');

describe('Agent Local Buffer & Offline Resilience (FR-4, NFR-2)', () => {
  after(() => {
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch {}
  });

  test('buffers an event into SQLite and retrieves it unsynced', () => {
    const event = {
      app_name: 'Visual Studio Code',
      window_title: 'Screen Time Tracker',
      start_time: '2026-10-20T10:00:00.000Z',
      end_time: '2026-10-20T10:05:00.000Z'
    };

    bufferEvent(event);
    const unsynced = getUnsyncedEvents();
    assert.ok(unsynced.length >= 1);

    const latest = unsynced.find(e => e.app_name === 'Visual Studio Code');
    assert.ok(latest);
    assert.equal(latest.app_name, 'Visual Studio Code');
    assert.equal(latest.window_title, 'Screen Time Tracker');
    assert.equal(latest.synced, 0);
  });

  test('marks event as synced so it is excluded from future sync queries', () => {
    const unsynced = getUnsyncedEvents();
    const target = unsynced[0];
    assert.ok(target);

    markSynced(target.id);

    const remaining = getUnsyncedEvents();
    assert.ok(!remaining.some(e => e.id === target.id));
  });
});
