import express from "express";
import {
  createFarm,
  saveFarmBoundary,
  // ...
} from "../controllers/farmController.js";

const router = express.Router();

router.post("/farms", createFarm);
// router.post("/farms/:farmId/boundary", saveFarmBoundary);  // already there