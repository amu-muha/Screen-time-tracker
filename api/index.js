import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import usageRouter from './routes/usage.js';
import devicesRouter from './routes/devices.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use('/api/usage', usageRouter);
app.use('/api/devices', devicesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));