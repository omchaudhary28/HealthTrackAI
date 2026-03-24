import { JournalEntry } from "../models/journal-entry.model.js";
import { analyzeJournalText } from "../services/ai.service.js";
import { refreshMentalStateSnapshot } from "../services/wellness-profile.service.js";

export async function listJournalEntries(req, res) {
  const items = await JournalEntry.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
  res.json({ items });
}

export async function createJournalEntry(req, res) {
  const insights = await analyzeJournalText(req.body.content, req.body.recentMood);

  const entry = await JournalEntry.create({
    userId: req.user.sub,
    content: req.body.content,
    moodTags: req.body.moodTags || [],
    aiPrompt: req.body.aiPrompt,
    aiInsights: insights
  });

  await refreshMentalStateSnapshot(req.user.sub, "journal-entry");

  res.status(201).json(entry);
}

export async function analyzeJournalEntry(req, res) {
  const entry = await JournalEntry.findOne({ _id: req.params.entryId, userId: req.user.sub });
  if (!entry) {
    return res.status(404).json({ error: "Journal entry not found" });
  }

  const insights = await analyzeJournalText(entry.content, req.body.recentMood);
  entry.aiInsights = insights;
  await entry.save();
  await refreshMentalStateSnapshot(req.user.sub, "journal-analysis");

  res.json(insights);
}
