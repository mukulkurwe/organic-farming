-- 006_demand_supply.sql
-- Demand & Supply Module: supply forecasts, demand requests, smart matching

-- 1) Supply Forecasts — farmers declare upcoming harvests
CREATE TABLE IF NOT EXISTS supply_forecasts (
  id               SERIAL PRIMARY KEY,
  farm_id          INT REFERENCES farms(id) ON DELETE CASCADE,
  farmer_id        INT REFERENCES users(id) ON DELETE SET NULL,
  crop_id          INT REFERENCES crops(id) ON DELETE SET NULL,
  crop_name        VARCHAR(100) NOT NULL,
  estimated_qty    NUMERIC NOT NULL,
  unit             VARCHAR(20) NOT NULL DEFAULT 'kg',
  expected_date    DATE,
  listing_id       INT REFERENCES produce_listings(id) ON DELETE SET NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'forecast', -- forecast | available | sold | cancelled
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- 2) Demand Requests — buyers/admin post what is needed
CREATE TABLE IF NOT EXISTS demand_requests (
  id               SERIAL PRIMARY KEY,
  buyer_id         INT REFERENCES buyers(id) ON DELETE SET NULL,
  buyer_name       VARCHAR(100) NOT NULL,
  buyer_phone      VARCHAR(20),
  buyer_type       VARCHAR(30) DEFAULT 'individual', -- individual | retailer | wholesaler | mandi | exporter
  crop_id          INT REFERENCES crops(id) ON DELETE SET NULL,
  crop_name        VARCHAR(100) NOT NULL,
  quantity_needed  NUMERIC NOT NULL,
  unit             VARCHAR(20) NOT NULL DEFAULT 'kg',
  price_offered    NUMERIC,
  deadline_date    DATE,
  delivery_location VARCHAR(200),
  status           VARCHAR(20) NOT NULL DEFAULT 'open', -- open | matched | fulfilled | closed
  notes            TEXT,
  created_by       INT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- 3) Demand-Supply Matches — links demand to a forecast or listing
CREATE TABLE IF NOT EXISTS demand_supply_matches (
  id           SERIAL PRIMARY KEY,
  demand_id    INT REFERENCES demand_requests(id) ON DELETE CASCADE,
  forecast_id  INT REFERENCES supply_forecasts(id) ON DELETE SET NULL,
  listing_id   INT REFERENCES produce_listings(id) ON DELETE SET NULL,
  match_score  INT DEFAULT 0,          -- 0–100 relevance score
  status       VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | confirmed | rejected | fulfilled
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_supply_forecasts_farm     ON supply_forecasts(farm_id);
CREATE INDEX IF NOT EXISTS idx_supply_forecasts_farmer   ON supply_forecasts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_supply_forecasts_crop     ON supply_forecasts(crop_name);
CREATE INDEX IF NOT EXISTS idx_demand_requests_crop      ON demand_requests(crop_name);
CREATE INDEX IF NOT EXISTS idx_demand_requests_status    ON demand_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsm_demand               ON demand_supply_matches(demand_id);
