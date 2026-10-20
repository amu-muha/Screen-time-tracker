import express from 'express';
import pool from '../config/db.js';

const usageRouter = express.Router();

const TABLE_BY_RANGE = {
  daily: { table: 'daily_usage', dateCol: 'usage_date' },
  weekly: { table: 'weekly_usage', dateCol: 'week_start' },
  monthly: { table: 'monthly_usage', dateCol: 'month_start' },
  yearly: { table: 'yearly_usage', dateCol: 'usage_year' }
};

usageRouter.get('/', async (req, res) => {
  const range = req.query.range || 'daily';
  const deviceId = req.query.device_id;
  const config = TABLE_BY_RANGE[range];

  if (!config) {
    return res.status(400).json({ error: 'range must be one of daily, weekly, monthly, yearly' });
  }
  if (!deviceId) {
    return res.status(400).json({ error: 'device_id is required' });
  }

  try {
    const result = await pool.query(
      `SELECT a.name AS app_name, a.category, t.total_seconds,
              COALESCE(t.event_count, 1) AS session_count
       FROM ${config.table} t
       JOIN apps a ON a.id = t.app_id
       WHERE t.device_id = $1
       ORDER BY t.total_seconds DESC`,
      [deviceId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query failed' });
  }
});

usageRouter.get('/history', async (req, res) => {
  const deviceId = req.query.device_id;
  const days = parseInt(req.query.days, 10) || 7;

  if (!deviceId) {
    return res.status(400).json({ error: 'device_id is required' });
  }

  try {
    const result = await pool.query(
      `SELECT d.usage_date::text AS usage_date,
              COALESCE(a.category, 'Uncategorized') AS category,
              SUM(d.total_seconds)::int AS total_seconds
       FROM daily_usage d
       JOIN apps a ON a.id = d.app_id
       WHERE d.device_id = $1 AND d.usage_date >= CURRENT_DATE - ($2 || ' days')::interval
       GROUP BY d.usage_date, a.category
       ORDER BY d.usage_date ASC`,
      [deviceId, days - 1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'history query failed' });
  }
});

export default usageRouter;