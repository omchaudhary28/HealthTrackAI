import mongoose from "mongoose";

const exerciseCompletionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exerciseKey: { type: String, required: true, trim: true },
    exerciseTitle: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    source: { type: String, default: "library", trim: true },
    durationMinutes: Number,
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackText: String,
    resultAfter: String,
    contextSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

exerciseCompletionSchema.index({ userId: 1, exerciseKey: 1, createdAt: -1 });

export const ExerciseCompletion = mongoose.model("ExerciseCompletion", exerciseCompletionSchema);
