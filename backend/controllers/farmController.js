// controllers/farmController.js (or similar)
import pool from "../config/db.js";

/* ============================
   GET FARM BOUNDARY
============================ */
export const getFarmBoundary = async (req, res) => {
  try {
    const { farmId } = req.params;

    const result = await pool.query(
      `SELECT id, name, location, total_area, boundary
       FROM farms
       WHERE id = $1`,
      [farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // You can return only boundary, but including other fields is often useful
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("GET FARM BOUNDARY ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch farm boundary" });
  }
};