import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "advanced"], default: "easy" },
    durationMinutes: { type: Number, required: true },
    purpose: String,
    description: { type: String, required: true },
    expectedOutcome: String,
    benefits: [String],
    instructions: [String],
    tags: [String],
    bestForStates: [String]
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", exerciseSchema);
