import { Router } from "express";
import {
  addComment,
  addReaction,
  createConversation,
  createConversationMessage,
  createForumPost,
  followUser,
  getConversationMessages,
  getDiscoverUsers,
  getPresence,
  getProfile,
  getProfilePosts,
  listConversations,
  listForumPosts,
  removePost,
  reportPost,
  unfollowUser
} from "../controllers/forum.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", optionalAuth, asyncHandler(listForumPosts));
router.get("/discover", requireAuth, asyncHandler(getDiscoverUsers));
router.get("/profiles/:userId", optionalAuth, asyncHandler(getProfile));
router.get("/profiles/:userId/posts", optionalAuth, asyncHandler(getProfilePosts));
router.get("/presence", requireAuth, asyncHandler(getPresence));
router.get("/conversations", requireAuth, asyncHandler(listConversations));
router.post("/conversations", requireAuth, asyncHandler(createConversation));
router.get("/conversations/:conversationId/messages", requireAuth, asyncHandler(getConversationMessages));
router.post("/conversations/:conversationId/messages", requireAuth, asyncHandler(createConversationMessage));
router.post("/follow/:userId", requireAuth, asyncHandler(followUser));
router.delete("/follow/:userId", requireAuth, asyncHandler(unfollowUser));
router.post("/", requireAuth, asyncHandler(createForumPost));
router.delete("/:postId", requireAuth, asyncHandler(removePost));
router.post("/:postId/comments", requireAuth, asyncHandler(addComment));
router.post("/:postId/reactions", requireAuth, asyncHandler(addReaction));
router.post("/:postId/report", requireAuth, asyncHandler(reportPost));

export default router;
