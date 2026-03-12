// backend/routes/salesRoutes.js
import express from "express";
import pool from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/* ================================================
   BUYERS
================================================ */

// GET /api/sales/buyers
router.get("/buyers", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM buyers ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /sales/buyers error:", err.message);
    res.status(500).json({ message: "Failed to fetch buyers" });
  }
});

// POST /api/sales/buyers
router.post("/buyers", authenticate, async (req, res) => {
  try {
    const { name, phone, location, buyer_type } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Buyer name is required" });
    }
    const result = await pool.query(
      `INSERT INTO buyers (name, phone, location, buyer_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), phone || null, location || null, buyer_type || "retail"],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /sales/buyers error:", err.message);
    res.status(500).json({ message: "Failed to create buyer" });
  }
});

// DELETE /api/sales/buyers/:id
router.delete("/buyers/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM buyers WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    res.json({ message: "Buyer deleted" });
  } catch (err) {
    console.error("DELETE /sales/buyers/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete buyer" });
  }
});

/* ================================================
   PRODUCE LISTINGS
================================================ */

// GET /api/sales/listings?farm_id=&status=
router.get("/listings", authenticate, async (req, res) => {
  try {
    const { farm_id, status } = req.query;
    const conditions = [];
    const params = [];

    params.push(req.user.userId);
    conditions.push(`f.owner_id = $${params.length}`);

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`pl.farm_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`pl.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT pl.*, f.name AS farm_name, c.name AS crop_name_ref
       FROM produce_listings pl
       LEFT JOIN farms f ON pl.farm_id = f.id
       LEFT JOIN crops c ON pl.crop_id = c.id
       ${where}
       ORDER BY pl.created_at DESC`,
      params,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /sales/listings error:", err.message);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

// POST /api/sales/listings
router.post("/listings", authenticate, async (req, res) => {
  try {
    const {
      farm_id,
      crop_id,
      crop_name,
      quantity_kg,
      price_per_kg,
      unit,
      harvest_date,
      notes,
    } = req.body;

    const created_by = req.user?.userId;

    if (!farm_id)
      return res.status(400).json({ message: "farm_id is required" });
    if (!crop_name || !crop_name.trim())
      return res.status(400).json({ message: "Crop name is required" });
    if (!quantity_kg || quantity_kg <= 0)
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    if (!price_per_kg || price_per_kg <= 0)
      return res.status(400).json({ message: "Price must be greater than 0" });

    const farmCheck = await pool.query(
      `SELECT id FROM farms WHERE id = $1 AND owner_id = $2`,
      [farm_id, created_by],
    );

    if (farmCheck.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You do not have access to this farm" });
    }

    const result = await pool.query(
      `INSERT INTO produce_listings
        (farm_id, crop_id, crop_name, quantity_kg, quantity_available, price_per_kg, unit, harvest_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        farm_id,
        crop_id || null,
        crop_name.trim(),
        quantity_kg,
        price_per_kg,
        unit || "kg",
        harvest_date || null,
        notes || null,
        created_by || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /sales/listings error:", err.message);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

// PATCH /api/sales/listings/:id
router.patch("/listings/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_available, price_per_kg, status, notes } = req.body;

    const listingCheck = await pool.query(
      `SELECT pl.id
       FROM produce_listings pl
       JOIN farms f ON pl.farm_id = f.id
       WHERE pl.id = $1 AND f.owner_id = $2`,
      [id, req.user.userId],
    );

    if (listingCheck.rowCount === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const result = await pool.query(
      `UPDATE produce_listings
       SET
         quantity_available = COALESCE($1, quantity_available),
         price_per_kg       = COALESCE($2, price_per_kg),
         status             = COALESCE($3, status),
         notes              = COALESCE($4, notes)
       WHERE id = $5
       RETURNING *`,
      [
        quantity_available ?? null,
        price_per_kg ?? null,
        status ?? null,
        notes ?? null,
        id,
      ],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /sales/listings/:id error:", err.message);
    res.status(500).json({ message: "Failed to update listing" });
  }
});

// DELETE /api/sales/listings/:id
router.delete("/listings/:id", authenticate, async (req, res) => {
  try {
    const listingCheck = await pool.query(
      `SELECT pl.id
       FROM produce_listings pl
       JOIN farms f ON pl.farm_id = f.id
       WHERE pl.id = $1 AND f.owner_id = $2`,
      [req.params.id, req.user.userId],
    );

    if (listingCheck.rowCount === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const result = await pool.query(
      "DELETE FROM produce_listings WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("DELETE /sales/listings/:id error:", err.message);
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

/* ================================================
   TRANSACTIONS
================================================ */

// GET /api/sales/transactions?farm_id=&from=&to=
router.get("/transactions", authenticate, async (req, res) => {
  try {
    const { farm_id, from, to } = req.query;
    const conditions = [];
    const params = [];

    params.push(req.user.userId);
    conditions.push(`f.owner_id = $${params.length}`);

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`st.farm_id = $${params.length}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`st.sale_date >= $${params.length}::date`);
    }
    if (to) {
      params.push(to);
      conditions.push(`st.sale_date <= $${params.length}::date`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT st.*,
              f.name AS farm_name,
              b.buyer_type,
              pl.crop_name AS crop_name
       FROM sales_transactions st
       LEFT JOIN farms f ON st.farm_id = f.id
       LEFT JOIN buyers b ON st.buyer_id = b.id
       LEFT JOIN produce_listings pl ON st.listing_id = pl.id
       ${where}
       ORDER BY st.sale_date DESC, st.id DESC`,
      params,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /sales/transactions error:", err.message);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// POST /api/sales/transactions
router.post("/transactions", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      listing_id,
      farm_id,
      buyer_id,
      buyer_name,
      quantity_sold,
      price_per_unit,
      payment_mode,
      payment_status,
      sale_date,
      notes,
    } = req.body;

    const created_by = req.user?.userId;

    if (!farm_id)
      return res.status(400).json({ message: "farm_id is required" });
    if (!quantity_sold || quantity_sold <= 0)
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    if (!price_per_unit || price_per_unit <= 0)
      return res.status(400).json({ message: "Price must be greater than 0" });
    if (!sale_date)
      return res.status(400).json({ message: "Sale date is required" });

    const farmCheck = await client.query(
      `SELECT id FROM farms WHERE id = $1 AND owner_id = $2`,
      [farm_id, created_by],
    );

    if (farmCheck.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You do not have access to this farm" });
    }

    const total_amount = Number(quantity_sold) * Number(price_per_unit);

    await client.query("BEGIN");

    // If linked to a listing, reduce available quantity
    if (listing_id) {
      const listing = await client.query(
        `SELECT pl.quantity_available, pl.farm_id, pl.unit
         FROM produce_listings pl
         JOIN farms f ON pl.farm_id = f.id
         WHERE pl.id = $1 AND f.owner_id = $2
         FOR UPDATE`,
        [listing_id, created_by],
      );
      if (listing.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Listing not found" });
      }
      if (Number(listing.rows[0].farm_id) !== Number(farm_id)) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Listing does not belong to the selected farm" });
      }
      const available = Number(listing.rows[0].quantity_available);
      if (quantity_sold > available) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Only ${available} ${listing.rows[0]?.unit || "units"} available`,
        });
      }
      const newAvailable = available - Number(quantity_sold);
      await client.query(
        `UPDATE produce_listings
         SET quantity_available = $1,
             status = CASE WHEN $1::numeric <= 0 THEN 'sold' ELSE status END
         WHERE id = $2`,
        [newAvailable, listing_id],
      );
    }

    // Resolve buyer name
    let resolvedBuyerName = buyer_name || null;
    if (buyer_id && !resolvedBuyerName) {
      const bRes = await client.query("SELECT name FROM buyers WHERE id = $1", [
        buyer_id,
      ]);
      if (bRes.rows.length > 0) resolvedBuyerName = bRes.rows[0].name;
    }

    const result = await client.query(
      `INSERT INTO sales_transactions
        (listing_id, farm_id, buyer_id, buyer_name, quantity_sold, price_per_unit,
         total_amount, payment_mode, payment_status, sale_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        listing_id || null,
        farm_id,
        buyer_id || null,
        resolvedBuyerName,
        quantity_sold,
        price_per_unit,
        total_amount,
        payment_mode || "cash",
        payment_status || "paid",
        sale_date,
        notes || null,
        created_by || null,
      ],
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /sales/transactions error:", err.message);
    res.status(500).json({ message: "Failed to record transaction" });
  } finally {
    client.release();
  }
});

/* ================================================
   SALES REPORT / ANALYTICS
================================================ */

// GET /api/sales/report?farm_id=&from=&to=
router.get("/report", authenticate, async (req, res) => {
  try {
    const { farm_id, from, to } = req.query;
    const conditions = [];
    const params = [];

    params.push(req.user.userId);
    conditions.push(
      `EXISTS (SELECT 1 FROM farms f_scope WHERE f_scope.id = st.farm_id AND f_scope.owner_id = $${params.length})`,
    );

    if (farm_id) {
      params.push(farm_id);
      conditions.push(`st.farm_id = $${params.length}`);
    }
    if (from) {
      params.push(from);
      conditions.push(`st.sale_date >= $${params.length}::date`);
    }
    if (to) {
      params.push(to);
      conditions.push(`st.sale_date <= $${params.length}::date`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [totalRes, byMonthRes, byCropRes, byBuyerTypeRes, paymentStatusRes] =
      await Promise.all([
        pool.query(
          `SELECT
             COUNT(*)::int AS total_transactions,
             COALESCE(SUM(st.total_amount), 0)::numeric AS total_revenue,
             COALESCE(SUM(st.quantity_sold), 0)::numeric AS total_quantity_sold,
             COALESCE(AVG(st.price_per_unit), 0)::numeric AS avg_price_per_unit
           FROM sales_transactions st ${where}`,
          params,
        ),
        pool.query(
          `SELECT TO_CHAR(st.sale_date, 'YYYY-MM') AS month,
                  COUNT(*)::int AS transactions,
                  COALESCE(SUM(st.total_amount), 0)::numeric AS revenue
           FROM sales_transactions st ${where}
           GROUP BY month ORDER BY month`,
          params,
        ),
        pool.query(
          `SELECT COALESCE(pl.crop_name, 'Unknown') AS crop,
                  COUNT(*)::int AS transactions,
                  COALESCE(SUM(st.total_amount), 0)::numeric AS revenue
           FROM sales_transactions st
           LEFT JOIN produce_listings pl ON st.listing_id = pl.id
           ${where}
           GROUP BY crop ORDER BY revenue DESC LIMIT 10`,
          params,
        ),
        pool.query(
          `SELECT COALESCE(b.buyer_type, 'unknown') AS buyer_type,
                  COUNT(*)::int AS transactions,
                  COALESCE(SUM(st.total_amount), 0)::numeric AS revenue
           FROM sales_transactions st
           LEFT JOIN buyers b ON st.buyer_id = b.id
           ${where}
           GROUP BY buyer_type ORDER BY revenue DESC`,
          params,
        ),
        pool.query(
          `SELECT st.payment_status,
                  COUNT(*)::int AS count,
                  COALESCE(SUM(st.total_amount), 0)::numeric AS amount
           FROM sales_transactions st ${where}
           GROUP BY st.payment_status`,
          params,
        ),
      ]);

    res.json({
      summary: totalRes.rows[0],
      by_month: byMonthRes.rows,
      by_crop: byCropRes.rows,
      by_buyer_type: byBuyerTypeRes.rows,
      payment_status: paymentStatusRes.rows,
    });
  } catch (err) {
    console.error("GET /sales/report error:", err.message);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
});

export default router;
