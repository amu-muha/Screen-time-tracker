import express from 'express';
import pool from '../config/db.js';


export const eventsRouter = express.Router();


eventsRouter.post('/', async (req, res) => {
  const { device_id, app_name, window_title, start_time, end_time } = req.body;

  try {
    // apps.name is UNIQUE (DBDD 4.2) — get existing id or create it.
    // category stays NULL until the AI categorizer job runs (FR-15).
    const appResult = await pool.query(
      `INSERT INTO apps (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [app_name]
    );
    const appId = appResult.rows[0].id;

    // duration_seconds is GENERATED ALWAYS — never insert it directly (DBDD 4.3)
    const eventResult = await pool.query(
      `INSERT INTO raw_events (device_id, app_id, window_title, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [device_id, appId, window_title, start_time, end_time]
    );

    res.status(201).json(eventResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'insert failed' });
  }
});

