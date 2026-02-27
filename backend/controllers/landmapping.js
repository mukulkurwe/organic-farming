

import pool from "../config/db.js";
// import { calculateArea } from "../utils/calculateArea.js";
// import { calculateSlope } from "../utils/calculateSlope.js";
// import { calculateRisk } from "../utils/calculateRisk.js";

/* ============================
   CREATE FARM
============================ */
export const createFarm = async (req, res) => {
  try {
    const { name, location, total_area } = req.body;

    // TEMP farmer_id until auth is added
    const farmerId = 1;

    // const result = await pool.query(
    //   `INSERT INTO landmapping (farmer_id, name, location, total_area)
    //    VALUES ($1, $2, $3, $4)
    //    RETURNING *`,
    //   [farmerId, name, location, total_area]
    const result = await pool.query(
      `INSERT INTO farms (id, name, location, total_area)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farmerId, name, location, total_area]
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

// export const saveFarmBoundary = async (req, res) => {
  

//   try {

//      const { farmId } = req.params;
//     const { boundary } = req.body;
//      console.log("🔥 saveFarmBoundary CALLED", req.params.farmId);
//     if (!boundary) {
//       return res.status(400).json({ message: "Boundary is required" });
//     }

//     const result = await pool.query(
//       `UPDATE landmapping
//        SET boundary = $1
//        WHERE id = $2
//        RETURNING id, boundary`,
//       [boundary, farmId]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Farm not found" });
//     }

//     res.json({
//       message: "Boundary saved successfully",
//       farm: result.rows[0],
//     });

//     // 2️⃣ CALCULATE NOW
//     const area = calculateArea(boundary);
//     const slope = calculateSlope(boundary);
//     const risk = calculateRisk(area, slope);

//     // 3️⃣ UPDATE METRICS
//     await pool.query(
//       `UPDATE landmapping
//        SET area_acres = $1,
//            slope_percent = $2,
//            risk_level = $3
//        WHERE id = $4`,
//       [area, slope, risk, farmId]
//     );

//     res.json({
//       message: "Boundary saved & metrics calculated",
//       area_acres: area,
//       slope_percent: slope,
//       risk_level: risk
//     });

//   } catch (error) {
//     console.error("SAVE BOUNDARY ERROR:", error);
//     res.status(500).json({ message: "Failed to save boundary" });
//   }
// };

export const saveFarmBoundary = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { boundary } = req.body; // coming from frontend

    console.log("saveFarmBoundary CALLED", farmId);

    // Just save boundary as JSON. No slope/area here.
    await pool.query(
      // `UPDATE landmapping
      //  SET boundary = $1
      //  WHERE id = $2`,
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
/* ============================
   AUTO CALCULATE AREA / SLOPE / RISK
============================ */
// export const recalculateFarmMetrics = async (req, res) => {
//   try {
//     const { farmId } = req.params;

//     // 1️⃣ Fetch boundary
//     const result = await pool.query(
//       `SELECT boundary FROM landmapping WHERE id = $1`,
//       [farmId]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "Farm not found" });
//     }

//     const boundary = result.rows[0].boundary;

//     if (!boundary || boundary.length < 3) {
//       return res.status(400).json({ message: "Invalid boundary data" });
//     }

//     // 2️⃣ Calculate
//     const area = calculateArea(boundary);          // acres
//     const slope = calculateSlope(boundary);        // %
//     const risk = calculateRisk(area, slope);       // Low/Medium/High

//     // 3️⃣ Update SAME TABLE
//     await pool.query(
//       `UPDATE landmapping
//        SET area_acres = $1,
//            slope_percent = $2,
//            risk_level = $3
//        WHERE id = $4`,
//       [area, slope, risk, farmId]
//     );

//     // 4️⃣ Response
//     res.json({
//       farm_id: farmId,
//       area_acres: area,
//       slope_percent: slope,
//       risk_level: risk
//     });
//   } catch (error) {
//     console.error("RECALCULATE ERROR:", error);
//     res.status(500).json({ message: "Failed to calculate metrics" });
//   }
// };
