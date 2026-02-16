


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
app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activities ORDER BY id DESC LIMIT 50"
    );
    res.json({ ok: true, rows: result.rows });
  } catch (err) {
    console.error("❌ activities error:", err);
    res.status(500).json({ ok: false, message: err.message, code: err.code });
  }
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

app.get("/api/test-farms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.farms ORDER BY id ASC");
    res.json({ ok: true, rows: result.rows });
  } catch (err) {
  console.error("❌ ERROR:", err);

  return res.status(500).json({
    ok: false,
    message: err?.message ?? null,
    code: err?.code ?? null,
    detail: err?.detail ?? null,
    hint: err?.hint ?? null,
    where: err?.where ?? null,
  });
}

});





/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
