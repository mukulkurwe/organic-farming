-- Add role column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'farmer';

-- Add password_hash column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL;
