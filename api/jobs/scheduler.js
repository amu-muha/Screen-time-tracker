import cron from 'node-cron';
import { runAllRollups } from './rollup.js';
import { runCategorizer } from './categorizer.js';
import { runSummarizer } from './summarizer.js';

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

// Summarizer once daily, just after midnight — daily/weekly/monthly period boundaries
cron.schedule('5 0 * * *', async () => {
  console.log('[scheduler] running summarizer...');
  await runSummarizer('daily');
  await runSummarizer('weekly');
  await runSummarizer('monthly');
});

console.log('[scheduler] jobs scheduled');