import { Router } from 'express';
import { pool } from './db.js';

const TYPES = ['stock', 'etf', 'crypto', 'forex', 'commodity'];

// Validate and normalise an asset payload. Returns { error } or { value }.
function parseAsset(body, { partial = false } = {}) {
  const v = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has('symbol')) {
    const s = String(body.symbol ?? '').trim().toUpperCase();
    if (!s || s.length > 20) return { error: 'symbol is required (max 20 chars)' };
    v.symbol = s;
  }
  if (!partial || has('name')) {
    const n = String(body.name ?? '').trim();
    if (!n || n.length > 120) return { error: 'name is required (max 120 chars)' };
    v.name = n;
  }
  if (has('asset_type')) {
    if (!TYPES.includes(body.asset_type)) return { error: `asset_type must be one of ${TYPES.join(', ')}` };
    v.asset_type = body.asset_type;
  }
  if (has('exchange')) v.exchange = body.exchange ? String(body.exchange).trim().slice(0, 40) : null;
  if (has('currency')) {
    const c = String(body.currency).trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) return { error: 'currency must be a 3-letter code' };
    v.currency = c;
  }
  if (has('volatility_threshold_pct')) {
    const t = Number(body.volatility_threshold_pct);
    if (!(t > 0) || t > 100) return { error: 'volatility_threshold_pct must be between 0 and 100' };
    v.volatility_threshold_pct = t;
  }
  if (has('alert_window_minutes')) {
    const w = Number(body.alert_window_minutes);
    if (!Number.isInteger(w) || w <= 0) return { error: 'alert_window_minutes must be a positive integer' };
    v.alert_window_minutes = w;
  }
  if (has('alerts_enabled')) v.alerts_enabled = Boolean(body.alerts_enabled);
  if (has('notes')) v.notes = body.notes ? String(body.notes) : null;
  return { value: v };
}

export const assetsRouter = Router();

assetsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM assets ORDER BY symbol');
    res.json(rows);
  } catch (e) { next(e); }
});

assetsRouter.post('/', async (req, res, next) => {
  try {
    const { error, value } = parseAsset(req.body ?? {});
    if (error) return res.status(400).json({ error });
    const cols = Object.keys(value);
    const { rows } = await pool.query(
      `INSERT INTO assets (${cols.join(', ')})
       VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      cols.map((c) => value[c]),
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An asset with this symbol already exists' });
    next(e);
  }
});

assetsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { error, value } = parseAsset(req.body ?? {}, { partial: true });
    if (error) return res.status(400).json({ error });
    const cols = Object.keys(value);
    if (!cols.length) return res.status(400).json({ error: 'No fields to update' });
    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE assets SET ${sets}, updated_at = now() WHERE id = $${cols.length + 1} RETURNING *`,
      [...cols.map((c) => value[c]), req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Asset not found' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An asset with this symbol already exists' });
    next(e);
  }
});

assetsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Asset not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});
