import { Router } from "express";
import {
  getLatestMentalState,
  getPopulationComparisonByMetric,
  submitBaselineAssessment
} from "../controllers/assessment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/baseline", requireAuth, asyncHandler(submitBaselineAssessment));
router.get("/comparison/:metric/:score", asyncHandler(getPopulationComparisonByMetric));
router.get("/state/latest", requireAuth, asyncHandler(getLatestMentalState));

export default router;
