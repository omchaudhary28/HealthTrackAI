import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    mood: { type: Number, min: 1, max: 5, required: true },
    stressLevel: { type: Number, min: 0, max: 100, required: true },
    sleepQuality: { type: Number, min: 1, max: 5, required: true },
    energyLevel: { type: Number, min: 1, max: 5, required: true },
    notes: String
  },
  { timestamps: true }
);

moodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const MoodLog = mongoose.model("MoodLog", moodLogSchema);
