import 'dotenv/config';
import pool from '../config/db.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

async function generateSummary(usageRows, rangeType) {
  const usageText = usageRows
    .map(r => `${r.app_name} (${r.category || 'Uncategorized'}): ${Math.round(r.total_seconds / 60)} min`)
    .join('\n');

  const prompt = `Here is a user's ${rangeType} app usage summary:
${usageText}

Write a short, 2-3 sentence natural-language summary of their usage patterns.
Mention their most-used app/category and any notable trend. Keep it plain and factual, no bullet points.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

const RANGE_CONFIG = {
  daily: { table: 'daily_usage', dateCol: 'usage_date' },
  weekly: { table: 'weekly_usage', dateCol: 'week_start' },
  monthly: { table: 'monthly_usage', dateCol: 'month_start' }
  // yearly summaries are less commonly needed; add later if wanted
};

export async function runSummarizer(rangeType) {
  const config = RANGE_CONFIG[rangeType];
  if (!config) throw new Error(`Unsupported range: ${rangeType}`);

  // One completed period per device: the most recent period_start per device
  // that doesn't already have a stored insight (FR-17: never regenerate).
  const devicesResult = await pool.query(`SELECT id FROM devices`);

  for (const device of devicesResult.rows) {
    const usageResult = await pool.query(
      `SELECT a.name AS app_name, a.category, t.total_seconds, t.${config.dateCol} AS period_start
       FROM ${config.table} t
       JOIN apps a ON a.id = t.app_id
       WHERE t.device_id = $1
       ORDER BY t.${config.dateCol} DESC, t.total_seconds DESC`,
      [device.id]
    );

    if (usageResult.rows.length === 0) continue;

    const periodStart = usageResult.rows[0].period_start;
    const periodRows = usageResult.rows.filter(
      r => r.period_start.getTime() === periodStart.getTime()
    );

    const existing = await pool.query(
      `SELECT id FROM insights WHERE device_id = $1 AND range_type = $2 AND period_start = $3`,
      [device.id, rangeType, periodStart]
    );
    if (existing.rows.length > 0) {
      console.log(`[summarizer] insight already exists for device ${device.id} (${rangeType}, ${periodStart.toISOString().slice(0,10)}) — skipping`);
      continue;
    }

        try {
      const summaryText = await generateSummary(periodRows, rangeType);
      if (!summaryText) continue;

      let periodEndExpr;
      if (rangeType === 'daily') {
        periodEndExpr = '$3::date';
      } else if (rangeType === 'weekly') {
        periodEndExpr = "($3::date + INTERVAL '6 days')::date";
      } else if (rangeType === 'monthly') {
        periodEndExpr = "(($3::date + INTERVAL '1 month') - INTERVAL '1 day')::date";
      }

      await pool.query(
        `INSERT INTO insights (device_id, range_type, period_start, period_end, summary_text)
         VALUES ($1, $2, $3, ${periodEndExpr}, $4)
         ON CONFLICT (device_id, range_type, period_start) DO NOTHING`,
        [device.id, rangeType, periodStart, summaryText]
      );
      console.log(`[summarizer] generated ${rangeType} insight for device ${device.id}`);
    } catch (err) {
      console.error(`[summarizer] failed for device ${device.id}: ${err.message}`);
    }
  }
}