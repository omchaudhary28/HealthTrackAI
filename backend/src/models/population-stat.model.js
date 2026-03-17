import mongoose from "mongoose";

const populationStatSchema = new mongoose.Schema(
  {
    metric: { type: String, required: true, unique: true },
    distribution: { type: [Number], default: [] },
    lastUpdatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PopulationStat = mongoose.model("PopulationStat", populationStatSchema);
