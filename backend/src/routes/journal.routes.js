import { Router } from "express";
import {
  analyzeJournalEntry,
  createJournalEntry,
  listJournalEntries
} from "../controllers/journal.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listJournalEntries));
router.post("/", requireAuth, asyncHandler(createJournalEntry));
router.post("/:entryId/analyze", requireAuth, asyncHandler(analyzeJournalEntry));

export default router;
