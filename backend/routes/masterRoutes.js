// backend/routes/masterRoutes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* ========================
   INPUTS
======================== */
router.get("/inputs", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, type, unit_default FROM inputs ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inputs error:", err.message);
    res.status(500).json({ message: "Failed to fetch inputs" });
  }
});

router.post("/inputs", async (req, res) => {
  try {
    const { name, type, unit_default } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Input name is required" });
    }

    const result = await pool.query(
      `INSERT INTO inputs (name, type, unit_default)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), type || null, unit_default || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /inputs error:", err.message);
    res.status(500).json({ message: "Failed to create input" });
  }
});

router.delete("/inputs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM inputs WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Input not found" });
    }
    res.json({ message: "Input deleted", input: result.rows[0] });
  } catch (err) {
    console.error("DELETE /inputs/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete input" });
  }
});

/* ========================
   CROPS
======================== */
router.get("/crops", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, variety FROM crops ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /crops error:", err.message);
    res.status(500).json({ message: "Failed to fetch crops" });
  }
});

router.post("/crops", async (req, res) => {
  try {
    const { name, variety } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Crop name is required" });
    }

    const result = await pool.query(
      `INSERT INTO crops (name, variety)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), variety || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /crops error:", err.message);
    res.status(500).json({ message: "Failed to create crop" });
  }
});

router.delete("/crops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM crops WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.json({ message: "Crop deleted", crop: result.rows[0] });
  } catch (err) {
    console.error("DELETE /crops/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete crop" });
  }
});

/* ========================
   WORKERS
======================== */
router.get("/workers", async (req, res) => {
  try {
    const { farm_id } = req.query;

    if (farm_id) {
      const result = await pool.query(
        "SELECT * FROM workers WHERE farm_id = $1 ORDER BY id",
        [farm_id]
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      "SELECT * FROM workers ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /workers error:", err.message);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
});

router.post("/workers", async (req, res) => {
  try {
    const { farm_id, name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Worker name is required" });
    }
    if (!farm_id) {
      return res.status(400).json({ message: "farm_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO workers (farm_id, name, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [farm_id, name.trim(), phone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /workers error:", err.message);
    res.status(500).json({ message: "Failed to create worker" });
  }
});

router.delete("/workers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM workers WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }
    res.json({ message: "Worker deleted", worker: result.rows[0] });
  } catch (err) {
    console.error("DELETE /workers/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete worker" });
  }
});

/* ========================
   ADMIN STATS
======================== */
router.get("/admin/stats", async (_req, res) => {
  try {
    const [usersRes, farmsRes, activitiesRes, workersRes, cropsRes, inputsRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(*)::int AS count FROM farms"),
      pool.query(
        "SELECT COUNT(*)::int AS count FROM activities WHERE date >= NOW() - INTERVAL '7 days'"
      ),
      pool.query("SELECT COUNT(*)::int AS count FROM workers"),
      pool.query("SELECT COUNT(*)::int AS count FROM crops"),
      pool.query("SELECT COUNT(*)::int AS count FROM inputs"),
    ]);

    res.json({
      total_users: usersRes.rows[0].count,
      total_farms: farmsRes.rows[0].count,
      recent_activities: activitiesRes.rows[0].count,
      total_workers: workersRes.rows[0].count,
      total_crops: cropsRes.rows[0].count,
      total_inputs: inputsRes.rows[0].count,
    });
  } catch (err) {
    console.error("GET /admin/stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

/* ========================
   ADMIN: ALL USERS
======================== */
router.get("/admin/users", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /admin/users error:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.delete("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, phone, role",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error("DELETE /admin/users/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
