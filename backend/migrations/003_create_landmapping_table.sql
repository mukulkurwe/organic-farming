-- Create landmapping table

CREATE TABLE IF NOT EXISTS landmapping (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    total_area NUMERIC,
    boundary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
