// // import app from "./app.js";

// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import pool from "./config/db.js"; // ✅ THIS LINE
// import farmRoutes from "./routes/farmRoutes.js";
// import activityRoutes from "./routes/activities.js";
// // import farmingRoutes from "./routes/farms.js";
// // import workerRoutes from "./routes/workers.js";

// import plotsRouter from "./routes/plots.js";

// dotenv.config();

// const app = express();

// app.use(cors({ origin: "http://localhost:3000" }));
// app.use(express.json());

// app.use("/api", farmRoutes);
// app.use("/api", plotsRouter);
// app.use("/api/activities", activityRoutes);
// app.use("/api/farms", farmRoutes);
// // app.use("/api/workers", workerRoutes);

// app.get("/api/health", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT NOW() as now");
//     res.json({ ok: true, now: result.rows[0].now });
//   } catch (err) {
//     console.error("HEALTH ERROR:", err.message);
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });
// /* ==========================================
//    1. FARMS + ZONES
// ========================================== */

// // GET /api/farms
// app.get("/api/farms", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM farms ORDER BY id");
//     res.json(result.rows);
//   } catch (err) {
//     console.error("GET /api/farms error", err);
//     res.status(500).json({ message: "Failed to fetch farms" });
//   }
// });

// // GET /api/farms/:id/zones
// app.get("/api/farms/:id/zones", async (req, res) => {
//   try {
//     const farmId = req.params.id;
//     const result = await pool.query(
//       "SELECT * FROM zones WHERE farm_id = $1 ORDER BY id",
//       [farmId]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("GET /api/farms/:id/zones error", err);
//     res.status(500).json({ message: "Failed to fetch zones" });
//   }
// });

// /* ==========================================
//    2. INPUTS (seeds, fertilizer, water...)
// ========================================== */
// // ---- INPUTS ----
// app.get("/api/inputs", async (_req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, name, type, unit_default, created_at FROM inputs ORDER BY name"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("GET /api/inputs error:", err.message);
//     res.status(500).json({ message: "Failed to fetch inputs", error: err.message });
//   }
// });


// /* ==========================================
//    3. CROPS
// ========================================== */

// app.get("/api/crops", async (_req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM crops ORDER BY name");
//     res.json(result.rows);
//   } catch (err) {
//     console.error("GET /api/crops error", err);
//     res.status(500).json({ message: "Failed to fetch crops" });
//   }
// });

// /* ==========================================
//    4. WORKERS
// ========================================== */

// // GET /api/workers?farm_id=1
// app.get("/api/workers", async (req, res) => {
//   try {
//     const { farm_id } = req.query;
//     const params = [];
//     let where = "";

//     if (farm_id) {
//       params.push(farm_id);
//       where = "WHERE farm_id = $1";
//     }

//     const result = await pool.query(
//       `SELECT * FROM workers ${where} ORDER BY id`,
//       params
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("GET /api/workers error", err);
//     res.status(500).json({ message: "Failed to fetch workers" });
//   }
// });





// // new line


// // app.post("/api/activities", async (req, res) => {
// //   const client = await pool.connect();

// //   try {
// //     const {
// //       farm_id,
// //       zone_id,
// //       date,
// //       activity_type,
// //       crop_id,
// //       remarks,
// //       created_by,
// //       inputs = [],
// //       workers = [],
// //     } = req.body;

// //     if (!farm_id || !date || !activity_type) {
// //       return res.status(400).json({
// //         message: "farm_id, date and activity_type are required",
// //       });
// //     }

// //     await client.query("BEGIN");

// //     // 1) insert main activity
// //     const activityResult = await client.query(
// //       `
// //       INSERT INTO activities
// //         (farm_id, zone_id, date, activity_type, crop_id, remarks, created_by)
// //       VALUES
// //         ($1, $2, $3, $4, $5, $6, $7)
// //       RETURNING id
// //       `,
// //       [
// //         farm_id,
// //         zone_id || null,
// //         date,
// //         activity_type,
// //         crop_id || null,
// //         remarks || null,
// //         created_by || null,
// //       ]
// //     );

// //     const activityId = activityResult.rows[0].id;

// //     // 2) inputs
// //     for (const inp of inputs) {
// //       await client.query(
// //         `
// //         INSERT INTO activity_inputs
// //           (activity_id, input_id, quantity, unit, method)
// //         VALUES
// //           ($1, $2, $3, $4, $5)
// //         `,
// //         [
// //           activityId,
// //           inp.input_id,
// //           inp.quantity || null,
// //           inp.unit || null,
// //           inp.method || null,
// //         ]
// //       );
// //     }

