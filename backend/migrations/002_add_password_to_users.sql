-- 002_add_password_to_users.sql
-- Add password field to users table for authentication

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);
