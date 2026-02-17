// src/controllers/activityController.js
import pool from "../config/db.js";

// POST /api/activities
export const createActivity = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      farm_id,
      zone_id,
      date,
      activity_type,
      crop_id,
      remarks,
      created_by,
      inputs = [],
      workers = [],
    } = req.body;

    await client.query("BEGIN");

    const activityResult = await client.query(
      `INSERT INTO activities
       (farm_id, zone_id, date, activity_type, crop_id, remarks, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [farm_id, zone_id, date, activity_type, crop_id || null, remarks || null, created_by]
    );

    const activity = activityResult.rows[0];

    // inputs
    for (const inp of inputs) {
      const { input_id, quantity, unit, method } = inp;
      await client.query(
        `INSERT INTO activity_inputs (activity_id, input_id, quantity, unit, method)
         VALUES ($1,$2,$3,$4,$5)`,
        [activity.id, input_id, quantity, unit, method]
      );
    }

    // workers
    for (const worker of workers) {
      const { worker_id, hours } = worker;
      await client.query(
        `INSERT INTO activity_workers (activity_id, worker_id, hours)
         VALUES ($1,$2,$3)`,
        [activity.id, worker_id, hours || null]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(activity);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createActivity error", err);
    res.status(500).json({ message: "Failed to create activity" });
  } finally {
    client.release();
  }
};

// GET /api/activities?farm_id=&date=&from=&to=&zone_id=&activity_type=&worker_id=
export const getActivities = async (req, res) => {
  try {
    const {
      farm_id,
      date,
      from,
      to,
      zone_id,
      activity_type,
      worker_id,
    } = req.query;

    const conditions = [];
    const params = [];

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`a.farm_id = $${params.length}`);
    }
    if (date) {
      params.push(date);
      conditions.push(`a.date = $${params.length}`);
    }
    if (from && to) {
      params.push(from);
      params.push(to);
      conditions.push(`a.date BETWEEN $${params.length - 1} AND $${params.length}`);
    }
    if (zone_id) {
      params.push(zone_id);
      conditions.push(`a.zone_id = $${params.length}`);
    }
    if (activity_type) {
      params.push(activity_type);
      conditions.push(`a.activity_type = $${params.length}`);
    }
    if (worker_id) {
      params.push(worker_id);
      conditions.push(
        `EXISTS (SELECT 1 FROM activity_workers aw WHERE aw.activity_id = a.id AND aw.worker_id = $${params.length})`
      );
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT a.*, z.name AS zone_name, c.name AS crop_name
       FROM activities a
       LEFT JOIN zones z ON a.zone_id = z.id
       LEFT JOIN crops c ON a.crop_id = c.id
       ${whereClause}
       ORDER BY a.date DESC, a.id DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getActivities error", err);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// GET /api/activities/calendar?farm_id=&from=&to=&zone_id=&activity_type=&worker_id=
export const getCalendarAgg = async (req, res) => {
  try {
    const { farm_id, from, to, zone_id, activity_type, worker_id } = req.query;

    const conditions = [];
    const params = [];

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`a.farm_id = $${params.length}`);
    }
    if (from && to) {
      params.push(from);
      params.push(to);
      conditions.push(`a.date BETWEEN $${params.length - 1} AND $${params.length}`);
    }
    if (zone_id) {
      params.push(zone_id);
      conditions.push(`a.zone_id = $${params.length}`);
    }
    if (activity_type) {
      params.push(activity_type);
      conditions.push(`a.activity_type = $${params.length}`);
    }
    if (worker_id) {
      params.push(worker_id);
      conditions.push(
        `EXISTS (SELECT 1 FROM activity_workers aw WHERE aw.activity_id = a.id AND aw.worker_id = $${params.length})`
      );
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT
         a.date,
         COUNT(*) AS total_activities,
         jsonb_object_agg(a.activity_type, cnt_by_type) AS by_type
       FROM (
         SELECT
           date,
           activity_type,
           COUNT(*) AS cnt_by_type
         FROM activities
         ${whereClause}
         GROUP BY date, activity_type
       ) a
       GROUP BY a.date
       ORDER BY a.date`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getCalendarAgg error", err);
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
};
