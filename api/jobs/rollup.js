import pool from '../config/db.js'

export async function rollupDaily(){
 await pool.query(`
    INSERT INTO daily_usage (device_id, app_id, usage_date, total_seconds, event_count)
    SELECT device_id, app_id, start_time::date AS usage_date,
           SUM(duration_seconds), COUNT(*)
    FROM raw_events
    WHERE start_time::date IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    GROUP BY device_id, app_id, start_time::date
    ON CONFLICT (device_id, app_id, usage_date)
    DO UPDATE SET total_seconds = EXCLUDED.total_seconds,
                  event_count   = EXCLUDED.event_count
  `);
  console.log('[rollup] daily_usage updated');
}
// Weekly/monthly/yearly all derive from daily_usage, not raw_events directly —
// avoids recomputing from millions of raw rows (DBDD 6, SDD 7).
export async function rollupWeekly() {
  await pool.query(`
    INSERT INTO weekly_usage (device_id, app_id, week_start, total_seconds)
    SELECT device_id, app_id, date_trunc('week', usage_date)::date AS week_start,
           SUM(total_seconds)
    FROM daily_usage
    GROUP BY device_id, app_id, week_start
    ON CONFLICT (device_id, app_id, week_start)
    DO UPDATE SET total_seconds = EXCLUDED.total_seconds
  `);
  console.log('[rollup] weekly_usage updated');
}

export async function rollupMonthly() {
  await pool.query(`
    INSERT INTO monthly_usage (device_id, app_id, month_start, total_seconds)
    SELECT device_id, app_id, date_trunc('month', usage_date)::date AS month_start,
           SUM(total_seconds)
    FROM daily_usage
    GROUP BY device_id, app_id, month_start
    ON CONFLICT (device_id, app_id, month_start)
    DO UPDATE SET total_seconds = EXCLUDED.total_seconds
  `);
  console.log('[rollup] monthly_usage updated');
}

export async function rollupYearly() {
  await pool.query(`
    INSERT INTO yearly_usage (device_id, app_id, usage_year, total_seconds)
    SELECT device_id, app_id, EXTRACT(YEAR FROM usage_date)::int AS usage_year,
           SUM(total_seconds)
    FROM daily_usage
    GROUP BY device_id, app_id, usage_year
    ON CONFLICT (device_id, app_id, usage_year)
    DO UPDATE SET total_seconds = EXCLUDED.total_seconds
  `);
  console.log('[rollup] yearly_usage updated');
}

export async function runAllRollups() {
  await rollupDaily();
  await rollupWeekly();
  await rollupMonthly();
  await rollupYearly();
}
