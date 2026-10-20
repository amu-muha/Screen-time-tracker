import pool from '../config/db.js';

/**
 * NFR-9: Cleans up raw events older than 90 days.
 * Aggregated tables (daily/weekly/monthly/yearly usage) and insights are preserved indefinitely.
 */
export async function runRetentionCleanup() {
  try {
    const result = await pool.query(`
      DELETE FROM raw_events
      WHERE start_time < NOW() - INTERVAL '90 days'
    `);
    console.log(`[retention] cleaned up ${result.rowCount ?? 0} raw events older than 90 days`);
    return result.rowCount ?? 0;
  } catch (err) {
    console.error('[retention] cleanup failed:', err.message);
    throw err;
  }
}
