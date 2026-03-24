import { Router } from "express";
import {
  listExercises,
  listRecommendedExercises,
  recordExerciseCompletion
} from "../controllers/exercises.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listExercises));
router.get("/recommended", requireAuth, asyncHandler(listRecommendedExercises));
router.post("/completions", requireAuth, asyncHandler(recordExerciseCompletion));

export default router;
