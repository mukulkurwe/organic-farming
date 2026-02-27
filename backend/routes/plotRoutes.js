// routes/plotRoutes.js
import express from "express";
import { getPlotsByFarm, createPlot } from "../controllers/plotController.js";

const router = express.Router();

// GET all plots for a farm
router.get("/farms/:farmId/plots", getPlotsByFarm);

// CREATE a new plot for a farm
router.post("/farms/:farmId/plots", createPlot);

export default router;