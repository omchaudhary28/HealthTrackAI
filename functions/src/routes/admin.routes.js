import { Router } from "express";
import { getAdminStats, seedExerciseLibrary } from "../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/seed/exercises", requireAuth, requireAdmin, asyncHandler(seedExerciseLibrary));
router.get("/stats", requireAuth, requireAdmin, asyncHandler(getAdminStats));

export default router;
