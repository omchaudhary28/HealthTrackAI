import { JournalEntry } from "../models/journal-entry.model.js";
import { analyzeJournalText } from "../services/ai.service.js";
import {
  analyzeJournalVibe,
  generateFollowUpTurn,
  extractRecurringThemesFromHistory
} from "../services/vibe-analysis.service.js";
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

  if (req.body.content && req.body.content.trim()) {
    entry.content = req.body.content.trim();
  }

  const insights = await analyzeJournalText(entry.content, req.body.recentMood);
  entry.aiInsights = insights;
  await entry.save();
  await refreshMentalStateSnapshot(req.user.sub, "journal-analysis");

  res.json(insights);
}

/**
 * Read Vibe Mode — Context-aware deep reflection analysis
 */
export async function readVibeMode(req, res) {
  const entry = await JournalEntry.findOne({ _id: req.params.entryId, userId: req.user.sub });
  if (!entry) {
    return res.status(404).json({ error: "Journal entry not found" });
  }

  // Update content or mood tags if passed from client
  if (req.body.content && req.body.content.trim()) {
    entry.content = req.body.content.trim();
  }
  if (Array.isArray(req.body.moodTags) && req.body.moodTags.length) {
    entry.moodTags = req.body.moodTags;
  }
  if (req.body.aiPrompt) {
    entry.aiPrompt = req.body.aiPrompt;
  }

  const allowHistorical = req.body.allowHistorical !== undefined ? Boolean(req.body.allowHistorical) : true;
  let history = [];
  if (allowHistorical) {
    history = await JournalEntry.find({
      userId: req.user.sub,
      _id: { $ne: entry._id }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  const recentMood = req.body.recentMood || entry.moodTags?.[0] || "neutral";
  const analysis = await analyzeJournalVibe(entry.content, recentMood, history, allowHistorical);

  entry.vibeAnalysis = analysis;
  entry.allowHistoricalAnalysis = allowHistorical;
  await entry.save();

  await refreshMentalStateSnapshot(req.user.sub, "journal-read-vibe");

  res.json({
    entryId: entry._id,
    vibeAnalysis: entry.vibeAnalysis,
    followUpMessages: entry.followUpMessages || []
  });
}

/**
 * Follow-Up Reflection Conversation Turn
 */
export async function sendFollowUpMessage(req, res) {
  const entry = await JournalEntry.findOne({ _id: req.params.entryId, userId: req.user.sub });
  if (!entry) {
    return res.status(404).json({ error: "Journal entry not found" });
  }

  const userMessage = (req.body.message || "").trim();
  if (!userMessage) {
    return res.status(400).json({ error: "Reflection message cannot be empty." });
  }

  if (!entry.followUpMessages) {
    entry.followUpMessages = [];
  }

  // Push user turn
  entry.followUpMessages.push({
    role: "user",
    content: userMessage,
    timestamp: new Date()
  });

  const followUpResult = await generateFollowUpTurn(
    entry.content,
    entry.vibeAnalysis,
    entry.followUpMessages,
    userMessage
  );

  // Push assistant turn
  entry.followUpMessages.push({
    role: "assistant",
    content: followUpResult.reply,
    timestamp: new Date()
  });

  entry.markModified("followUpMessages");
  await entry.save();

  res.json({
    reply: followUpResult.reply,
    provider: followUpResult.provider,
    followUpMessages: entry.followUpMessages
  });
}

/**
 * Toggle Action Checklist item in Next Moves
 */
export async function toggleNextMoveAction(req, res) {
  const entry = await JournalEntry.findOne({ _id: req.params.entryId, userId: req.user.sub });
  if (!entry) {
    return res.status(404).json({ error: "Journal entry not found" });
  }

  const actionIndex = parseInt(req.params.actionIndex, 10);
  if (
    !entry.vibeAnalysis ||
    !Array.isArray(entry.vibeAnalysis.nextMoves) ||
    actionIndex < 0 ||
    actionIndex >= entry.vibeAnalysis.nextMoves.length
  ) {
    return res.status(400).json({ error: "Invalid action index." });
  }

  const nextMove = entry.vibeAnalysis.nextMoves[actionIndex];
  if (req.body.completed !== undefined) {
    nextMove.completed = Boolean(req.body.completed);
  } else {
    nextMove.completed = !nextMove.completed;
  }

  entry.markModified("vibeAnalysis");
  await entry.save();

  res.json({
    actionIndex,
    completed: nextMove.completed,
    nextMoves: entry.vibeAnalysis.nextMoves
  });
}

/**
 * Aggregate recurring patterns and themes across past entries
 */
export async function getRecurringThemes(req, res) {
  const entries = await JournalEntry.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const themes = extractRecurringThemesFromHistory(entries);
  res.json({ themes });
}
