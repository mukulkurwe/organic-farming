// for production

// import pg from "pg";
// const { Pool } = pg;

// if (!process.env.DATABASE_URL) {
//   console.error("❌ DATABASE_URL is missing");
// }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
// });

// export default pool;

// for local

// backend/db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const isProd = process.env.NODE_ENV === "production";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Check Render env vars or local .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
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