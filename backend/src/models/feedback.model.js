import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    category: { type: String, trim: true, default: "general" },
    message: { type: String, trim: true, required: true },
    pageContext: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["new", "reviewed", "planned"], default: "new" }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
