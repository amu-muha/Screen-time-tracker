import express from 'express';
import pool from '../config/db.js';

const usageRouter = express.Router();

usageRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT re.id, a.name AS app_name, re.window_title,
              re.start_time, re.end_time, re.duration_seconds
       FROM raw_events re
       JOIN apps a ON a.id = re.app_id
       ORDER BY re.start_time DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query failed' });
  }
});

export default usageRouter;