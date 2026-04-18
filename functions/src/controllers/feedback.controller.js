import { Feedback } from "../models/feedback.model.js";
import { normalizeCommunityText } from "../services/community-safety.service.js";

export async function submitFeedback(req, res) {
  const rating = Math.max(1, Math.min(5, Number(req.body.rating || 0)));
  const message = normalizeCommunityText(req.body.message, {
    fieldName: "Feedback",
    maxLength: 800
  });

  const item = await Feedback.create({
    userId: req.user.sub,
    rating,
    category: String(req.body.category || "general").trim() || "general",
    pageContext: String(req.body.pageContext || "").trim(),
    message: message.text
  });

  res.status(201).json({
    id: String(item._id),
    rating: item.rating,
    category: item.category,
    pageContext: item.pageContext,
    message: item.message,
    createdAt: item.createdAt
  });
}

export async function listMyFeedback(req, res) {
  const items = await Feedback.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({
    items: items.map((item) => ({
      id: String(item._id),
      rating: item.rating,
      category: item.category,
      pageContext: item.pageContext,
      message: item.message,
      createdAt: item.createdAt
    }))
  });
}
