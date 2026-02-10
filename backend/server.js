// import app from "./app.js";

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js"; // ✅ THIS LINE
import farmRoutes from "./routes/farmRoutes.js";
import activityRoutes from "./routes/activities.js";
// import farmingRoutes from "./routes/farms.js";
// import workerRoutes from "./routes/workers.js";

import plotsRouter from "./routes/plots.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api", farmRoutes);
app.use("/api", plotsRouter);
app.use("/api/activities", activityRoutes);
app.use("/api/farms", farmRoutes);
// app.use("/api/workers", workerRoutes);

/* ==========================================
   1. FARMS + ZONES
========================================== */

// GET /api/farms
app.get("/api/farms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM farms ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/farms error", err);
    res.status(500).json({ message: "Failed to fetch farms" });
  }
});

// GET /api/farms/:id/zones
app.get("/api/farms/:id/zones", async (req, res) => {
  try {
    const farmId = req.params.id;
    const result = await pool.query(
      "SELECT * FROM zones WHERE farm_id = $1 ORDER BY id",
      [farmId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/farms/:id/zones error", err);
    res.status(500).json({ message: "Failed to fetch zones" });
  }
});

/* ==========================================
   2. INPUTS (seeds, fertilizer, water...)
========================================== */
// ---- INPUTS ----
app.get("/api/inputs", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, type, unit_default, created_at FROM inputs ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/inputs error:", err.message);
    res.status(500).json({ message: "Failed to fetch inputs", error: err.message });
  }
});


/* ==========================================
   3. CROPS
========================================== */

app.get("/api/crops", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crops ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/crops error", err);
    res.status(500).json({ message: "Failed to fetch crops" });
  }
});

/* ==========================================
   4. WORKERS
========================================== */

// GET /api/workers?farm_id=1
app.get("/api/workers", async (req, res) => {
  try {
    const { farm_id } = req.query;
    const params = [];
    let where = "";

    if (farm_id) {
      params.push(farm_id);
      where = "WHERE farm_id = $1";
    }

    const result = await pool.query(
      `SELECT * FROM workers ${where} ORDER BY id`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/workers error", err);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});


// create table in db using
// psql postgresql://postgres:mukul123@localhost:5432/iit
// DELETE FROM public.landmapping;
