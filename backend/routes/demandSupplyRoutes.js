// backend/routes/demandSupplyRoutes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* ════════════════════════════════════════════════
   SUPPLY FORECASTS
════════════════════════════════════════════════ */

// GET /api/ds/forecasts  — optionally filter by farm_id or farmer_id
router.get("/forecasts", async (req, res) => {
  try {
    const { farm_id, farmer_id } = req.query;
    const conditions = [];
    const values = [];

    if (farm_id) { values.push(farm_id); conditions.push(`sf.farm_id = $${values.length}`); }
    if (farmer_id) { values.push(farmer_id); conditions.push(`sf.farmer_id = $${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT sf.*,
              f.name  AS farm_name,
              u.name  AS farmer_name
       FROM   supply_forecasts sf
       LEFT JOIN farms f ON f.id = sf.farm_id
       LEFT JOIN users u ON u.id = sf.farmer_id
       ${where}
       ORDER BY sf.expected_date ASC NULLS LAST, sf.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ds/forecasts error:", err.message);
    res.status(500).json({ message: "Failed to fetch forecasts" });
  }
});

// POST /api/ds/forecasts
router.post("/forecasts", async (req, res) => {
  try {
    const { farm_id, farmer_id, crop_id, crop_name, estimated_qty, unit, expected_date, notes } = req.body;
    if (!farm_id)    return res.status(400).json({ message: "farm_id is required" });
    if (!crop_name?.trim()) return res.status(400).json({ message: "crop_name is required" });
    if (!estimated_qty || Number(estimated_qty) <= 0) return res.status(400).json({ message: "Estimated quantity must be positive" });

    const result = await pool.query(
      `INSERT INTO supply_forecasts
         (farm_id, farmer_id, crop_id, crop_name, estimated_qty, unit, expected_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [farm_id, farmer_id || null, crop_id || null, crop_name.trim(),
       Number(estimated_qty), unit || "kg", expected_date || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /ds/forecasts error:", err.message);
    res.status(500).json({ message: "Failed to create forecast" });
  }
});

// PATCH /api/ds/forecasts/:id/status
router.patch("/forecasts/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["forecast", "available", "sold", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const result = await pool.query(
      `UPDATE supply_forecasts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Forecast not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /ds/forecasts/:id/status error:", err.message);
    res.status(500).json({ message: "Failed to update forecast status" });
  }
});

// DELETE /api/ds/forecasts/:id
router.delete("/forecasts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM supply_forecasts WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Forecast not found" });
    res.json({ message: "Forecast deleted" });
  } catch (err) {
    console.error("DELETE /ds/forecasts/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete forecast" });
  }
});

/* ════════════════════════════════════════════════
   DEMAND REQUESTS
════════════════════════════════════════════════ */

// GET /api/ds/demands  — filter by status or crop_name
router.get("/demands", async (req, res) => {
  try {
    const { status, crop_name } = req.query;
    const conditions = [];
    const values = [];

    if (status)    { values.push(status);    conditions.push(`dr.status = $${values.length}`); }
    if (crop_name) { values.push(`%${crop_name}%`); conditions.push(`dr.crop_name ILIKE $${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT dr.*,
              u.name  AS created_by_name
       FROM   demand_requests dr
       LEFT JOIN users u ON u.id = dr.created_by
       ${where}
       ORDER BY dr.deadline_date ASC NULLS LAST, dr.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ds/demands error:", err.message);
    res.status(500).json({ message: "Failed to fetch demand requests" });
  }
});

// GET /api/ds/demands/:id
router.get("/demands/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, u.name AS created_by_name
       FROM demand_requests dr
       LEFT JOIN users u ON u.id = dr.created_by
       WHERE dr.id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Demand request not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /ds/demands/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch demand request" });
  }
});

// POST /api/ds/demands
router.post("/demands", async (req, res) => {
  try {
    const {
      buyer_id, buyer_name, buyer_phone, buyer_type,
      crop_id, crop_name, quantity_needed, unit,
      price_offered, deadline_date, delivery_location, notes, created_by
    } = req.body;

    if (!buyer_name?.trim()) return res.status(400).json({ message: "buyer_name is required" });
    if (!crop_name?.trim())  return res.status(400).json({ message: "crop_name is required" });
    if (!quantity_needed || Number(quantity_needed) <= 0) return res.status(400).json({ message: "quantity_needed must be positive" });

    const result = await pool.query(
      `INSERT INTO demand_requests
         (buyer_id, buyer_name, buyer_phone, buyer_type, crop_id, crop_name,
          quantity_needed, unit, price_offered, deadline_date, delivery_location, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        buyer_id || null, buyer_name.trim(), buyer_phone || null,
        buyer_type || "individual", crop_id || null, crop_name.trim(),
        Number(quantity_needed), unit || "kg",
        price_offered ? Number(price_offered) : null,
        deadline_date || null, delivery_location || null, notes || null,
        created_by || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /ds/demands error:", err.message);
    res.status(500).json({ message: "Failed to create demand request" });
  }
});

// PATCH /api/ds/demands/:id/status
router.patch("/demands/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "matched", "fulfilled", "closed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const result = await pool.query(
      `UPDATE demand_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Demand request not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /ds/demands/:id/status error:", err.message);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// DELETE /api/ds/demands/:id
router.delete("/demands/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM demand_requests WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Demand request not found" });
    res.json({ message: "Demand request deleted" });
  } catch (err) {
    console.error("DELETE /ds/demands/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete demand request" });
  }
});

