


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
    const { owner_id } = req.query;
    let query = "SELECT * FROM farms";
    const params = [];

    if (owner_id) {
      query += " WHERE owner_id = $1";
      params.push(owner_id);
    }

    query += " ORDER BY created_at DESC, id DESC";
    const result = await pool.query(query, params);
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
   CREATE ZONE FOR A FARM
   POST /api/farms/:id/zones
========================================== */
router.post("/farms/:id/zones", async (req, res) => {
  try {
    const farmId = req.params.id;
    const { name, area } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Zone name is required" });
    }

    const result = await pool.query(
      `INSERT INTO zones (farm_id, name, area)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [farmId, name.trim(), area || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /farms/:id/zones error:", err.message);
    res.status(500).json({ message: "Failed to create zone" });
  }
});

/* ==========================================
   DELETE ZONE
   DELETE /api/zones/:zoneId
========================================== */
router.delete("/zones/:zoneId", async (req, res) => {
  try {
    const { zoneId } = req.params;
    const result = await pool.query(
      "DELETE FROM zones WHERE id = $1 RETURNING *",
      [zoneId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Zone not found" });
    }
    res.json({ message: "Zone deleted", zone: result.rows[0] });
  } catch (err) {
    console.error("DELETE /zones/:zoneId error:", err.message);
    res.status(500).json({ message: "Failed to delete zone" });
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
