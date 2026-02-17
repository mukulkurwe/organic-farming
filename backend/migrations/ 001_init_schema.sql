-- 001_init_schema.sql

-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'farmer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- farms
CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  owner_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- zones
CREATE TABLE IF NOT EXISTS zones (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES farms(id),
  name VARCHAR(50) NOT NULL,
  area NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- crops
CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- inputs
CREATE TABLE IF NOT EXISTS inputs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- seed, fertilizer, pesticide, water, other
  unit_default VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- workers
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES farms(id),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- activities
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  farm_id INT REFERENCES farms(id),
  zone_id INT REFERENCES zones(id),
  date DATE NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  crop_id INT REFERENCES crops(id),
  remarks TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- activity_inputs
CREATE TABLE IF NOT EXISTS activity_inputs (
  id SERIAL PRIMARY KEY,
  activity_id INT REFERENCES activities(id) ON DELETE CASCADE,
  input_id INT REFERENCES inputs(id),
  quantity NUMERIC,
  unit VARCHAR(20),
  method VARCHAR(100)
);

-- activity_workers
CREATE TABLE IF NOT EXISTS activity_workers (
  id SERIAL PRIMARY KEY,
  activity_id INT REFERENCES activities(id) ON DELETE CASCADE,
  worker_id INT REFERENCES workers(id),
  hours NUMERIC
);

-- plots
CREATE TABLE IF NOT EXISTS plots (
   id SERIAL PRIMARY KEY,
   farm_id INT REFERENCES farms(id),
   polygon JSONB,
   crop VARCHAR(50),
   area NUMERIC,
   slope_percent NUMERIC,
   risk_level VARCHAR(10)
);
 
--landmapping
CREATE TABLE IF NOT EXISTS landmapping (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(150),
        total_area NUMERIC,
        boundary JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );