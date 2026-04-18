import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityPost,
  createDirectMessage,
  createOrGetDirectConversation,
  followCommunityUser,
  getCommunityProfile,
  listCommunityProfilePosts,
  listDiscoverUsers,
  listCommunityFeed,
  listDirectConversations,
  listDirectMessages,
  listPresence,
  reportCommunityPost,
  toggleCommunityReaction,
  unfollowCommunityUser
} from "../services/community.service.js";

export async function listForumPosts(req, res) {
  const result = await listCommunityFeed({
    viewerId: req.user?.sub,
    scope: req.query.scope,
    page: req.query.page,
    limit: req.query.limit,
    shareType: req.query.shareType
  });

  res.json(result);
}

export async function createForumPost(req, res) {
  const post = await createCommunityPost(req.user.sub, req.body);
  res.status(201).json(post);
}

export async function addComment(req, res) {
  const post = await addCommunityComment(req.user.sub, req.params.postId, req.body);
  res.status(201).json(post);
}

export async function addReaction(req, res) {
  const post = await toggleCommunityReaction(req.user.sub, req.params.postId, req.body.reaction);
  res.status(200).json(post);
}

export async function reportPost(req, res) {
  const result = await reportCommunityPost(req.user.sub, req.params.postId, req.body);
  res.status(200).json(result);
}

export async function getProfile(req, res) {
  const profile = await getCommunityProfile(req.user?.sub, req.params.userId);
  res.status(200).json(profile);
}

export async function getProfilePosts(req, res) {
  const result = await listCommunityProfilePosts(req.user?.sub, req.params.userId, {
    page: req.query.page,
    limit: req.query.limit,
    shareType: req.query.shareType
  });
  res.status(200).json(result);
}

export async function getDiscoverUsers(req, res) {
  const result = await listDiscoverUsers(req.user.sub, req.query.limit);
  res.status(200).json(result);
}

export async function removePost(req, res) {
  const result = await deleteCommunityPost(req.user.sub, req.params.postId);
  res.status(200).json(result);
}

export async function followUser(req, res) {
  const state = await followCommunityUser(req.user.sub, req.params.userId);
  res.status(200).json(state);
}

export async function unfollowUser(req, res) {
  const state = await unfollowCommunityUser(req.user.sub, req.params.userId);
  res.status(200).json(state);
}

export async function listConversations(req, res) {
  const result = await listDirectConversations(req.user.sub);
  res.status(200).json(result);
}

export async function createConversation(req, res) {
  const result = await createOrGetDirectConversation(req.user.sub, req.body.userId);
  res.status(200).json(result);
}

export async function getConversationMessages(req, res) {
  const result = await listDirectMessages(req.user.sub, req.params.conversationId, req.query.limit);
  res.status(200).json(result);
}

export async function createConversationMessage(req, res) {
  const result = await createDirectMessage(req.user.sub, req.params.conversationId, req.body);
  res.status(201).json(result);
}

export async function getPresence(req, res) {
  const result = await listPresence(
    String(req.query.userIds || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );

  res.status(200).json(result);
}
