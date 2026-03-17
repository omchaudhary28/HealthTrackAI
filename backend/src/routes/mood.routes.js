import { Router } from "express";
import { createMoodLog, listMoodLogs } from "../controllers/mood.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listMoodLogs));
router.post("/", requireAuth, asyncHandler(createMoodLog));

export default router;
