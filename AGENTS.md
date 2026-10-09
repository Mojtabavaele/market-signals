# market-signals

Stack: Postgres 16 + Express API (`backend/`) + Vite/React (`frontend/`), run via `docker-compose.base44.yml`.

- Only port 3000 (Vite) is needed publicly. The browser calls `/api/*`, which Vite proxies to the `api` service (`API_PROXY_TARGET`), so everything is single-origin.
- Schema lives in `db/init.sql` and is applied **only on first creation of the `pgdata` volume**. After editing it, either write a migration by hand or recreate the volume (`docker compose -f docker-compose.base44.yml down -v`, which wipes data).
- `price_points` and `alerts` tables exist but nothing writes to them yet (price feed + volatility alert evaluation are planned next steps).
- No external credentials are required so far. A market-data provider API key will be needed when the price feed is added.
- Verify: `curl localhost:3000/api/assets` returns the seeded assets; `curl localhost:3000/api/health` returns `{"ok":true}`.
- Sandbox override: `BASE44_PREVIEW_MODE=1` enables file-watch polling in `frontend/vite.config.js`; unset, Vite uses default native watching.
