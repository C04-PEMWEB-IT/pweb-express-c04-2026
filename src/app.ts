import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { notFound } from './middlewares/notFound';
import apiRouter from './routes';

const app = express();

app.use(logger);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: true,
    message: 'MLBB Shop API berjalan dengan baik',
    data: { timestamp: new Date().toISOString() },
  });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
