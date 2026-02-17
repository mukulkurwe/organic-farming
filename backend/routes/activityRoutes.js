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

// GET /api/activities/report?farm_id=&from=&to=
// Returns a comprehensive report summary
router.get("/report", async (req, res) => {
  try {
    const { farm_id, from, to } = req.query;

    const conditions = [];
    const params = [];

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`a.farm_id = $${params.length}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`a.date >= $${params.length}::date`);
    }
    if (to) {
      params.push(to);
      conditions.push(`a.date <= $${params.length}::date`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // 1) Total activities
    const totalRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM activities a ${whereClause}`,
      params
    );

    // 2) By activity type
    const byTypeRes = await pool.query(
      `SELECT a.activity_type, COUNT(*)::int AS count
       FROM activities a ${whereClause}
       GROUP BY a.activity_type ORDER BY count DESC`,
      params
    );

    // 3) By zone
    const byZoneRes = await pool.query(
      `SELECT COALESCE(z.name, 'No Zone') AS zone_name, COUNT(*)::int AS count
       FROM activities a
       LEFT JOIN zones z ON a.zone_id = z.id
       ${whereClause}
       GROUP BY z.name ORDER BY count DESC`,
      params
    );

    // 4) By crop
    const byCropRes = await pool.query(
      `SELECT COALESCE(c.name, 'No Crop') AS crop_name, COUNT(*)::int AS count
       FROM activities a
       LEFT JOIN crops c ON a.crop_id = c.id
       ${whereClause}
       GROUP BY c.name ORDER BY count DESC`,
      params
    );

    // 5) By month
    const byMonthRes = await pool.query(
      `SELECT TO_CHAR(a.date, 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM activities a ${whereClause}
       GROUP BY month ORDER BY month`,
      params
    );

    // 6) Inputs used
    const inputsRes = await pool.query(
      `SELECT i.name AS input_name, i.type AS input_type,
              COUNT(*)::int AS times_used,
              COALESCE(SUM(ai.quantity), 0)::numeric AS total_quantity,
              ai.unit
       FROM activity_inputs ai
       JOIN inputs i ON ai.input_id = i.id
       JOIN activities a ON ai.activity_id = a.id
       ${whereClause}
       GROUP BY i.name, i.type, ai.unit
       ORDER BY times_used DESC`,
      params
    );

    // 7) Worker participation
    const workersRes = await pool.query(
      `SELECT w.name AS worker_name,
              COUNT(*)::int AS tasks_assigned,
              COALESCE(SUM(aw.hours), 0)::numeric AS total_hours
       FROM activity_workers aw
       JOIN workers w ON aw.worker_id = w.id
       JOIN activities a ON aw.activity_id = a.id
       ${whereClause}
       GROUP BY w.name
       ORDER BY tasks_assigned DESC`,
      params
    );

    // 8) Recent activities (latest 10)
    const recentRes = await pool.query(
      `SELECT a.id, a.date, a.activity_type, a.remarks,
              f.name AS farm_name, z.name AS zone_name, c.name AS crop_name
       FROM activities a
       LEFT JOIN farms f ON a.farm_id = f.id
       LEFT JOIN zones z ON a.zone_id = z.id
       LEFT JOIN crops c ON a.crop_id = c.id
       ${whereClause}
       ORDER BY a.date DESC, a.id DESC
       LIMIT 10`,
      params
    );

    res.json({
      total: totalRes.rows[0].total,
      by_type: byTypeRes.rows,
      by_zone: byZoneRes.rows,
      by_crop: byCropRes.rows,
      by_month: byMonthRes.rows,
      inputs_used: inputsRes.rows,
      worker_participation: workersRes.rows,
      recent_activities: recentRes.rows,
    });
  } catch (err) {
    console.error("GET /activities/report error:", err.message);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

export default router;
