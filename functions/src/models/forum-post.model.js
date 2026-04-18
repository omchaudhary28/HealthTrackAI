import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    authorName: String,
    anonymousAlias: { type: String, required: true },
    isAnonymous: { type: Boolean, default: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["visible", "flagged", "removed"], default: "visible" }
  },
  { timestamps: true }
);

const progressSnapshotSchema = new mongoose.Schema(
  {
    whatImproved: String,
    whatHelped: String,
    streakDays: Number,
    moodAverage: Number,
    exerciseStreak: Number
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, trim: true, default: "unsafe" }
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    authorName: String,
    isAnonymous: { type: Boolean, default: true },
    anonymousAlias: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    mentalStateTag: { type: String, default: "Balanced" },
    shareType: { type: String, enum: ["reflection", "progress", "streak", "milestone"], default: "reflection" },
    progressSnapshot: { type: progressSnapshotSchema, default: null },
    status: { type: String, enum: ["visible", "flagged", "removed", "review"], default: "visible" },
    moderationFlags: { type: [String], default: [] },
    reactions: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ support: 0, hug: 0, strength: 0 })
    },
    reactionUsers: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ support: [], hug: [], strength: [] })
    },
    reports: { type: [reportSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ mentalStateTag: 1, createdAt: -1 });

export const ForumPost = mongoose.model("ForumPost", forumPostSchema);
