// backend/routes/plots.js
import express from "express";
import pool from "../config/db.js";
import * as turf from "@turf/turf";

const router = express.Router();

function calculateAreaAcres(polygon) {
  const coords = polygon.map(p => [p.lng, p.lat]);
  coords.push(coords[0]);
  const poly = turf.polygon([coords]);
  const sqm = turf.area(poly);
  return Number((sqm / 4046.86).toFixed(2));
}

// GET /api/farms/:farmId/boundary
router.get("/farms/:farmId/boundary", async (req, res) => {
  const { farmId } = req.params;

  const result = await pool.query(
    "SELECT boundary FROM farms WHERE id = $1",
    [farmId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Farm not found" });
  }
  res.json(result.rows[0]); // { boundary: [...] }
});

// GET /api/farms/:farmId/plots
router.get("/farms/:farmId/plots", async (req, res) => {
  const { farmId } = req.params;

  const result = await pool.query(
    "SELECT * FROM plots WHERE farm_id = $1 ORDER BY id",
    [farmId]
  );

  res.json(result.rows);
});

// POST /api/farms/:farmId/plots
router.post("/farms/:farmId/plots", async (req, res) => {
  try {
    const { farmId } = req.params;
    const { polygon, crop } = req.body;

    if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
      return res.status(400).json({ message: "Invalid plot polygon" });
    }
    if (!crop) {
      return res.status(400).json({ message: "Crop is required" });
    }

    const area = calculateAreaAcres(polygon);

    const result = await pool.query(
      `INSERT INTO plots (farm_id, polygon, crop, area)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farmId, JSON.stringify(polygon), crop, area]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE PLOT ERROR:", error);
    res.status(500).json({ message: "Failed to create plot" });
  }
});

export default router;
