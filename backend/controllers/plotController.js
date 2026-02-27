// controllers/plotController.js
import pool from "../config/db.js";

/* ============================
   GET ALL PLOTS FOR A FARM
============================ */
export const getPlotsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    const result = await pool.query(
      `SELECT id, farm_id, polygon, crop, area, slope_percent, risk_level
       FROM plots
       WHERE farm_id = $1
       ORDER BY id`,
      [Number(farmId)]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET PLOTS ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch plots" });
  }
};

/* ============================
   CREATE NEW PLOT
============================ */
export const createPlot = async (req, res) => {
  try {
    const { farmId } = req.params;

    // body sent from React
    const polygon = req.body.polygon || req.body.boundary;
    const { crop, area, slope_percent, risk_level } = req.body;

    // Basic validation
    if (!Array.isArray(polygon) || polygon.length < 3) {
      return res.status(400).json({ message: "polygon must have at least 3 points" });
    }

    const parsedArea =
      area === undefined || area === null || Number.isNaN(Number(area))
        ? null
        : Number(area);

    const parsedSlope =
      slope_percent === undefined || slope_percent === null || Number.isNaN(Number(slope_percent))
        ? null
        : Number(slope_percent);

    const result = await pool.query(
      `INSERT INTO plots (farm_id, polygon, crop, area, slope_percent, risk_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, farm_id, polygon, crop, area, slope_percent, risk_level`,
      [
        Number(farmId),
        JSON.stringify(polygon),
        crop || null,
        parsedArea,
        parsedSlope,
        risk_level || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE PLOT ERROR:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to create plot", error: error.message });
  }
};