import { Router } from "express";
import { getMe, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(getMe));
router.patch("/", requireAuth, asyncHandler(updateMe));

export default router;
