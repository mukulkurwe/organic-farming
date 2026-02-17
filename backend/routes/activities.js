// src/routes/activities.js
import { Router } from "express";
import {
  createActivity,
  getActivities,
  getCalendarAgg,
} from "../controllers/activityController.js";

const router = Router();

router.post("/", createActivity);
router.get("/", getActivities);
router.get("/calendar", getCalendarAgg);

export default router;
