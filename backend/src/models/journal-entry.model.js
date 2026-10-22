import mongoose from "mongoose";

const actionPlanItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    whyItHelps: { type: String, required: true },
    smallStart: { type: String, required: true },
    timeEstimate: { type: String, default: "5 mins" },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const followUpTurnSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["assistant", "user"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const recurringThemeSchema = new mongoose.Schema(
  {
    theme: { type: String, required: true },
    observation: { type: String, required: true },
    datesOrParaphrase: { type: String, required: true }
  },
  { _id: false }
);

const vibeAnalysisSchema = new mongoose.Schema(
  {
    whatIHear: { type: String, required: true },
    rootConcerns: [
      {
        concern: { type: String, required: true },
        explanation: { type: String, required: true }
      }
    ],
    emotionalThemes: [
      {
        emotion: { type: String, required: true },
        context: { type: String, required: true }
      }
    ],
    maintainingCycle: {
      steps: [String],
      summary: String
    },
    nextMoves: [actionPlanItemSchema],
    reflectionQuestion: { type: String, required: true },
    gentleClosing: { type: String, required: true },
    historicalContext: {
      recurringThemes: [recurringThemeSchema],
      note: String
    },
    safetyNotice: {
      isCrisis: { type: Boolean, default: false },
      message: String,
      resources: [String]
    },
    provider: { type: String, default: "local" },
    analyzedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

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
    },
    vibeAnalysis: vibeAnalysisSchema,
    followUpMessages: [followUpTurnSchema],
    allowHistoricalAnalysis: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
