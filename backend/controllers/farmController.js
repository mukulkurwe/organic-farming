// import pool from "../config/db.js";
// import { calculateArea } from "../utils/calculateArea.js";
// import { calculateSlope } from "../utils/calculateSlope.js";
// import { calculateRisk } from "../utils/calculateRisk.js";

// export const recalculateFarm = async (req, res) => {
//   const farmId = req.params.id;
//   try {
//     const farmResult = await pool.query(
//       "SELECT boundary FROM landmapping WHERE id=$1",
//       [farmId]
//     );

//     if (!farmResult.rows.length)
//       return res.status(404).json({ error: "Farm not found" });

//     const boundary = farmResult.rows[0].boundary;
//     const area = calculateArea(boundary);
//     const slope = calculateSlope(boundary);
//     const risk = calculateRisk(area, slope);

//     await pool.query(
//       "UPDATE landmapping SET area=$1, slope=$2, risk=$3 WHERE id=$4",
//       [area, slope, risk, farmId]
//     );

//     res.json({ area, slope, risk });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
