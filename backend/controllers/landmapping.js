

// import pool from "../config/db.js";


// /* ============================
//    CREATE FARM
// ============================ */
// export const createFarm = async (req, res) => {
//   try {
//     const { name, location, total_area } = req.body;

//     // TEMP farmer_id until auth is added
//     const farmerId = 1;

//     // const result = await pool.query(
//     //   `INSERT INTO landmapping (farmer_id, name, location, total_area)
//     //    VALUES ($1, $2, $3, $4)
//     //    RETURNING *`,
//     //   [farmerId, name, location, total_area]
//     const result = await pool.query(
//       `INSERT INTO farms (id, name, location, total_area)
//        VALUES ($1, $2, $3, $4)
//        RETURNING *`,
//       [farmerId, name, location, total_area]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error("CREATE FARM ERROR:", error);
//     res.status(500).json({ message: "Failed to create farm" });
//   }
// };


// export const saveFarmBoundary = async (req, res) => {
//   try {
//     const { farmId } = req.params;
//     const { boundary } = req.body; // coming from frontend

//     console.log("saveFarmBoundary CALLED", farmId);

//     // Just save boundary as JSON. No slope/area here.
//     await pool.query(
//       // `UPDATE landmapping
//       //  SET boundary = $1
//       //  WHERE id = $2`,
//         `UPDATE farms
//        SET boundary = $1
//        WHERE id = $2`,
//       [JSON.stringify(boundary), farmId]
//     );

//     return res.json({ message: "Boundary saved ✅" });
//   } catch (error) {
//     console.error("SAVE BOUNDARY ERROR:", error);
//     if (!res.headersSent) {
//       return res.status(500).json({ message: "Failed to save boundary" });
//     }
//   }
// };


// controllers/farmController.js (or wherever this is)

import pool from "../config/db.js";

/* ============================
   CREATE FARM
============================ */
export const createFarm = async (req, res) => {
  try {
    const { name, location, total_area } = req.body;

    // TEMP farmer_id until auth is added
    const farmerId = 1;

    // ✅ Let Postgres auto-generate `id`
    // ✅ Store farmerId in owner_id
    const result = await pool.query(
      `INSERT INTO farms (name, location, owner_id, total_area)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, location, farmerId, total_area]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE FARM ERROR:", error);
    res.status(500).json({ message: "Failed to create farm" });
  }
};

/* ============================
   SAVE FARM BOUNDARY
============================ */
export const saveFarmBoundary = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { boundary } = req.body; // coming from frontend

    console.log("saveFarmBoundary CALLED", farmId);

    await pool.query(
      `UPDATE farms
       SET boundary = $1
       WHERE id = $2`,
      [JSON.stringify(boundary), farmId]
    );

    return res.json({ message: "Boundary saved ✅" });
  } catch (error) {
    console.error("SAVE BOUNDARY ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to save boundary" });
    }
  }
};