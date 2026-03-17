import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    age: Number,
    gender: String,
    occupation: String,
    lifestyleIndicators: [String],
    stressIndicators: [String],
    sleepHabits: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: profileSchema,
    baselineComplete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
