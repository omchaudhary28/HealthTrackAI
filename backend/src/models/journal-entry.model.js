import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    moodTags: [String],
    aiPrompt: String,
    aiInsights: {
      patterns: [String],
      tone: String,
      suggestions: [String]
    }
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
