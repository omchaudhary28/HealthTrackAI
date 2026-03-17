import { ForumPost } from "../models/forum-post.model.js";

export async function listForumPosts(_req, res) {
  const items = await ForumPost.find({ status: "visible" }).sort({ createdAt: -1 }).lean();
  res.json({ items });
}

export async function createForumPost(req, res) {
  const post = await ForumPost.create({
    anonymousAlias: req.body.anonymousAlias || "Quiet Lantern",
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags || []
  });

  res.status(201).json(post);
}

export async function addComment(req, res) {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.comments.push({
    anonymousAlias: req.body.anonymousAlias || "Kind Voice",
    content: req.body.content
  });
  await post.save();

  res.status(201).json(post);
}

export async function addReaction(req, res) {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const reactionKey = req.body.reaction || "support";
  const currentCount = Number(post.reactions?.[reactionKey] || 0);
  post.reactions = { ...(post.reactions || {}), [reactionKey]: currentCount + 1 };
  await post.save();

  res.status(200).json(post);
}
