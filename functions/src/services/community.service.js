import { Conversation } from "../models/conversation.model.js";
import { ExerciseCompletion } from "../models/exercise-completion.model.js";
import { Follow } from "../models/follow.model.js";
import { ForumPost } from "../models/forum-post.model.js";
import { JournalEntry } from "../models/journal-entry.model.js";
import { MentalState } from "../models/mental-state.model.js";
import { Message } from "../models/message.model.js";
import { MoodLog } from "../models/mood-log.model.js";
import { User } from "../models/user.model.js";
import {
  buildAnonymousAlias,
  COMMUNITY_REACTIONS,
  normalizeCommunityText,
  normalizeMentalStateTag,
  normalizeReactionKey,
  normalizeTags
} from "./community-safety.service.js";
import {
  emitCommunityPostCreated,
  emitCommunityPostUpdated,
  emitConversationMessage,
  getPresenceSnapshot,
  isUserOnline
} from "./realtime.service.js";
import { HttpError } from "../utils/http-error.js";

export async function listCommunityFeed({ viewerId, scope = "global", page = 1, limit = 10, shareType = "all" }) {
  const safePage = clampNumber(page, 1, 500);
  const safeLimit = clampNumber(limit, 1, 20);
  const viewerContext = await buildViewerContext(viewerId);
  const normalizedScope = normalizeScope(scope);
  const normalizedShareType = normalizeShareTypeFilter(shareType);
  const filter = { status: "visible" };

  if (normalizedScope === "following") {
    if (!viewerContext.followingIds.size) {
      return {
        items: [],
        page: safePage,
        limit: safeLimit,
        hasMore: false,
        scope: normalizedScope,
        spotlight: {
          similarMentalState: viewerContext.mentalStateTag,
          followingCount: 0
        }
      };
    }

    filter.userId = { $in: [...viewerContext.followingIds] };
  }

  if (normalizedScope === "mine") {
    if (!viewerContext.viewerId) {
      return {
        items: [],
        page: safePage,
        limit: safeLimit,
        hasMore: false,
        scope: normalizedScope,
        spotlight: {
          similarMentalState: viewerContext.mentalStateTag,
          followingCount: viewerContext.followingIds.size
        }
      };
    }

    filter.userId = viewerContext.viewerId;
  }

  if (normalizedScope === "similar" && viewerContext.mentalStateTag) {
    filter.mentalStateTag = viewerContext.mentalStateTag;
  }

  if (normalizedShareType !== "all") {
    filter.shareType = normalizedShareType;
  }

  const skip = (safePage - 1) * safeLimit;
  const [total, posts] = await Promise.all([
    ForumPost.countDocuments(filter),
    ForumPost.find(filter)
      .sort({ lastActivityAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate({ path: "userId", select: "name profile" })
      .populate({ path: "comments.userId", select: "name profile" })
      .lean()
  ]);

  return {
    items: posts.map((post) => serializePost(post, viewerContext)),
    page: safePage,
    limit: safeLimit,
    hasMore: skip + posts.length < total,
    scope: normalizedScope,
    spotlight: {
      similarMentalState: viewerContext.mentalStateTag,
      followingCount: viewerContext.followingIds.size
    },
    filters: {
      shareType: normalizedShareType
    }
  };
}

export async function createCommunityPost(viewerId, payload = {}) {
  const user = await getRequiredUser(viewerId);
  const latestState = await getLatestMentalState(viewerId);
  const isAnonymous = payload.isAnonymous !== false;
  const shareType = normalizeShareType(payload.shareType);
  const title = normalizeCommunityText(payload.title || defaultTitle(shareType), {
    fieldName: "Title",
    maxLength: 120
  });
  const content = normalizeCommunityText(payload.content, {
    fieldName: "Post",
    maxLength: 1200
  });
  const progressSnapshot = buildProgressSnapshot(payload.progressSnapshot);
  const post = await ForumPost.create({
    userId: user._id,
    authorName: user.name,
    isAnonymous,
    anonymousAlias: isAnonymous
      ? normalizeCommunityText(payload.anonymousAlias || buildAnonymousAlias(user._id), {
          fieldName: "Anonymous alias",
          maxLength: 32
        }).text
      : user.name,
    title: title.text,
    content: content.text,
    tags: normalizeTags(payload.tags),
    mentalStateTag: normalizeMentalStateTag(payload.mentalStateTag || latestState?.mentalState),
    shareType,
    progressSnapshot,
    moderationFlags: [...new Set([...title.flags, ...content.flags])],
    lastActivityAt: new Date()
  });

  const populated = await fetchPostById(post.id);
  const serialized = serializePost(populated, await buildViewerContext(viewerId));
  emitCommunityPostCreated(serialized);
  return serialized;
}

export async function addCommunityComment(viewerId, postId, payload = {}) {
  const [user, post] = await Promise.all([getRequiredUser(viewerId), ForumPost.findById(postId)]);
  if (!post || post.status === "removed") {
    throw new HttpError(404, "Post not found");
  }

  const isAnonymous = payload.isAnonymous !== false;
  const content = normalizeCommunityText(payload.content, {
    fieldName: "Comment",
    maxLength: 360
  });

  post.comments.push({
    userId: user._id,
    authorName: user.name,
    anonymousAlias: isAnonymous
      ? normalizeCommunityText(payload.anonymousAlias || buildAnonymousAlias(`${user._id}-comment`), {
          fieldName: "Anonymous alias",
          maxLength: 32
        }).text
      : user.name,
    isAnonymous,
    content: content.text
  });
  post.lastActivityAt = new Date();
  post.moderationFlags = [...new Set([...(post.moderationFlags || []), ...content.flags])];
  await post.save();

  const populated = await fetchPostById(post.id);
  const serialized = serializePost(populated, await buildViewerContext(viewerId));
  emitCommunityPostUpdated(serialized);
  return serialized;
}

export async function toggleCommunityReaction(viewerId, postId, reaction) {
  const post = await ForumPost.findById(postId);
  if (!post || post.status === "removed") {
    throw new HttpError(404, "Post not found");
  }

  const reactionKey = normalizeReactionKey(reaction);
  const viewerKey = String(viewerId);
  const reactionCounts = normalizeReactionCounts(post.reactions);
  const reactionUsers = normalizeReactionUsers(post.reactionUsers);
  let activeReaction = null;

  COMMUNITY_REACTIONS.forEach(({ key }) => {
    if (reactionUsers[key].includes(viewerKey)) {
      activeReaction = key;
      reactionUsers[key] = reactionUsers[key].filter((value) => value !== viewerKey);
      reactionCounts[key] = Math.max(0, reactionCounts[key] - 1);
    }
  });

  if (activeReaction !== reactionKey) {
    reactionUsers[reactionKey].push(viewerKey);
    reactionCounts[reactionKey] += 1;
  }

  post.reactions = reactionCounts;
  post.reactionUsers = reactionUsers;
  post.lastActivityAt = new Date();
  await post.save();

  const populated = await fetchPostById(post.id);
  const serialized = serializePost(populated, await buildViewerContext(viewerId));
  emitCommunityPostUpdated(serialized);
  return serialized;
}

export async function reportCommunityPost(viewerId, postId, payload = {}) {
  const post = await ForumPost.findById(postId);
  if (!post || post.status === "removed") {
    throw new HttpError(404, "Post not found");
  }

  const reporterId = String(viewerId);
  const alreadyReported = (post.reports || []).some((item) => String(item.userId) === reporterId);

  if (!alreadyReported) {
    const reason = normalizeCommunityText(payload.reason, {
      fieldName: "Report reason",
      allowEmpty: true,
      maxLength: 180
    });
    post.reports.push({
      userId: viewerId,
      reason: reason.text || "unsafe"
    });

    if ((post.reports || []).length >= 3) {
      post.status = "flagged";
    }

    await post.save();
  }

  return {
    reported: true,
    status: post.status
  };
}

export async function followCommunityUser(viewerId, targetUserId) {
  await ensureFollowable(viewerId, targetUserId);

  await Follow.updateOne(
    { followerId: viewerId, followingId: targetUserId },
    { $setOnInsert: { followerId: viewerId, followingId: targetUserId } },
    { upsert: true }
  );

  return buildFollowState(viewerId, targetUserId);
}

export async function unfollowCommunityUser(viewerId, targetUserId) {
  await ensureFollowable(viewerId, targetUserId);

  await Follow.deleteOne({ followerId: viewerId, followingId: targetUserId });
  return buildFollowState(viewerId, targetUserId);
}

export async function getCommunityProfile(viewerId, targetUserId) {
  const user = await User.findById(targetUserId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const isOwnProfile = String(viewerId || "") === String(targetUserId || "");
  const canShareProgress = isOwnProfile || user.profile?.shareProgressPublicly !== false;
  const postsFilter = {
    userId: targetUserId,
    status: "visible",
    ...(isOwnProfile ? {} : { isAnonymous: false })
  };

  const thirtyDaysAgo = daysAgo(30);
  const [followers, following, isFollowing, latestMentalState, recentPosts, moodCheckIns30d, exerciseCompleted30d, journalEntries30d] =
    await Promise.all([
      Follow.countDocuments({ followingId: targetUserId }),
      Follow.countDocuments({ followerId: targetUserId }),
      viewerId ? Follow.exists({ followerId: viewerId, followingId: targetUserId }) : null,
      getLatestMentalState(targetUserId),
      ForumPost.find(postsFilter)
        .sort({ lastActivityAt: -1, createdAt: -1 })
        .limit(6)
        .populate({ path: "userId", select: "name profile" })
        .populate({ path: "comments.userId", select: "name profile" })
        .lean(),
      MoodLog.countDocuments({ userId: targetUserId, date: { $gte: thirtyDaysAgo } }),
      ExerciseCompletion.countDocuments({ userId: targetUserId, createdAt: { $gte: thirtyDaysAgo } }),
      JournalEntry.countDocuments({ userId: targetUserId, createdAt: { $gte: thirtyDaysAgo } })
    ]);

  const activitySummary = canShareProgress
    ? {
        moodCheckIns30d,
        exerciseCompleted30d,
        journalEntries30d
      }
    : null;

  return {
    profile: {
      id: String(user._id),
      name: user.name,
      headline: user.profile?.headline || latestMentalState?.mentalState || "Community member",
      bio: user.profile?.bio || "",
      allowDirectMessages: user.profile?.allowDirectMessages !== false,
      shareProgressPublicly: user.profile?.shareProgressPublicly !== false,
      initials: buildInitials(user.name)
    },
    social: {
      followers,
      following,
      posts: await ForumPost.countDocuments(postsFilter),
      progressShares: await ForumPost.countDocuments({
        ...postsFilter,
        shareType: { $in: ["progress", "streak", "milestone"] }
      })
    },
    currentMentalState: latestMentalState?.mentalState || null,
    isOwnProfile,
    isFollowing: Boolean(isFollowing),
    canMessage: !isOwnProfile && user.profile?.allowDirectMessages !== false,
    activitySummary,
    recentPosts: recentPosts.map((post) =>
      serializePost(post, {
        viewerId: String(viewerId || ""),
        followingIds: new Set(),
        mentalStateTag: latestMentalState?.mentalState || null
      })
    )
  };
}

export async function listCommunityProfilePosts(viewerId, targetUserId, { page = 1, limit = 9, shareType = "all" } = {}) {
  const user = await User.findById(targetUserId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const safePage = clampNumber(page, 1, 500);
  const safeLimit = clampNumber(limit, 1, 18);
  const normalizedShareType = normalizeShareTypeFilter(shareType);
  const isOwnProfile = String(viewerId || "") === String(targetUserId || "");
  const filter = {
    userId: targetUserId,
    status: "visible",
    ...(isOwnProfile ? {} : { isAnonymous: false })
  };

  if (normalizedShareType !== "all") {
    filter.shareType = normalizedShareType;
  }

  const skip = (safePage - 1) * safeLimit;
  const viewerContext = await buildViewerContext(viewerId);
  const [total, posts] = await Promise.all([
    ForumPost.countDocuments(filter),
    ForumPost.find(filter)
      .sort({ lastActivityAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate({ path: "userId", select: "name profile" })
      .populate({ path: "comments.userId", select: "name profile" })
      .lean()
  ]);

  return {
    items: posts.map((post) => serializePost(post, viewerContext)),
    page: safePage,
    limit: safeLimit,
    hasMore: skip + posts.length < total,
    filter: normalizedShareType
  };
}

export async function listDiscoverUsers(viewerId, limit = 6) {
  if (!viewerId) {
    return { items: [] };
  }

  const safeLimit = clampNumber(limit, 1, 12);
  const viewerContext = await buildViewerContext(viewerId);
  const excludedIds = new Set([String(viewerId), ...viewerContext.followingIds]);
  const candidateRows = await ForumPost.aggregate([
    {
      $match: {
        status: "visible",
        isAnonymous: false
      }
    },
    {
      $group: {
        _id: "$userId",
        recentPosts: { $sum: 1 },
        latestShareAt: { $max: "$createdAt" }
      }
    },
    { $sort: { latestShareAt: -1 } },
    { $limit: 40 }
  ]);

  const candidateIdPairs = candidateRows
    .map((row) => ({ rawId: row._id, id: String(row._id || "") }))
    .filter((item) => item.id && !excludedIds.has(item.id));
  const candidateIds = candidateIdPairs.map((item) => item.id);
  const candidateObjectIds = candidateIdPairs.map((item) => item.rawId);

  if (!candidateIds.length) {
    return { items: [] };
  }

  const [users, followerRows, states] = await Promise.all([
    User.find({ _id: { $in: candidateIds } }).lean(),
    Follow.aggregate([
      { $match: { followingId: { $in: candidateObjectIds } } },
      { $group: { _id: "$followingId", followers: { $sum: 1 } } }
    ]),
    MentalState.find({ userId: { $in: candidateIds } })
      .sort({ createdAt: -1 })
      .lean()
  ]);

  const postCountMap = new Map(candidateRows.map((row) => [String(row._id), Number(row.recentPosts || 0)]));
  const followerMap = new Map(followerRows.map((row) => [String(row._id), Number(row.followers || 0)]));
  const stateMap = new Map();
  states.forEach((state) => {
    const key = String(state.userId || "");
    if (key && !stateMap.has(key)) {
      stateMap.set(key, normalizeMentalStateTag(state.mentalState, "Balanced"));
    }
  });

  const items = users
    .map((user) => {
      const id = String(user._id);
      const mentalStateTag = stateMap.get(id) || "Balanced";
      const recentPosts = postCountMap.get(id) || 0;
      const followers = followerMap.get(id) || 0;
      const similarityScore = mentalStateTag === viewerContext.mentalStateTag ? 20 : 0;
      const activityScore = Math.min(recentPosts, 8) * 2 + Math.min(followers, 20);

      return {
        id,
        name: user.name,
        headline: user.profile?.headline || mentalStateTag,
        initials: buildInitials(user.name),
        mentalStateTag,
        followers,
        recentPosts,
        score: similarityScore + activityScore
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, safeLimit)
    .map(({ score: _score, ...item }) => item);

  return { items };
}

export async function deleteCommunityPost(viewerId, postId) {
  const post = await ForumPost.findById(postId);
  if (!post || post.status === "removed") {
    throw new HttpError(404, "Post not found");
  }

  if (String(post.userId) !== String(viewerId)) {
    throw new HttpError(403, "You can only remove your own posts");
  }

  post.status = "removed";
  post.lastActivityAt = new Date();
  await post.save();

  return {
    removed: true,
    postId: String(post._id)
  };
}

export async function listDirectConversations(viewerId) {
  const conversations = await Conversation.find({ participantIds: viewerId })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(40)
    .lean();

  return {
    items: await serializeConversations(conversations, viewerId)
  };
}

export async function createOrGetDirectConversation(viewerId, otherUserId) {
  if (String(viewerId) === String(otherUserId)) {
    throw new HttpError(422, "You cannot start a conversation with yourself");
  }

  const otherUser = await User.findById(otherUserId).lean();
  if (!otherUser) {
    throw new HttpError(404, "User not found");
  }

  if (otherUser.profile?.allowDirectMessages === false) {
    throw new HttpError(422, "This user is not accepting direct messages right now");
  }

  const existing = await Conversation.find({
    participantIds: { $all: [viewerId, otherUserId] }
  }).lean();

  const exact = existing.find((item) => item.participantIds.length === 2);
  if (exact) {
    return {
      conversation: (await serializeConversations([exact], viewerId))[0]
    };
  }

  const conversation = await Conversation.create({
    participantIds: [viewerId, otherUserId],
    lastMessageText: "",
    lastMessageAt: new Date(),
    lastMessageSenderId: null
  });

  return {
    conversation: (await serializeConversations([conversation.toObject()], viewerId))[0]
  };
}

export async function listDirectMessages(viewerId, conversationId, limit = 40) {
  const conversation = await ensureConversationAccess(viewerId, conversationId);
  const safeLimit = clampNumber(limit, 1, 80);
  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return {
    conversationId: String(conversation._id),
    items: await serializeMessages(messages.reverse(), viewerId)
  };
}

export async function createDirectMessage(viewerId, conversationId, payload = {}) {
  const conversation = await ensureConversationAccess(viewerId, conversationId);
  const content = normalizeCommunityText(payload.content, {
    fieldName: "Message",
    maxLength: 600
  });
  const participantIds = conversation.participantIds.map((item) => String(item));
  const recipients = participantIds.filter((item) => item !== String(viewerId));
  const deliveryStatus = recipients.some((id) => isUserOnline(id)) ? "delivered" : "sent";

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: viewerId,
    content: content.text,
    moderationFlags: content.flags,
    status: deliveryStatus
  });

  conversation.lastMessageText = content.text;
  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessageSenderId = viewerId;
  await conversation.save();

  const serializedMessage = (await serializeMessages([message.toObject()], viewerId))[0];
  const payloadToEmit = {
    conversationId: String(conversation._id),
    message: serializedMessage
  };

  emitConversationMessage(String(conversation._id), payloadToEmit, participantIds);

  return payloadToEmit;
}

export async function listPresence(userIds = []) {
  return {
    items: getPresenceSnapshot(
      (Array.isArray(userIds) ? userIds : [])
        .map((userId) => String(userId || "").trim())
        .filter(Boolean)
    )
  };
}

async function buildViewerContext(viewerId) {
  if (!viewerId) {
    return {
      viewerId: "",
      followingIds: new Set(),
      mentalStateTag: null
    };
  }

  const [followingRows, latestState] = await Promise.all([
    Follow.find({ followerId: viewerId }).select("followingId").lean(),
    getLatestMentalState(viewerId)
  ]);

  return {
    viewerId: String(viewerId),
    followingIds: new Set(followingRows.map((item) => String(item.followingId))),
    mentalStateTag: normalizeMentalStateTag(latestState?.mentalState, "Balanced")
  };
}

async function fetchPostById(postId) {
  const post = await ForumPost.findById(postId)
    .populate({ path: "userId", select: "name profile" })
    .populate({ path: "comments.userId", select: "name profile" })
    .lean();

  if (!post) {
    throw new HttpError(404, "Post not found");
  }

  return post;
}

function serializePost(post, viewerContext) {
  const authorUser = post.userId && typeof post.userId === "object" ? post.userId : null;
  const viewerId = String(viewerContext.viewerId || "");
  const authorId = authorUser?._id ? String(authorUser._id) : "";
  const isAnonymous = Boolean(post.isAnonymous);
  const visibleComments = (post.comments || []).filter((comment) => comment.status !== "removed");

  return {
    id: String(post._id),
    title: post.title,
    content: post.content,
    tags: Array.isArray(post.tags) ? post.tags : [],
    mentalStateTag: normalizeMentalStateTag(post.mentalStateTag, "Balanced"),
    shareType: normalizeShareType(post.shareType),
    progressSnapshot: post.progressSnapshot || null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    commentCount: visibleComments.length,
    comments: visibleComments.slice(-4).map((comment) => serializeComment(comment, viewerId)),
    reactions: COMMUNITY_REACTIONS.map((reaction) => ({
      ...reaction,
      count: Number(post.reactions?.[reaction.key] || 0),
      active: normalizeReactionUsers(post.reactionUsers)[reaction.key].includes(viewerId)
    })),
    author: {
      id: isAnonymous ? null : authorId || null,
      displayName: isAnonymous ? "Anonymous User" : authorUser?.name || post.authorName || "MindTrack User",
      headline: isAnonymous ? "Shared privately" : authorUser?.profile?.headline || post.mentalStateTag || "Community member",
      initials: buildInitials(isAnonymous ? "Anonymous User" : authorUser?.name || post.authorName || "MindTrack"),
      isAnonymous,
      canMessage:
        !isAnonymous &&
        Boolean(authorId) &&
        Boolean(viewerId) &&
        authorId !== viewerId &&
        authorUser?.profile?.allowDirectMessages !== false,
      canFollow: !isAnonymous && Boolean(authorId) && Boolean(viewerId) && authorId !== viewerId,
      isFollowing: !isAnonymous && Boolean(authorId) && viewerContext.followingIds.has(authorId)
    },
    isOwnPost: Boolean(viewerId && authorId && viewerId === authorId),
    moderationFlags: Array.isArray(post.moderationFlags) ? post.moderationFlags : []
  };
}

function serializeComment(comment, viewerId) {
  const authorUser = comment.userId && typeof comment.userId === "object" ? comment.userId : null;
  const authorId = authorUser?._id ? String(authorUser._id) : comment.userId ? String(comment.userId) : "";
  const isAnonymous = Boolean(comment.isAnonymous);

  return {
    id: String(comment._id),
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: isAnonymous ? null : authorId || null,
      displayName: isAnonymous ? "Anonymous User" : authorUser?.name || comment.authorName || "MindTrack User",
      initials: buildInitials(isAnonymous ? "Anonymous User" : authorUser?.name || comment.authorName || "MindTrack"),
      isAnonymous
    },
    isOwnComment: Boolean(viewerId && authorId && viewerId === authorId)
  };
}

async function ensureFollowable(viewerId, targetUserId) {
  if (String(viewerId) === String(targetUserId)) {
    throw new HttpError(422, "You cannot follow yourself");
  }

  const exists = await User.exists({ _id: targetUserId });
  if (!exists) {
    throw new HttpError(404, "User not found");
  }
}

async function buildFollowState(viewerId, targetUserId) {
  const [followers, following, isFollowing] = await Promise.all([
    Follow.countDocuments({ followingId: targetUserId }),
    Follow.countDocuments({ followerId: targetUserId }),
    Follow.exists({ followerId: viewerId, followingId: targetUserId })
  ]);

  return {
    targetUserId: String(targetUserId),
    followers,
    following,
    isFollowing: Boolean(isFollowing)
  };
}

async function ensureConversationAccess(viewerId, conversationId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new HttpError(404, "Conversation not found");
  }

  const allowed = conversation.participantIds.some((item) => String(item) === String(viewerId));
  if (!allowed) {
    throw new HttpError(403, "Conversation access denied");
  }

  return conversation;
}

async function serializeConversations(conversations, viewerId) {
  const relatedUserIds = new Set();
  conversations.forEach((conversation) => {
    (conversation.participantIds || []).forEach((participantId) => {
      if (String(participantId) !== String(viewerId)) {
        relatedUserIds.add(String(participantId));
      }
    });
  });

  const users = await User.find({ _id: { $in: [...relatedUserIds] } }).lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return conversations.map((conversation) => {
    const participantId = (conversation.participantIds || []).find((item) => String(item) !== String(viewerId));
    const participant = userMap.get(String(participantId || ""));

    return {
      id: String(conversation._id),
      participant: participant
        ? {
            id: String(participant._id),
            name: participant.name,
            headline: participant.profile?.headline || "MindTrack member",
            initials: buildInitials(participant.name),
            isOnline: isUserOnline(participant._id)
          }
        : {
            id: "",
            name: "Unavailable user",
            headline: "Account unavailable",
            initials: "U",
            isOnline: false
          },
      lastMessageText: conversation.lastMessageText || "",
      lastMessageAt: conversation.lastMessageAt,
      lastSenderId: conversation.lastMessageSenderId ? String(conversation.lastMessageSenderId) : null
    };
  });
}

async function serializeMessages(messages, viewerId) {
  const senderIds = [...new Set(messages.map((message) => String(message.senderId)))];
  const users = await User.find({ _id: { $in: senderIds } }).lean();
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return messages.map((message) => {
    const sender = userMap.get(String(message.senderId));
    const senderId = String(message.senderId);

    return {
      id: String(message._id),
      conversationId: String(message.conversationId),
      content: message.content,
      createdAt: message.createdAt,
      status: message.status,
      isOwn: senderId === String(viewerId),
      sender: {
        id: senderId,
        name: sender?.name || "MindTrack member",
        initials: buildInitials(sender?.name || "MindTrack")
      }
    };
  });
}

async function getRequiredUser(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
}

async function getLatestMentalState(userId) {
  if (!userId) {
    return null;
  }

  return MentalState.findOne({ userId }).sort({ createdAt: -1 }).lean();
}

function buildProgressSnapshot(payload = {}) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const whatImproved = normalizeCommunityText(payload.whatImproved, {
    fieldName: "What improved",
    maxLength: 220,
    allowEmpty: true
  });
  const whatHelped = normalizeCommunityText(payload.whatHelped, {
    fieldName: "What helped",
    maxLength: 220,
    allowEmpty: true
  });
  const streakDays = Number(payload.streakDays);
  const moodAverage = Number(payload.moodAverage);
  const exerciseStreak = Number(payload.exerciseStreak);

  if (!whatImproved.text && !whatHelped.text && !Number.isFinite(streakDays) && !Number.isFinite(moodAverage) && !Number.isFinite(exerciseStreak)) {
    return null;
  }

  return {
    whatImproved: whatImproved.text || undefined,
    whatHelped: whatHelped.text || undefined,
    streakDays: Number.isFinite(streakDays) ? streakDays : undefined,
    moodAverage: Number.isFinite(moodAverage) ? moodAverage : undefined,
    exerciseStreak: Number.isFinite(exerciseStreak) ? exerciseStreak : undefined
  };
}

function normalizeScope(value) {
  const scope = String(value || "global").trim().toLowerCase();
  if (scope === "following" || scope === "similar" || scope === "personality" || scope === "mine") {
    return scope === "personality" ? "similar" : scope;
  }

  return "global";
}

function normalizeShareType(value) {
  const type = String(value || "reflection").trim().toLowerCase();
  if (["progress", "streak", "milestone"].includes(type)) {
    return type;
  }

  return "reflection";
}

function normalizeShareTypeFilter(value) {
  const type = String(value || "all").trim().toLowerCase();
  if (["reflection", "progress", "streak", "milestone"].includes(type)) {
    return type;
  }

  return "all";
}

function defaultTitle(shareType) {
  switch (shareType) {
    case "progress":
      return "Progress update";
    case "streak":
      return "Small streak worth sharing";
    case "milestone":
      return "A meaningful step forward";
    default:
      return "A reflection from today";
  }
}

function normalizeReactionCounts(reactions = {}) {
  return Object.fromEntries(
    COMMUNITY_REACTIONS.map((reaction) => [reaction.key, Math.max(0, Number(reactions?.[reaction.key] || 0))])
  );
}

function normalizeReactionUsers(reactionUsers = {}) {
  return Object.fromEntries(
    COMMUNITY_REACTIONS.map((reaction) => [
      reaction.key,
      Array.isArray(reactionUsers?.[reaction.key])
        ? reactionUsers[reaction.key].map((value) => String(value))
        : []
    ])
  );
}

function buildInitials(value = "") {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "MT";
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.trunc(numeric)));
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
