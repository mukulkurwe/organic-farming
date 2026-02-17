// migrate.js
import fs from "fs";
import path from "path";
import url from "url";
import pool from "./config/db.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();

  try {
    // 1) migrations table (track which files already)
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2) migrations folder .sql files
    const migrationsDir = path.join(__dirname, "migrations");
    let files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort(); // 001, 002, 003 order

    // 3) migration files which are already run
    const res = await client.query(`SELECT name FROM migrations`);
    const done = new Set(res.rows.map((r) => r.name));

    for (const file of files) {
      if (done.has(file)) {
        console.log(`Skipping (already run): ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO migrations (name) VALUES ($1)`,
        [file]
      );
      await client.query("COMMIT");

      console.log(`✅ Completed: ${file}`);
    }

    console.log("🎉 All migrations up to date.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    try {
      await client.query("ROLLBACK");
    } catch (_) {}
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
