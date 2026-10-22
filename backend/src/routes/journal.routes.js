import { Router } from "express";
import {
  analyzeJournalEntry,
  createJournalEntry,
  getRecurringThemes,
  listJournalEntries,
  readVibeMode,
  sendFollowUpMessage,
  toggleNextMoveAction
} from "../controllers/journal.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listJournalEntries));
router.post("/", requireAuth, asyncHandler(createJournalEntry));
router.get("/recurring-themes", requireAuth, asyncHandler(getRecurringThemes));

router.post("/:entryId/analyze", requireAuth, asyncHandler(analyzeJournalEntry));
router.post("/:entryId/read-vibe", requireAuth, asyncHandler(readVibeMode));
router.post("/:entryId/follow-up", requireAuth, asyncHandler(sendFollowUpMessage));
router.patch("/:entryId/next-moves/:actionIndex", requireAuth, asyncHandler(toggleNextMoveAction));

export default router;
