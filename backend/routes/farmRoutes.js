


// import express from "express";
// import {
//   createFarm,
//   saveFarmBoundary,
//   // recalculateFarmMetrics
// } from "../controllers/landmapping.js";

// const router = express.Router();

// // Create farm
// router.post("/farms", createFarm);

// // Save boundary
// router.put("/farms/:farmId/boundary", saveFarmBoundary);

// // Auto calculate area / slope / risk
// // router.post("/farms/:farmId/recalculate", recalculateFarmMetrics);

// export default router;


import express from "express";
import pool from "../config/db.js";
import {
  createFarm,
  saveFarmBoundary,
  // recalculateFarmMetrics
} from "../controllers/landmapping.js";

const router = express.Router();

/* ==========================================
   CREATE FARM
   POST /api/farms
========================================== */
router.post("/farms", createFarm);

/* ==========================================
   GET ALL FARMS
   GET /api/farms
========================================== */
router.get("/farms", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM farms ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
  console.error("❌ /api/farms error:", err);
  return res.status(500).json({ message: "Failed to fetch farms", error: err.message });
}
});

/* ==========================================
   GET ZONES BY FARM
   GET /api/farms/:id/zones
========================================== */
router.get("/farms/:id/zones", async (req, res) => {
  try {
    const farmId = req.params.id;

    const result = await pool.query(
      "SELECT * FROM zones WHERE farm_id = $1 ORDER BY id",
      [farmId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /farms/:id/zones error:", err.message);
    res.status(500).json({
      message: "Failed to fetch zones",
    });
  }
});

/* ==========================================
   SAVE FARM BOUNDARY
   PUT /api/farms/:farmId/boundary
========================================== */
router.put("/farms/:farmId/boundary", saveFarmBoundary);

/* ==========================================
   OPTIONAL RECALCULATE
========================================== */
// router.post("/farms/:farmId/recalculate", recalculateFarmMetrics);

export default router;
