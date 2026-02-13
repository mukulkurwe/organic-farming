// import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pkg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// export default pool;


import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  LconnectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },});

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
