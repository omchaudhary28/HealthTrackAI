import { Router } from "express";
import { getTest, listTests, submitTest } from "../controllers/tests.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listTests));
router.get("/:testKey", asyncHandler(getTest));
router.post("/:testKey/submissions", requireAuth, asyncHandler(submitTest));

export default router;
