


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

const allowedOrigins = [
  "http://localhost:3000",
  "https://organic-farming-teal.vercel.app",
];

const app = express();
// for local host
// app.use(cors({ origin: "http://localhost:3000" }));

// for production

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman/curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ handle preflight for all routes
app.options("*", cors());

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
