import mongoose from "mongoose";

const mentalStateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentalState: { type: String, required: true },
    description: { type: String, required: true },
    recommendations: [String],
    commonSigns: [String],
    recommendedExercises: [String],
    factors: { type: mongoose.Schema.Types.Mixed, default: {} },
    confidence: { type: Number, default: 0.65 }
  },
  { timestamps: true }
);

export const MentalState = mongoose.model("MentalState", mentalStateSchema);