/* ════════════════════════════════════════════════
   SMART MATCHING
════════════════════════════════════════════════ */

// POST /api/ds/matches/auto  — auto-match supply forecasts to open demands
router.post("/matches/auto", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find open demands and find matching forecasts (same crop name, compatible dates)
    const demands = await client.query(
      `SELECT * FROM demand_requests WHERE status = 'open'`
    );

    const created = [];
    for (const demand of demands.rows) {
      const forecasts = await client.query(
        `SELECT sf.* FROM supply_forecasts sf
         WHERE LOWER(sf.crop_name) = LOWER($1)
           AND sf.status IN ('forecast','available')
           AND NOT EXISTS (
             SELECT 1 FROM demand_supply_matches m
             WHERE m.demand_id = $2 AND m.forecast_id = sf.id
           )`,
        [demand.crop_name, demand.id]
      );

      for (const forecast of forecasts.rows) {
        // Score: crop match=50, date feasible=30, qty adequate=20
        let score = 50;
        if (forecast.expected_date && demand.deadline_date) {
          if (new Date(forecast.expected_date) <= new Date(demand.deadline_date)) score += 30;
        } else {
          score += 15; // partial credit when no date constraint
        }
        if (Number(forecast.estimated_qty) >= Number(demand.quantity_needed)) score += 20;
        else score += 10; // partial qty

        const match = await client.query(
          `INSERT INTO demand_supply_matches (demand_id, forecast_id, match_score, status)
           VALUES ($1,$2,$3,'pending') RETURNING *`,
          [demand.id, forecast.id, score]
        );
        created.push(match.rows[0]);
      }
    }

    await client.query("COMMIT");
    res.json({ matches_created: created.length, matches: created });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /ds/matches/auto error:", err.message);
    res.status(500).json({ message: "Auto-match failed" });
  } finally {
    client.release();
  }
});

