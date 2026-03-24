import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participantIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
      validate: [(value) => Array.isArray(value) && value.length >= 2, "At least two participants are required"]
    },
    lastMessageText: { type: String, trim: true, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageSenderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
