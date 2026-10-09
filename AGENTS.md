# market-signals

Stack: Postgres 16 + Express API (`backend/`) + Vite/React (`frontend/`), run via `docker-compose.base44.yml`.

- Only port 3000 (Vite) is needed publicly. The browser calls `/api/*`, which Vite proxies to the `api` service (`API_PROXY_TARGET`), so everything is single-origin.
- Schema lives in `db/init.sql` and is applied **only on first creation of the `pgdata` volume**. After editing it, either write a migration by hand or recreate the volume (`docker compose -f docker-compose.base44.yml down -v`, which wipes data).
- Price feed: `backend/src/priceFeed.js` polls Finnhub `/quote` every `PRICE_POLL_SECONDS` (default 60) and inserts into `price_points`. It needs `FINNHUB_API_KEY` (optional secret, delivered via `/run/base44/app.env`); without it the feed logs a warning and is disabled, the app still runs. Finnhub free tier does not cover crypto symbols like `BTC-USD` (they show "No price yet").
- `alerts` table exists but nothing writes to it yet (volatility alert evaluation is the next step).
- Verify: `curl localhost:3000/api/assets` returns the seeded assets; `curl localhost:3000/api/health` returns `{"ok":true}`.
- Sandbox override: `BASE44_PREVIEW_MODE=1` enables file-watch polling in `frontend/vite.config.js`; unset, Vite uses default native watching.
