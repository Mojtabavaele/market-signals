-- Assets the user monitors
CREATE TABLE IF NOT EXISTS assets (
  id               SERIAL PRIMARY KEY,
  symbol           VARCHAR(20)  NOT NULL UNIQUE,
  name             VARCHAR(120) NOT NULL,
  asset_type       VARCHAR(20)  NOT NULL DEFAULT 'stock'
                   CHECK (asset_type IN ('stock', 'etf', 'crypto', 'forex', 'commodity')),
  exchange         VARCHAR(40),
  currency         CHAR(3)      NOT NULL DEFAULT 'USD',
  -- Alert when absolute price move over the window exceeds this percent
  volatility_threshold_pct NUMERIC(6,2) NOT NULL DEFAULT 5.00
                   CHECK (volatility_threshold_pct > 0),
  alert_window_minutes     INTEGER NOT NULL DEFAULT 60
                   CHECK (alert_window_minutes > 0),
  alerts_enabled   BOOLEAN      NOT NULL DEFAULT TRUE,
  notes            TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Price history (filled in by a later step: price feed)
CREATE TABLE IF NOT EXISTS price_points (
  id          BIGSERIAL PRIMARY KEY,
  asset_id    INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  price       NUMERIC(18,6) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_points_asset_time
  ON price_points (asset_id, recorded_at DESC);

-- Volatility alerts raised for an asset (filled in by a later step)
CREATE TABLE IF NOT EXISTS alerts (
  id           BIGSERIAL PRIMARY KEY,
  asset_id     INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  change_pct   NUMERIC(8,2) NOT NULL,
  price        NUMERIC(18,6) NOT NULL,
  message      TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alerts_asset_time ON alerts (asset_id, created_at DESC);

-- Seed a few example assets
INSERT INTO assets (symbol, name, asset_type, exchange, volatility_threshold_pct, alert_window_minutes) VALUES
  ('AAPL', 'Apple Inc.',        'stock',  'NASDAQ', 3.00, 60),
  ('TSLA', 'Tesla, Inc.',       'stock',  'NASDAQ', 5.00, 60),
  ('SPY',  'SPDR S&P 500 ETF',  'etf',    'NYSE',   2.00, 120),
  ('BTC-USD', 'Bitcoin',        'crypto', NULL,     6.00, 30)
ON CONFLICT (symbol) DO NOTHING;
