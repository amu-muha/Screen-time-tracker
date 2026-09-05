import 'dotenv/config';
import pool from '../config/db.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

async function classifyAppName(appName) {
  const prompt = `Classify the application "${appName}" into exactly one category from this list: Productivity, Communication, Entertainment, Development, Browsing, System, Other.
Respond with ONLY the category word, nothing else.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${body}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || 'Other';
}

export async function runCategorizer() {
  // FR-15: only classify apps not yet categorized — never re-run on known apps
  const result = await pool.query(
    `SELECT id, name FROM apps WHERE category IS NULL`
  );

  if (result.rows.length === 0) {
    console.log('[categorizer] no uncategorized apps');
    return;
  }

  console.log(`[categorizer] classifying ${result.rows.length} app(s)...`);

  for (const app of result.rows) {
    try {
      const category = await classifyAppName(app.name);
      await pool.query(
        `UPDATE apps SET category = $1, updated_at = now() WHERE id = $2`,
        [category, app.id]
      );
      console.log(`[categorizer] ${app.name} -> ${category}`);
    } catch (err) {
      // SDD 5: LLM failure logs and retries next scheduled run, doesn't crash the job
      console.error(`[categorizer] failed for "${app.name}": ${err.message}`);
    }
  }
}