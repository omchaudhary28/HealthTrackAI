import { ForumPost } from "../models/forum-post.model.js";
import { JournalEntry } from "../models/journal-entry.model.js";
import { MentalState } from "../models/mental-state.model.js";
import { MoodLog } from "../models/mood-log.model.js";
import { TestResult } from "../models/test-result.model.js";

export async function getDashboardSummary(req, res) {
  const [latestBaseline, recentMoodLogs, recentJournalEntries, mentalStates, forumCount] = await Promise.all([
    TestResult.findOne({ userId: req.user.sub, testKey: "baseline" }).sort({ createdAt: -1 }).lean(),
    MoodLog.find({ userId: req.user.sub }).sort({ date: -1 }).limit(30).lean(),
    JournalEntry.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(5).lean(),
    MentalState.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(6).lean(),
    ForumPost.countDocuments({ status: "visible" })
  ]);

  res.json({
    latestBaseline,
    recentMoodLogs,
    recentJournalEntries,
    mentalStates,
    communityVisiblePosts: forumCount
  });
}
