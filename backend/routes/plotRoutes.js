// routes/plotRoutes.js
import express from "express";
import {
  getPlotsByFarm,
  createPlot,
  deletePlot,
} from "../controllers/plotController.js";

const router = express.Router();

// GET all plots for a given farm
router.get("/farms/:farmId/plots", getPlotsByFarm);

// CREATE a new plot inside a farm
router.post("/farms/:farmId/plots", createPlot);

// DELETE a plot (optional)
router.delete("/plots/:plotId", deletePlot);

export default router;