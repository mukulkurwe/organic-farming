// backend/routes/calendarRoutes.js
import express from "express";
import pool from "../config/db.js";
import { recommendCrops } from "../services/cropRecommendationEngine.js";
import { generateCalendar } from "../services/calendarGenerator.js";

const router = express.Router();

/* ==========================================
   GET /api/calendar/farmer/profile
   Returns farmer profile (uses query param ?user_id= or defaults to first farmer)
========================================== */
router.get("/farmer/profile", async (req, res) => {
  try {
    const { user_id } = req.query;

    let result;
    if (user_id) {
      result = await pool.query(
        "SELECT * FROM farmer_profiles WHERE user_id = $1",
        [user_id],
      );
    } else {
      // Default: return first farmer profile (for MVP / demo)
      result = await pool.query(
        "SELECT * FROM farmer_profiles ORDER BY id LIMIT 1",
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /calendar/farmer/profile ERROR:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch farmer profile", error: err.message });
  }
});

/* ==========================================
   GET /api/calendar/crops/recommend
   Query params: soil_type, season, irrigation_type, state
   Returns ranked crop list
========================================== */
router.get("/crops/recommend", async (req, res) => {
  try {
    const { soil_type, season, irrigation_type, state } = req.query;

    const crops = await recommendCrops({
      soil_type,
      season,
      irrigation_type,
      state,
    });

    res.json(crops);
  } catch (err) {
    console.error("GET /calendar/crops/recommend ERROR:", err.message);
    res
      .status(500)
      .json({ message: "Failed to recommend crops", error: err.message });
  }
});

/* ==========================================
   GET /api/calendar/events
   Query params: farmer_id (required), month (YYYY-MM), event_type (optional)
   Returns calendar events for that month
========================================== */
router.get("/events", async (req, res) => {
  try {
    const { farmer_id, month, event_type } = req.query;

    if (!farmer_id) {
      return res.status(400).json({ message: "farmer_id is required" });
    }

    let query = `
      SELECT ce.*, c.name AS crop_name, c.local_name,
             ct.input_required, ct.quantity_per_acre, ct.duration_hours, ct.priority
      FROM calendar_events ce
      LEFT JOIN crops c ON ce.crop_id = c.id
      LEFT JOIN crop_task_templates ct ON ce.task_template_id = ct.id
      WHERE ce.farmer_id = $1
    `;
    const params = [farmer_id];
    let paramIdx = 2;

    if (month) {
      const monthStart = `${month}-01`;
      query += ` AND ce.event_date >= $${paramIdx}::date AND ce.event_date < ($${paramIdx}::date + INTERVAL '1 month')`;
      params.push(monthStart);
      paramIdx++;
    }

    if (event_type) {
      query += ` AND ce.event_type = $${paramIdx}`;
      params.push(event_type);
      paramIdx++;
    }

    query += " ORDER BY ce.event_date, ce.id";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /calendar/events ERROR:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch calendar events", error: err.message });
  }
});

/* ==========================================
   POST /api/calendar/generate
   Body: { farmer_id, crop_id, sowing_date }
   Creates a crop plan + generates all calendar events
========================================== */
router.post("/generate", async (req, res) => {
  try {
    const { farmer_id, crop_id, sowing_date } = req.body;

    if (!farmer_id || !crop_id || !sowing_date) {
      return res.status(400).json({
        message: "farmer_id, crop_id, and sowing_date are required",
      });
    }

    const { plan, events } = await generateCalendar({
      farmer_id,
      crop_id,
      sowing_date,
    });

    res.status(201).json({
      message: "Calendar generated successfully",
      plan,
      events,
    });
  } catch (err) {
    console.error("POST /calendar/generate ERROR:", err.message);
    res
      .status(500)
      .json({ message: "Failed to generate calendar", error: err.message });
  }
});

/* ==========================================
   PATCH /api/calendar/events/:id/complete
   Marks a calendar event as completed
========================================== */
router.patch("/events/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE calendar_events
       SET is_completed = TRUE, completed_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event marked as completed",
      event: result.rows[0],
    });
  } catch (err) {
    console.error("PATCH /calendar/events/:id/complete ERROR:", err.message);
    res
      .status(500)
      .json({ message: "Failed to complete event", error: err.message });
  }
});

export default router;
