import { Router } from "express";
import { listMyFeedback, submitFeedback } from "../controllers/feedback.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/mine", requireAuth, asyncHandler(listMyFeedback));
router.post("/", requireAuth, asyncHandler(submitFeedback));

export default router;
