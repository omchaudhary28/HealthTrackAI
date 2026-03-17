import { Router } from "express";
import { sendContextualChat } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(sendContextualChat));

export default router;

