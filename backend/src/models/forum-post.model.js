import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    anonymousAlias: { type: String, required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    anonymousAlias: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    status: { type: String, enum: ["visible", "flagged", "removed"], default: "visible" },
    reactions: { type: mongoose.Schema.Types.Mixed, default: {} },
    comments: [commentSchema]
  },
  { timestamps: true }
);

export const ForumPost = mongoose.model("ForumPost", forumPostSchema);
