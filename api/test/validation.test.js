import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent } from '../middleware/validation.js';

describe('API Event Validation Middleware (FR-8)', () => {
  function runMiddleware(body) {
    let nextCalled = false;
    let statusCode = null;
    let responseBody = null;

    const req = { body };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(payload) {
            responseBody = payload;
          }
        };
      }
    };
    const next = () => { nextCalled = true; };

    validateEvent(req, res, next);
    return { nextCalled, statusCode, responseBody, req };
  }

  test('accepts valid event payload', () => {
    const valid = {
      app_name: 'Visual Studio Code',
      window_title: 'Screen Time Tracker',
      start_time: '2026-10-20T10:00:00.000Z',
      end_time: '2026-10-20T10:05:00.000Z'
    };
    const { nextCalled, statusCode } = runMiddleware(valid);
    assert.equal(nextCalled, true);
    assert.equal(statusCode, null);
  });

  test('accepts event with null window_title (title capture disabled)', () => {
    const valid = {
      app_name: 'Google Chrome',
      window_title: null,
      start_time: '2026-10-20T10:00:00.000Z',
      end_time: '2026-10-20T10:05:00.000Z'
    };
    const { nextCalled } = runMiddleware(valid);
    assert.equal(nextCalled, true);
  });

  test('rejects empty or missing app_name', () => {
    const invalid = {
      app_name: '',
      start_time: '2026-10-20T10:00:00.000Z',
      end_time: '2026-10-20T10:05:00.000Z'
    };
    const { nextCalled, statusCode, responseBody } = runMiddleware(invalid);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 400);
    assert.equal(responseBody.error, 'invalid event payload');
  });

  test('rejects end_time earlier than start_time', () => {
    const invalid = {
      app_name: 'Terminal',
      start_time: '2026-10-20T10:05:00.000Z',
      end_time: '2026-10-20T10:00:00.000Z'
    };
    const { nextCalled, statusCode } = runMiddleware(invalid);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 400);
  });

  test('rejects malformed datetime strings', () => {
    const invalid = {
      app_name: 'Terminal',
      start_time: 'not-a-date',
      end_time: '2026-10-20T10:00:00.000Z'
    };
    const { nextCalled, statusCode } = runMiddleware(invalid);
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 400);
  });
});
