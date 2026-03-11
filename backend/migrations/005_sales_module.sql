-- 005_sales_module.sql
-- Farm Sales Module: produce listings, buyer registry, sales transactions

-- 1) Buyers registry
CREATE TABLE IF NOT EXISTS buyers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(150),
  buyer_type VARCHAR(30) DEFAULT 'retail',  -- wholesale | retail | direct | mandi
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2) Produce listings (what's available for sale after harvest)
CREATE TABLE IF NOT EXISTS produce_listings (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
  crop_id INT REFERENCES crops(id) ON DELETE SET NULL,
  crop_name VARCHAR(100) NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  quantity_available NUMERIC NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  harvest_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'available',  -- available | sold | reserved
  notes TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3) Sales transactions
CREATE TABLE IF NOT EXISTS sales_transactions (
  id SERIAL PRIMARY KEY,
  listing_id INT REFERENCES produce_listings(id) ON DELETE SET NULL,
  farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
  buyer_id INT REFERENCES buyers(id) ON DELETE SET NULL,
  buyer_name VARCHAR(100),
  quantity_sold NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'cash',  -- cash | upi | cheque | credit
  payment_status VARCHAR(20) DEFAULT 'paid',  -- paid | pending | partial
  sale_date DATE NOT NULL,
  notes TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
