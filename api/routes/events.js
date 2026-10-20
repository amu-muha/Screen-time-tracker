import express from 'express';
import pool from '../config/db.js';
import { deviceAuth } from '../middleware/auth.js';
import { validateEvent } from '../middleware/validation.js';

const eventsRouter = express.Router();

eventsRouter.post('/', deviceAuth, validateEvent, async (req, res) => {
  const { app_name, window_title, start_time, end_time } = req.body;
  const deviceId = req.device.id;

  try {
    const appResult = await pool.query(
      `INSERT INTO apps (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [app_name]
    );
    const appId = appResult.rows[0].id;

    const eventResult = await pool.query(
      `INSERT INTO raw_events (device_id, app_id, window_title, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [deviceId, appId, window_title, start_time, end_time]
    );

    const durationSeconds = eventResult.rows[0].duration_seconds || Math.max(0, Math.round((new Date(end_time) - new Date(start_time)) / 1000));

    // Update aggregate tables immediately so dashboard has real-time stats
    await pool.query(
      `INSERT INTO daily_usage (device_id, app_id, usage_date, total_seconds, event_count)
       VALUES ($1, $2, $3::date, $4, 1)
       ON CONFLICT (device_id, app_id, usage_date)
       DO UPDATE SET total_seconds = daily_usage.total_seconds + EXCLUDED.total_seconds,
                     event_count   = daily_usage.event_count + 1`,
      [deviceId, appId, start_time, durationSeconds]
    );

    await pool.query(
      `INSERT INTO weekly_usage (device_id, app_id, week_start, total_seconds)
       VALUES ($1, $2, date_trunc('week', $3::date)::date, $4)
       ON CONFLICT (device_id, app_id, week_start)
       DO UPDATE SET total_seconds = weekly_usage.total_seconds + EXCLUDED.total_seconds`,
      [deviceId, appId, start_time, durationSeconds]
    );

    await pool.query(
      `INSERT INTO monthly_usage (device_id, app_id, month_start, total_seconds)
       VALUES ($1, $2, date_trunc('month', $3::date)::date, $4)
       ON CONFLICT (device_id, app_id, month_start)
       DO UPDATE SET total_seconds = monthly_usage.total_seconds + EXCLUDED.total_seconds`,
      [deviceId, appId, start_time, durationSeconds]
    );

    await pool.query(
      `INSERT INTO yearly_usage (device_id, app_id, usage_year, total_seconds)
       VALUES ($1, $2, EXTRACT(YEAR FROM $3::date)::int, $4)
       ON CONFLICT (device_id, app_id, usage_year)
       DO UPDATE SET total_seconds = yearly_usage.total_seconds + EXCLUDED.total_seconds`,
      [deviceId, appId, start_time, durationSeconds]
    );

    res.status(201).json({
      ...eventResult.rows[0],
      capture_titles: req.device.capture_titles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'insert failed' });
  }
});

export default eventsRouter;