import express from 'express';
import { assetsRouter } from './assets.js';
import { pool } from './db.js';

const app = express();
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.use('/api/assets', assetsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
