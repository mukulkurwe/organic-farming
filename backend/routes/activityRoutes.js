// backend/routes/activityRoutes.js
import express from "express";
import {
  createActivity,
  getActivities,
  getCalendarAgg,
} from "../controllers/activityController.js";

const router = express.Router();

// POST /api/activities  (with inputs + workers in a transaction)
router.post("/", createActivity);

// GET /api/activities?farm_id=&date=&from=&to=&zone_id=&activity_type=&worker_id=
router.get("/", getActivities);

// GET /api/activities/calendar?farm_id=&from=&to=
router.get("/calendar", getCalendarAgg);

// GET /api/activities/as-events?farm_id=&month=YYYY-MM
// Returns activities shaped like calendar_events so the AgriCalendar component can render them
import pool from "../config/db.js";

const ACTIVITY_COLORS = {
  sowing: "#22c55e",
  transplanting: "#16a34a",
  irrigation: "#3b82f6",
  pest_spray: "#ef4444",
  biofertilizer: "#a16207",
  weeding: "#eab308",
  harvest: "#f97316",
  other: "#6b7280",
};

router.get("/as-events", async (req, res) => {
  try {
    const { farm_id, month } = req.query;

    const conditions = [];
    const params = [];

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`a.farm_id = $${params.length}`);
    }

    if (month) {
      const monthStart = `${month}-01`;
      params.push(monthStart);
      conditions.push(
        `a.date >= $${params.length}::date AND a.date < ($${params.length}::date + INTERVAL '1 month')`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT a.id, a.date, a.activity_type, a.remarks,
              f.name AS farm_name, z.name AS zone_name, c.name AS crop_name
       FROM activities a
       LEFT JOIN farms f ON a.farm_id = f.id
       LEFT JOIN zones z ON a.zone_id = z.id
       LEFT JOIN crops c ON a.crop_id = c.id
       ${whereClause}
       ORDER BY a.date, a.id`,
      params
    );

    // Shape like calendar_events so AgriCalendar can render them
    const events = result.rows.map((r) => ({
      id: `activity-${r.id}`,
      event_title: `${r.activity_type.replace(/_/g, " ")}${r.crop_name ? " – " + r.crop_name : ""}${r.zone_name ? " (" + r.zone_name + ")" : ""}`,
      event_date: r.date,
      event_type: "activity",
      event_color: ACTIVITY_COLORS[r.activity_type] || "#6b7280",
      is_completed: false,
      notes: r.remarks,
      farm_name: r.farm_name,
      source: "activity",
    }));

    res.json(events);
  } catch (err) {
    console.error("GET /activities/as-events error:", err.message);
    res.status(500).json({ message: "Failed to fetch activity events" });
  }
});

export default router;
