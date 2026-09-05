import express from 'express';
import pool from '../config/db.js';

const insightsRouter = express.Router();

insightsRouter.get('/', async (req, res) => {
  const range = req.query.range || 'daily';
  const deviceId = req.query.device_id;

  if (!deviceId) {
    return res.status(400).json({ error: 'device_id is required' });
  }
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(range)) {
    return res.status(400).json({ error: 'range must be one of daily, weekly, monthly, yearly' });
  }

  try {
    const result = await pool.query(
      `SELECT range_type, period_start, period_end, summary_text, generated_at
       FROM insights
       WHERE device_id = $1 AND range_type = $2
       ORDER BY period_start DESC
       LIMIT 1`,
      [deviceId, range]
    );

    if (result.rows.length === 0) {
      // FR-20 / T-23: current, still-in-progress period has no summary yet —
      // this is a normal "pending" state, not an error
      return res.status(204).send();
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query failed' });
  }
});

export default insightsRouter;