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

/* ========================
   CROPS
======================== */
router.get("/crops", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM crops ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /crops error:", err.message);
    res.status(500).json({ message: "Failed to fetch crops" });
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

export default router;
