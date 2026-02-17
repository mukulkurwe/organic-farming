


// // backend/server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// import pool from "./config/db.js";

// import farmRoutes from "./routes/farmRoutes.js";
// import plotsRouter from "./routes/plots.js";
// import masterRoutes from "./routes/masterRoutes.js";
// import activityRoutes from "./routes/activityRoutes.js";
// import supervisorRoutes from "./routes/supervisorRoutes.js";

// dotenv.config();

// const app = express();

// // app.use(cors({ origin: "http://localhost:3000" }));
// // for production + local
// const allowedOrigins = [
//   "http://localhost:3000",
//   process.env.FRONTEND_URL, // set this on Render
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       return cb(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true,
//   })
// );
// app.use(express.json());

// /* ========================
//    ROUTES
// ======================== */

// app.use("/api", farmRoutes);
// app.use("/api", plotsRouter);
// app.use("/api", masterRoutes);
// app.use("/api/activities", activityRoutes);
// app.use("/api/supervisor", supervisorRoutes);



// /* ========================
//    HEALTH CHECK
// ======================== */

// app.get("/api/health", async (_req, res) => {
//   try {
//     const result = await pool.query("SELECT NOW() as now");
//     res.json({ ok: true, now: result.rows[0].now });
//   } catch (err) {
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });

// /* ========================
//    SERVER START
// ======================== */

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// New code

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

/* ========================
   CORS (Local + Vercel + Preview Branches)
   - Allows localhost:3000
   - Allows any *.vercel.app (covers preview deployments)
   - Optionally allows FRONTEND_URL from env
======================== */
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // e.g. https://organic-farming-teal.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow Postman/curl or server-to-server (no Origin header)
      if (!origin) return cb(null, true);

      // exact matches
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // allow all Vercel preview/prod deployments
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      // deny without throwing (prevents crashes)
      return cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // set to false if you are NOT using cookies
  })
);

// handle preflight for all routes
app.options("*", cors());

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
   ROOT + HEALTH CHECK
======================== */
app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, message: "Backend is running 🚀" });
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error("❌ health error:", err);
    res.status(500).json({ ok: false, error: err.message, code: err.code });
  }
});

/* ========================
   SERVER START
======================== */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
