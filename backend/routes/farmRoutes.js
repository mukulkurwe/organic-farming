


import express from "express";
import {
  createFarm,
  saveFarmBoundary,
  // recalculateFarmMetrics
} from "../controllers/landmapping.js";

const router = express.Router();

// Create farm
router.post("/farms", createFarm);

// Save boundary
router.put("/farms/:farmId/boundary", saveFarmBoundary);

// Auto calculate area / slope / risk
// router.post("/farms/:farmId/recalculate", recalculateFarmMetrics);

export default router;
