import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "advanced"], default: "easy" },
    durationMinutes: { type: Number, required: true },
    description: { type: String, required: true },
    instructions: [String],
    tags: [String]
  },
  { timestamps: true }
);

export const Exercise = mongoose.model("Exercise", exerciseSchema);
