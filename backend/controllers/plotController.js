// controllers/plotController.js
import pool from "../config/db.js";

/* ============================
   GET ALL PLOTS FOR A FARM
============================ */
export const getPlotsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    const result = await pool.query(
      `SELECT id, farm_id, polygon, crop, area, slope_percent, risk_level, created_at
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

    // NOTE: support both "polygon" and "boundary" from frontend
    const polygon = req.body.polygon || req.body.boundary;
    const { crop, area, slope_percent, risk_level } = req.body;

    if (!polygon) {
      return res.status(400).json({ message: "polygon (or boundary) is required" });
    }

    // INSERT using your real columns
    const result = await pool.query(
      `INSERT INTO plots (farm_id, polygon, crop, area, slope_percent, risk_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, farm_id, polygon, crop, area, slope_percent, risk_level, created_at`,
      [
        Number(farmId),
        JSON.stringify(polygon),
        crop || null,
        area != null ? Number(area) : null,
        slope_percent != null ? Number(slope_percent) : null,
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

/* ============================
   DELETE PLOT (optional)
============================ */
export const deletePlot = async (req, res) => {
  try {
    const { plotId } = req.params;

    await pool.query(`DELETE FROM plots WHERE id = $1`, [Number(plotId)]);

    return res.json({ message: "Plot deleted ✅" });
  } catch (error) {
    console.error("DELETE PLOT ERROR:", error.message);
    return res.status(500).json({ message: "Failed to delete plot" });
  }
};