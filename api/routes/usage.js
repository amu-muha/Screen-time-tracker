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
      `SELECT a.name AS app_name, a.category, t.total_seconds
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

export default usageRouter;