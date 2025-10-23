import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health endpoint for UI status
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Routes
import loginRouter from './routes/login';
import restaurantsRouter from './routes/restaurants';
import tablesRouter from './routes/tables';
import reservationsRouter from './routes/reservations';

app.use('/api/login', loginRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/reservations', reservationsRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🦖 Dino Reserve backend running on http://localhost:${PORT}`);
});


