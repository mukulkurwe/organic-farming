import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;


// CREATE TABLE plots (
//   id SERIAL PRIMARY KEY,
//   farm_id INT REFERENCES farms(id),
//   polygon JSONB,
//   crop VARCHAR(50),
//   area NUMERIC,
//   slope_percent NUMERIC,
//   risk_level VARCHAR(10)
// );

// CREATE TABLE IF NOT EXISTS landmapping (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         name VARCHAR(100) NOT NULL,
//         location VARCHAR(150),
//         total_area NUMERIC,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );


// ALTER TABLE farms
//       ADD COLUMN IF NOT EXISTS boundary JSONB