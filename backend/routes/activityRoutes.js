// backend/routes/activityRoutes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// POST /api/activities
router.post("/", async (req, res) => {
  try {
    const {
      farm_id,
      zone_id,
      date,
      activity_type,
      crop_id,
      remarks,
      created_by,
    } = req.body;

    if (!farm_id || !date || !activity_type) {
      return res.status(400).json({
        message: "farm_id, date and activity_type are required",
      });
    }

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

    res.status(201).json({
      message: "Activity created successfully",
      activity: result.rows[0],
    });
  } catch (err) {
    console.error("POST /api/activities ERROR:", err.message);
    res.status(500).json({
      message: "Failed to create activity",
      error: err.message,
    });
  }
});

export default router;