// GET /api/ds/matches  — filter by demand_id, forecast_id, status
router.get("/matches", async (req, res) => {
  try {
    const { demand_id, forecast_id, status } = req.query;
    const conditions = [];
    const values = [];

    if (demand_id)   { values.push(demand_id);   conditions.push(`m.demand_id = $${values.length}`); }
    if (forecast_id) { values.push(forecast_id); conditions.push(`m.forecast_id = $${values.length}`); }
    if (status)      { values.push(status);       conditions.push(`m.status = $${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT m.*,
              dr.crop_name       AS demand_crop,
              dr.buyer_name,
              dr.quantity_needed,
              dr.unit            AS demand_unit,
              dr.price_offered,
              dr.deadline_date,
              sf.crop_name       AS forecast_crop,
              sf.estimated_qty,
              sf.unit            AS forecast_unit,
              sf.expected_date,
              f.name             AS farm_name,
              u.name             AS farmer_name
       FROM   demand_supply_matches m
       LEFT JOIN demand_requests  dr ON dr.id = m.demand_id
       LEFT JOIN supply_forecasts sf ON sf.id = m.forecast_id
       LEFT JOIN farms f            ON f.id  = sf.farm_id
       LEFT JOIN users u            ON u.id  = sf.farmer_id
       ${where}
       ORDER BY m.match_score DESC, m.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ds/matches error:", err.message);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});

// PATCH /api/ds/matches/:id/status
router.patch("/matches/:id/status", async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "rejected", "fulfilled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    await client.query("BEGIN");

    const match = await client.query(
      `UPDATE demand_supply_matches SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (match.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Match not found" });
    }

    // When confirmed → mark demand as matched; when fulfilled → mark demand as fulfilled
    if (status === "confirmed" || status === "fulfilled") {
      const demandStatus = status === "fulfilled" ? "fulfilled" : "matched";
      await client.query(
        `UPDATE demand_requests SET status = $1, updated_at = NOW() WHERE id = $2`,
        [demandStatus, match.rows[0].demand_id]
      );
    }

    await client.query("COMMIT");
    res.json(match.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PATCH /ds/matches/:id/status error:", err.message);
    res.status(500).json({ message: "Failed to update match status" });
  } finally {
    client.release();
  }
});

/* ════════════════════════════════════════════════
   ANALYTICS REPORT (Admin)
════════════════════════════════════════════════ */

// GET /api/ds/report
router.get("/report", async (req, res) => {
  try {
    const [supplyByCrop, demandByCrop, matchStats, openDemands, recentForecasts] =
      await Promise.all([
        // Total supply (forecast) per crop
        pool.query(
          `SELECT crop_name,
                  COUNT(*)                            AS forecast_count,
                  SUM(estimated_qty)                  AS total_supply,
                  unit,
                  COUNT(*) FILTER (WHERE status = 'forecast')  AS status_forecast,
                  COUNT(*) FILTER (WHERE status = 'available') AS status_available,
                  COUNT(*) FILTER (WHERE status = 'sold')      AS status_sold
           FROM supply_forecasts
           GROUP BY crop_name, unit
           ORDER BY total_supply DESC
           LIMIT 20`
        ),

        // Total demand per crop
        pool.query(
          `SELECT crop_name,
                  COUNT(*)                            AS demand_count,
                  SUM(quantity_needed)                AS total_demand,
                  unit,
                  AVG(price_offered)                  AS avg_price_offered,
                  COUNT(*) FILTER (WHERE status = 'open')      AS open_count,
                  COUNT(*) FILTER (WHERE status = 'fulfilled') AS fulfilled_count
           FROM demand_requests
           GROUP BY crop_name, unit
           ORDER BY total_demand DESC
           LIMIT 20`
        ),

        // Match summary
        pool.query(
          `SELECT
             COUNT(*)                                           AS total_matches,
             COUNT(*) FILTER (WHERE status = 'pending')        AS pending,
             COUNT(*) FILTER (WHERE status = 'confirmed')      AS confirmed,
             COUNT(*) FILTER (WHERE status = 'rejected')       AS rejected,
             COUNT(*) FILTER (WHERE status = 'fulfilled')      AS fulfilled,
             ROUND(AVG(match_score), 1)                        AS avg_score
           FROM demand_supply_matches`
        ),

        // Urgent open demands (deadline within 30 days)
        pool.query(
          `SELECT dr.*, u.name AS created_by_name
           FROM demand_requests dr
           LEFT JOIN users u ON u.id = dr.created_by
           WHERE dr.status = 'open'
           ORDER BY dr.deadline_date ASC NULLS LAST
           LIMIT 10`
        ),

        // Recent forecasts
        pool.query(
          `SELECT sf.*, f.name AS farm_name, u.name AS farmer_name
           FROM supply_forecasts sf
           LEFT JOIN farms f ON f.id = sf.farm_id
           LEFT JOIN users u ON u.id = sf.farmer_id
           WHERE sf.status != 'cancelled'
           ORDER BY sf.created_at DESC
           LIMIT 10`
        ),
      ]);

    // Gap analysis: crops in demand but no supply forecast
    const demandCrops = new Set(demandByCrop.rows.map(r => r.crop_name.toLowerCase()));
    const supplyCrops = new Set(supplyByCrop.rows.map(r => r.crop_name.toLowerCase()));

    const unmetDemand = demandByCrop.rows.filter(r => !supplyCrops.has(r.crop_name.toLowerCase()));
    const surplusSupply = supplyByCrop.rows.filter(r => !demandCrops.has(r.crop_name.toLowerCase()));

    // Combined gap view for charting
    const allCrops = new Set([...demandCrops, ...supplyCrops]);
    const gapAnalysis = [...allCrops].map(crop => {
      const supply = supplyByCrop.rows.find(r => r.crop_name.toLowerCase() === crop);
      const demand = demandByCrop.rows.find(r => r.crop_name.toLowerCase() === crop);
      return {
        crop_name: supply?.crop_name || demand?.crop_name || crop,
        total_supply: Number(supply?.total_supply || 0),
        total_demand: Number(demand?.total_demand || 0),
        gap: Number(demand?.total_demand || 0) - Number(supply?.total_supply || 0),
      };
    }).sort((a, b) => b.total_demand - a.total_demand);

    res.json({
      supply_by_crop:    supplyByCrop.rows,
      demand_by_crop:    demandByCrop.rows,
      match_stats:       matchStats.rows[0],
      open_demands:      openDemands.rows,
      recent_forecasts:  recentForecasts.rows,
      unmet_demand:      unmetDemand,
      surplus_supply:    surplusSupply,
      gap_analysis:      gapAnalysis,
    });
  } catch (err) {
    console.error("GET /ds/report error:", err.message);
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

export default router;
