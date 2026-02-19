


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
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// app.use(cors({ origin: "http://localhost:3000" }));
// for production + local
// CORS (place before routes)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://organic-farming-teal.vercel.app",
  ],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

// ✅ Preflight handler without app.options("*")
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});


app.use(express.json());

/* ========================
   ROUTES
======================== */

app.use("/api", farmRoutes);
app.use("/api", plotsRouter);
app.use("/api", masterRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/supervisor", supervisorRoutes);



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

/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
