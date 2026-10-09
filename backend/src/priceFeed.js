import { pool } from './db.js';

const API_KEY = process.env.FINNHUB_API_KEY;
const INTERVAL_MS = (Number(process.env.PRICE_POLL_SECONDS) || 60) * 1000;

async function fetchQuote(symbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const q = await res.json();
  // Finnhub returns c=0 for unknown symbols
  return q && q.c > 0 ? q.c : null;
}

async function pollOnce() {
  const { rows: assets } = await pool.query('SELECT id, symbol FROM assets');
  for (const a of assets) {
    try {
      const price = await fetchQuote(a.symbol);
      if (price === null) {
        console.warn(`[price-feed] no quote for ${a.symbol}`);
        continue;
      }
      await pool.query('INSERT INTO price_points (asset_id, price) VALUES ($1, $2)', [a.id, price]);
    } catch (e) {
      console.error(`[price-feed] ${a.symbol}: ${e.message}`);
    }
  }
}

export function startPriceFeed() {
  if (!API_KEY) {
    console.warn('[price-feed] FINNHUB_API_KEY not set — live prices disabled');
    return;
  }
  console.log(`[price-feed] polling every ${INTERVAL_MS / 1000}s`);
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await pollOnce(); } catch (e) { console.error('[price-feed]', e.message); }
    running = false;
  };
  tick();
  setInterval(tick, INTERVAL_MS);
}
