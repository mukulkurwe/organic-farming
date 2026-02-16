


// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import pool from "./config/db.js";

import farmRoutes from "./routes/farmRoutes.js";
import plotsRouter from "./routes/plots.js";
import masterRoutes from "./routes/masterRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

/* ========================
   ROUTES
======================== */

app.use("/api", farmRoutes);
app.use("/api", plotsRouter);
app.use("/api", masterRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/supervisor", supervisorRoutes);


// ✅ root route
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend is running 🚀",
  });
});
/* ========================
   HEALTH CHECK
======================== */

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/check-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
