-- 004_add_boundary_to_farms.sql
-- Add boundary JSONB column to farms table for storing farm boundary polygons

ALTER TABLE farms ADD COLUMN IF NOT EXISTS boundary JSONB;