// //     // 3) workers
// //     for (const w of workers) {
// //       await client.query(
// //         `
// //         INSERT INTO activity_workers
// //           (activity_id, worker_id)
// //         VALUES
// //           ($1, $2)
// //         `,
// //         [activityId, w.worker_id]
// //       );
// //     }

// //     await client.query("COMMIT");

// //     res.status(201).json({
// //       message: "Activity created successfully",
// //       activity_id: activityId,
// //     });
// //   } catch (err) {
// //     await client.query("ROLLBACK");
// //     console.error("POST /api/activities ERROR:", err.message);
// //     console.error(err.stack);

// //     res.status(500).json({
// //       message: "Failed to create activity",
// //       error: err.message,
// //     });
// //   } finally {
// //     client.release();
// //   }
// // });

// // MINIMAL insert – only activities table
// // server.js (or routes file)
// app.post("/api/activities", async (req, res) => {
//   try {
//     const {
//       farm_id,
//       zone_id,
//       date,
//       activity_type,
//       crop_id,
//       remarks,
//       created_by,
//       // inputs, workers ignored for now (we'll add later)
//     } = req.body;

//     // basic validation
//     if (!farm_id || !date || !activity_type) {
//       return res.status(400).json({
//         message: "farm_id, date and activity_type are required",
//       });
//     }

//     console.log("POST /api/activities body:", req.body);

//     const result = await pool.query(
//       `
//       INSERT INTO activities
//         (farm_id, zone_id, date, activity_type, crop_id, remarks, created_by)
//       VALUES
//         ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *
//       `,
//       [
//         farm_id,
//         zone_id || null,
//         date,
//         activity_type,
//         crop_id || null,
//         remarks || null,
//         created_by || null,
//       ]
//     );

//     return res.status(201).json({
//       message: "Activity created successfully",
//       activity: result.rows[0],
//     });
//   } catch (err) {
//     console.error("POST /api/activities ERROR:", err.message);
//     console.error(err.stack);

//     // 🔴 IMPORTANT: include the DB error here
//     return res.status(500).json({
//       message: "Failed to create activity",
//       error: err.message,
//     });
//   }
// });

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// // create table in db using
// // psql postgresql://postgres:mukul123@localhost:5432/iit
// // DELETE FROM public.landmapping;



// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";           // PG Pool
import farmRoutes from "./routes/farmRoutes.js";
// ❌ REMOVE / COMMENT THIS FOR NOW
// import activityRoutes from "./routes/activities.js";
import plotsRouter from "./routes/plots.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ----------------------
// ROUTERS
// ----------------------

// Farm-related routes (from your farmRoutes.js)
// e.g. if inside farmRoutes you have router.get("/farms", ...)
app.use("/api", farmRoutes);

// Plot / land mapping routes
app.use("/api", plotsRouter);

// ❌ DO NOT MOUNT activityRoutes NOW
// app.use("/api/activities", activityRoutes);

// You also had this; it's redundant but harmless. You can keep or remove.
// app.use("/api/farms", farmRoutes);

// ----------------------
// HEALTH CHECK
// ----------------------
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error("HEALTH ERROR:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ----------------------
// 1. FARMS + ZONES
// ----------------------

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

// ----------------------
// 2. INPUTS
// ----------------------
app.get("/api/inputs", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, type, unit_default, created_at FROM inputs ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/inputs error:", err.message);
    res.status(500).json({
      message: "Failed to fetch inputs",
      error: err.message,
    });
  }
});

// ----------------------
// 3. CROPS
// ----------------------
app.get("/api/crops", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crops ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/crops error", err);
    res.status(500).json({ message: "Failed to fetch crops" });
  }
});

// ----------------------
// 4. WORKERS
// ----------------------
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

// ----------------------
// 5. ACTIVITIES (MINIMAL)
// ----------------------
app.post("/api/activities", async (req, res) => {
  try {
    const {
      farm_id,
      zone_id,
      date,
      activity_type,
      crop_id,
      remarks,
      created_by,
      // inputs, workers are ignored for now
    } = req.body;

    // Basic validation
    if (!farm_id || !date || !activity_type) {
      return res.status(400).json({
        message: "farm_id, date and activity_type are required",
      });
    }

    console.log("POST /api/activities body:", req.body);

    const result = await pool.query(
      `
      INSERT INTO activities
        (farm_id, zone_id, date, activity_type, crop_id, remarks, created_by)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        farm_id,
        zone_id || null,
        date,
        activity_type,
        crop_id || null,
        remarks || null,
        created_by || null,
      ]
    );

    return res.status(201).json({
      message: "Activity created successfully",
      activity: result.rows[0],
    });
  } catch (err) {
    console.error("POST /api/activities ERROR:", err.message);
    console.error(err.stack);

    return res.status(500).json({
      message: "Failed to create activity",
      error: err.message,
    });
  }
});

// ----------------------
// SERVER START
// ----------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
