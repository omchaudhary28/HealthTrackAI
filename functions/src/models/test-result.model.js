import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    value: { type: Number, required: true }
  },
  { _id: false }
);

const testResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testKey: { type: String, required: true },
    category: { type: String, required: true },
    answers: [answerSchema],
    dimensionScores: { type: mongoose.Schema.Types.Mixed, required: true },
    labels: { type: mongoose.Schema.Types.Mixed, required: true },
    mentalScore: { type: Number, required: true },
    resultType: { type: String },
    resultDescription: { type: String },
    strengths: [String],
    suggestions: [String],
    recommendedExercises: [String],
    interpretation: [String],
    populationComparison: [mongoose.Schema.Types.Mixed]
  },
  { timestamps: true }
);

export const TestResult = mongoose.model("TestResult", testResultSchema);
