import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import usageRouter from './routes/usage.js';
import devicesRouter from './routes/devices.js';
import insightsRouter from './routes/insights.js';
import './jobs/scheduler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use('/api/usage', usageRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/insights', insightsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));