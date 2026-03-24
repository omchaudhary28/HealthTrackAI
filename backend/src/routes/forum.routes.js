import { Router } from "express";
import {
  addComment,
  addReaction,
  createConversation,
  createConversationMessage,
  createForumPost,
  followUser,
  getConversationMessages,
  getPresence,
  getProfile,
  listConversations,
  listForumPosts,
  reportPost,
  unfollowUser
} from "../controllers/forum.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(listForumPosts));
router.get("/profiles/:userId", optionalAuth, asyncHandler(getProfile));
router.get("/presence", requireAuth, asyncHandler(getPresence));
router.get("/conversations", requireAuth, asyncHandler(listConversations));
router.post("/conversations", requireAuth, asyncHandler(createConversation));
router.get("/conversations/:conversationId/messages", requireAuth, asyncHandler(getConversationMessages));
router.post("/conversations/:conversationId/messages", requireAuth, asyncHandler(createConversationMessage));
router.post("/follow/:userId", requireAuth, asyncHandler(followUser));
router.delete("/follow/:userId", requireAuth, asyncHandler(unfollowUser));
router.post("/", requireAuth, asyncHandler(createForumPost));
router.post("/:postId/comments", requireAuth, asyncHandler(addComment));
router.post("/:postId/reactions", requireAuth, asyncHandler(addReaction));
router.post("/:postId/report", requireAuth, asyncHandler(reportPost));

export default router;
