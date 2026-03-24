import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export type CommunityScope = "global" | "following" | "similar";
export type CommunityReactionKey = "support" | "hug" | "strength";

export interface CommunityAuthor {
  id: string | null;
  displayName: string;
  headline: string;
  initials: string;
  isAnonymous: boolean;
  canMessage: boolean;
  canFollow: boolean;
  isFollowing: boolean;
}

export interface CommunityComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string | null;
    displayName: string;
    initials: string;
    isAnonymous: boolean;
  };
  isOwnComment: boolean;
}

export interface CommunityReaction {
  key: CommunityReactionKey;
  label: string;
  emoji: string;
  count: number;
  active: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mentalStateTag: string;
  shareType: "reflection" | "progress" | "streak" | "milestone";
  progressSnapshot: {
    whatImproved?: string;
    whatHelped?: string;
    streakDays?: number;
    moodAverage?: number;
    exerciseStreak?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  comments: CommunityComment[];
  reactions: CommunityReaction[];
  author: CommunityAuthor;
  isOwnPost: boolean;
  moderationFlags: string[];
}

export interface CommunityFeedResponse {
  items: CommunityPost[];
  page: number;
  limit: number;
  hasMore: boolean;
  scope: CommunityScope;
  spotlight: {
    similarMentalState: string | null;
    followingCount: number;
  };
}

export interface FollowState {
  targetUserId: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

export interface CommunityProfileResponse {
  profile: {
    id: string;
    name: string;
    headline: string;
    bio: string;
    allowDirectMessages: boolean;
    shareProgressPublicly: boolean;
    initials: string;
  };
  social: {
    followers: number;
    following: number;
    posts: number;
    progressShares: number;
  };
  currentMentalState: string | null;
  isOwnProfile: boolean;
  isFollowing: boolean;
  canMessage: boolean;
  activitySummary: {
    moodCheckIns30d: number;
    exerciseCompleted30d: number;
    journalEntries30d: number;
  } | null;
  recentPosts: CommunityPost[];
}

export interface ConversationSummary {
  id: string;
  participant: {
    id: string;
    name: string;
    headline: string;
    initials: string;
    isOnline: boolean;
  };
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderId: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
  isOwn: boolean;
  sender: {
    id: string;
    name: string;
    initials: string;
  };
}

interface ConversationListResponse {
  items: ConversationSummary[];
}

interface MessageListResponse {
  conversationId: string;
  items: ConversationMessage[];
}

@Injectable({ providedIn: "root" })
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly communityUrl = `${this.apiBaseUrl}/community`;

  listFeed(scope: CommunityScope, page = 1, limit = 8): Observable<CommunityFeedResponse> {
    const params = new HttpParams()
      .set("scope", scope)
      .set("page", String(page))
      .set("limit", String(limit));

    return this.http.get<CommunityFeedResponse>(this.communityUrl, { params });
  }

  createPost(payload: {
    title: string;
    content: string;
    tags?: string[];
    mentalStateTag?: string;
    isAnonymous: boolean;
    anonymousAlias?: string;
    shareType?: "reflection" | "progress" | "streak" | "milestone";
    progressSnapshot?: CommunityPost["progressSnapshot"];
  }): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(this.communityUrl, payload);
  }

  addComment(postId: string, payload: { content: string; isAnonymous?: boolean; anonymousAlias?: string }): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.communityUrl}/${postId}/comments`, payload);
  }

  toggleReaction(postId: string, reaction: CommunityReactionKey): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.communityUrl}/${postId}/reactions`, { reaction });
  }

  reportPost(postId: string, reason: string): Observable<{ reported: boolean; status: string }> {
    return this.http.post<{ reported: boolean; status: string }>(`${this.communityUrl}/${postId}/report`, { reason });
  }

  getProfile(userId: string): Observable<CommunityProfileResponse> {
    return this.http.get<CommunityProfileResponse>(`${this.communityUrl}/profiles/${userId}`);
  }

  follow(userId: string): Observable<FollowState> {
    return this.http.post<FollowState>(`${this.communityUrl}/follow/${userId}`, {});
  }

  unfollow(userId: string): Observable<FollowState> {
    return this.http.delete<FollowState>(`${this.communityUrl}/follow/${userId}`);
  }

  listConversations(): Observable<ConversationListResponse> {
    return this.http.get<ConversationListResponse>(`${this.communityUrl}/conversations`);
  }

  createConversation(userId: string): Observable<{ conversation: ConversationSummary }> {
    return this.http.post<{ conversation: ConversationSummary }>(`${this.communityUrl}/conversations`, { userId });
  }

  listMessages(conversationId: string, limit = 40): Observable<MessageListResponse> {
    const params = new HttpParams().set("limit", String(limit));
    return this.http.get<MessageListResponse>(`${this.communityUrl}/conversations/${conversationId}/messages`, { params });
  }

  sendMessage(conversationId: string, content: string): Observable<{ conversationId: string; message: ConversationMessage }> {
    return this.http.post<{ conversationId: string; message: ConversationMessage }>(
      `${this.communityUrl}/conversations/${conversationId}/messages`,
      { content }
    );
  }
}
