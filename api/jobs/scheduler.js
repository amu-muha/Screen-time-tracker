import cron from 'node-cron';
import { runAllRollups } from './rollup.js';
import { runCategorizer } from './categorizer.js';
import { runSummarizer } from './summarizer.js';
import { runRetentionCleanup } from './retention.js';

// Rollups hourly — cheap DB-only work, keeps aggregates fresh (FR-14)
cron.schedule('0 * * * *', async () => {
  console.log('[scheduler] running rollups...');
  await runAllRollups();
});

// Categorizer every 6 hours — new apps don't need instant classification
cron.schedule('0 */6 * * *', async () => {
  console.log('[scheduler] running categorizer...');
  await runCategorizer();
});

// Summarizer once daily, just after midnight — daily/weekly/monthly/yearly period boundaries
cron.schedule('5 0 * * *', async () => {
  console.log('[scheduler] running summarizer...');
  await runSummarizer('daily');
  await runSummarizer('weekly');
  await runSummarizer('monthly');
  await runSummarizer('yearly');
});

// Retention cleanup once daily at 01:00 — purges raw events older than 90 days (NFR-9)
cron.schedule('0 1 * * *', async () => {
  console.log('[scheduler] running retention cleanup...');
  await runRetentionCleanup();
});

console.log('[scheduler] jobs scheduled');