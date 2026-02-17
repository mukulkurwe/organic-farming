// // backend/routes/supervisorRoutes.js
// import express from "express";
// import pool from "../config/db.js";

// const router = express.Router();

// /**
//  * GET /api/supervisor/activities/month?farm_id=1&month=2025-03
//  * Returns all activities for a farm within a month.
//  */
// router.get("/activities/month", async (req, res) => {
//   try {
//     const { farm_id, month } = req.query;

//     if (!farm_id || !month) {
//       return res.status(400).json({
//         message: "farm_id and month (YYYY-MM) are required",
//       });
//     }

//     const monthStart = `${month}-01`;

//     const result = await pool.query(
//       `
//       SELECT
//         a.id,
//         a.date,
//         a.activity_type,
//         a.remarks,
//         a.farm_id,
//         a.zone_id,
//         a.crop_id,
//         z.name AS zone_name,
//         c.name AS crop_name
//       FROM activities a
//       LEFT JOIN zones z ON a.zone_id = z.id
//       LEFT JOIN crops c ON a.crop_id = c.id
//       WHERE a.farm_id = $1
//         AND a.date >= $2::date
//         AND a.date < ($2::date + INTERVAL '1 month')
//       ORDER BY a.date, a.id
//       `,
//       [farm_id, monthStart]
//     );

//     return res.json(result.rows);
//   } catch (err) {
//     console.error("GET /supervisor/activities/month ERROR:", err.message);
//     console.error(err.stack);
//     return res.status(500).json({
//       message: "Failed to fetch monthly activities",
//       error: err.message,
//     });
//   }
// });

// export default router;


// backend/routes/supervisorRoutes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET /api/supervisor/activities/month?farm_id=1&month=2025-03
 * Returns all activities for a farm within a month
 * + includes inputs[] and workers[]
 */
router.get("/activities/month", async (req, res) => {
  try {
    const { farm_id, month } = req.query;

    if (!farm_id || !month) {
      return res.status(400).json({
        message: "farm_id and month (YYYY-MM) are required",
      });
    }

    const monthStart = `${month}-01`;

    const result = await pool.query(
      `
      SELECT
        a.id,
        to_char(a.date, 'YYYY-MM-DD') AS date,
        a.created_at,
        a.activity_type,
        a.remarks,
        a.farm_id,
        a.zone_id,
        a.crop_id,

        z.name AS zone_name,
        c.name AS crop_name,

        -- ✅ inputs array
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', i.id,
              'name', i.name,
              'type', i.type,
              'quantity', ai.quantity,
              'unit', ai.unit,
              'method', ai.method
            )
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS inputs,

        -- ✅ workers array
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', w.id,
              'name', w.name
            )
          ) FILTER (WHERE w.id IS NOT NULL),
          '[]'::json
        ) AS workers

      FROM activities a
      LEFT JOIN zones z ON a.zone_id = z.id
      LEFT JOIN crops c ON a.crop_id = c.id

      LEFT JOIN activity_inputs ai ON ai.activity_id = a.id
      LEFT JOIN inputs i ON i.id = ai.input_id

      LEFT JOIN activity_workers aw ON aw.activity_id = a.id
      LEFT JOIN workers w ON w.id = aw.worker_id

      WHERE a.farm_id = $1
        AND a.date >= $2::date
        AND a.date < ($2::date + INTERVAL '1 month')

      GROUP BY a.id, z.name, c.name
      ORDER BY a.date, a.created_at;
      `,
      [farm_id, monthStart]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("GET /supervisor/activities/month ERROR:", err.message);
    console.error(err.stack);
    return res.status(500).json({
      message: "Failed to fetch monthly activities",
      error: err.message,
    });
  }
});

export default router;
