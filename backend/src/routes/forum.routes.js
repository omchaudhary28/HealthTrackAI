import { Router } from "express";
import { addComment, addReaction, createForumPost, listForumPosts } from "../controllers/forum.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listForumPosts));
router.post("/", asyncHandler(createForumPost));
router.post("/:postId/comments", asyncHandler(addComment));
router.post("/:postId/reactions", asyncHandler(addReaction));

export default router;
