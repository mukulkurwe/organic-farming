-- 003_agri_calendar.sql
-- Agri Calendar Feature: farmer profiles, soil profiles, crop extensions,
-- task templates, crop plans, and calendar events

-- 1) soil_profiles
CREATE TABLE IF NOT EXISTS soil_profiles (
  id SERIAL PRIMARY KEY,
  soil_type VARCHAR(50) UNIQUE NOT NULL,
  ph_min DECIMAL(4,2),
  ph_max DECIMAL(4,2),
  npk_level VARCHAR(20),       -- 'low' | 'medium' | 'high'
  description TEXT
);

-- 2) farmer_profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id),
  name VARCHAR(100),
  state VARCHAR(100),
  district VARCHAR(100),
  farm_size_acres DECIMAL(8,2),
  irrigation_type VARCHAR(50),  -- 'rainfed' | 'drip' | 'canal' | 'borewell'
  soil_type VARCHAR(50),        -- references soil_profiles.soil_type logically
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3) extend existing crops table with agri calendar columns
-- Add unique constraint on name for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS crops_name_unique ON crops (name);

ALTER TABLE crops ADD COLUMN IF NOT EXISTS local_name VARCHAR(100);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS season VARCHAR(20);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS suitable_soils TEXT[];
ALTER TABLE crops ADD COLUMN IF NOT EXISTS suitable_states TEXT[];
ALTER TABLE crops ADD COLUMN IF NOT EXISTS min_rainfall_mm INTEGER;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS max_rainfall_mm INTEGER;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS min_temp_celsius INTEGER;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS max_temp_celsius INTEGER;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS water_requirement VARCHAR(20);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS irrigation_types TEXT[];
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

-- 4) crop_task_templates
CREATE TABLE IF NOT EXISTS crop_task_templates (
  id SERIAL PRIMARY KEY,
  crop_id INT REFERENCES crops(id) ON DELETE CASCADE,
  task_name VARCHAR(100),
  task_type VARCHAR(30),       -- 'land_prep' | 'sowing' | 'fertilization' | 'irrigation' | 'pesticide' | 'harvest' | 'soil_test'
  day_offset INTEGER,          -- days after sowing (negative = before)
  duration_hours INTEGER,
  priority VARCHAR(10),        -- 'low' | 'medium' | 'high' | 'critical'
  notes TEXT,
  input_required VARCHAR(100),
  quantity_per_acre VARCHAR(50)
);

-- 5) farmer_crop_plans
CREATE TABLE IF NOT EXISTS farmer_crop_plans (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES farmer_profiles(id),
  crop_id INT REFERENCES crops(id),
  season VARCHAR(20),
  sowing_date DATE,
  expected_harvest DATE,
  status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'completed' | 'abandoned'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6) calendar_events
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES farmer_profiles(id),
  plan_id INT REFERENCES farmer_crop_plans(id),
  crop_id INT REFERENCES crops(id),
  task_template_id INT REFERENCES crop_task_templates(id),
  event_title VARCHAR(200),
  event_type VARCHAR(30),       -- 'crop_task' | 'soil_task' | 'weather_alert' | 'resource_task' | 'risk_alert'
  event_date DATE,
  event_color VARCHAR(10),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
