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

    res.status(201).json(eventResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'insert failed' });
  }
});

export default eventsRouter;