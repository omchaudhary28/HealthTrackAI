import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import {
  CommunityPost,
  CommunityReactionKey,
  CommunityScope,
  CommunityService,
  CommunityShareType,
  ConversationMessage,
  ConversationSummary,
  DiscoverUser
} from "../../core/services/community.service";
import { RealtimeService } from "../../core/services/realtime.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-community-forum-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink],
  templateUrl: "./community-forum-page.component.html"
})
export class CommunityForumPageComponent implements OnInit, OnDestroy {
  readonly scopes: Array<{ key: CommunityScope; label: string }> = [
    { key: "global", label: "Global feed" },
    { key: "following", label: "Following" },
    { key: "similar", label: "Similar minds" },
    { key: "mine", label: "My posts" }
  ];
  readonly shareFilters: Array<{ key: CommunityShareType; label: string }> = [
    { key: "all", label: "All" },
    { key: "reflection", label: "Reflections" },
    { key: "progress", label: "Progress" },
    { key: "streak", label: "Streaks" },
    { key: "milestone", label: "Milestones" }
  ];
  readonly mentalStates = ["Overthinker", "Stressed", "Depressed", "FOMO", "Balanced"];

  scope: CommunityScope = "global";
  activeShareFilter: CommunityShareType = "all";
  spotlightMentalState: string | null = null;
  feed: CommunityPost[] = [];
  page = 1;
  hasMore = false;
  loadingFeed = true;
  loadingMore = false;
  feedError = "";
  creatingPost = false;
  createError = "";
  commentPending: Record<string, boolean> = {};
  draftComments: Record<string, string> = {};
  discoverUsers: DiscoverUser[] = [];
  discoverLoading = true;
  discoverError = "";

  conversations: ConversationSummary[] = [];
  selectedConversation: ConversationSummary | null = null;
  messages: ConversationMessage[] = [];
  chatDraft = "";
  chatPending = false;
  chatLoading = false;
  typingLabel = "";

  compose = {
    title: "",
    content: "",
    tags: "",
    mentalStateTag: "Balanced",
    isAnonymous: true,
    anonymousAlias: "",
    shareType: "reflection" as Exclude<CommunityShareType, "all">,
    whatImproved: "",
    whatHelped: "",
    streakDays: null as number | null,
    moodAverage: null as number | null,
    exerciseStreak: null as number | null
  };

  private readonly subs = new Subscription();
  private typingTimer?: ReturnType<typeof setTimeout>;
  private handledChatUserId = "";

  constructor(
    private readonly communityService: CommunityService,
    private readonly realtimeService: RealtimeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  get emptyFeedLabel(): string {
    if (this.scope === "mine") {
      return "Your account has no posts in this filter yet. Create your first post above and it will show up here and on your profile.";
    }

    if (this.scope === "following") {
      return "Follow a few people to build a more personal feed.";
    }

    return "No posts match this feed yet. Start the tone by sharing the first supportive update.";
  }

  ngOnInit(): void {
    this.realtimeService.ensureConnected();
    this.loadFeed(true);
    this.loadDiscover();
    this.loadConversations();

    this.subs.add(
      this.realtimeService.communityPostCreated$.subscribe((post) => {
        if (this.shouldDisplayInCurrentFeed(post)) {
          this.feed = [post, ...this.feed.filter((item) => item.id !== post.id)];
        }
      })
    );

    this.subs.add(
      this.realtimeService.communityPostUpdated$.subscribe((post) => {
        this.feed = this.feed.map((item) => (item.id === post.id ? post : item));
      })
    );

    this.subs.add(
      this.realtimeService.conversationMessage$.subscribe((payload) => {
        this.upsertConversationPreview(payload.conversationId, payload.message);
        if (this.selectedConversation?.id === payload.conversationId && !this.messages.some((item) => item.id === payload.message.id)) {
          this.messages = [...this.messages, payload.message];
        }
      })
    );

    this.subs.add(
      this.realtimeService.conversationTyping$.subscribe((payload) => {
        if (this.selectedConversation?.id !== payload.conversationId) {
          return;
        }

        this.typingLabel = payload.isTyping ? `${this.selectedConversation?.participant.name || "Someone"} is typing...` : "";
      })
    );

    this.subs.add(
      this.realtimeService.presenceUpdate$.subscribe((payload) => {
        this.conversations = this.conversations.map((conversation) =>
          conversation.participant.id === payload.userId
            ? { ...conversation, participant: { ...conversation.participant, isOnline: payload.isOnline } }
            : conversation
        );

        if (this.selectedConversation?.participant.id === payload.userId) {
          this.selectedConversation = {
            ...this.selectedConversation,
            participant: { ...this.selectedConversation.participant, isOnline: payload.isOnline }
          };
        }
      })
    );

    this.subs.add(
      this.realtimeService.presenceSnapshot$.subscribe((items) => {
        items.forEach((item) => {
          this.conversations = this.conversations.map((conversation) =>
            conversation.participant.id === item.userId
              ? { ...conversation, participant: { ...conversation.participant, isOnline: item.isOnline } }
              : conversation
          );
        });
      })
    );

    this.subs.add(
      this.route.queryParamMap.subscribe((params) => {
        const chatUser = params.get("chatUser");
        if (chatUser && chatUser !== this.handledChatUserId) {
          this.handledChatUserId = chatUser;
          this.startConversation(chatUser);
          void this.router.navigate([], { queryParams: { chatUser: null }, queryParamsHandling: "merge" });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  setScope(scope: CommunityScope): void {
    if (this.scope === scope) {
      return;
    }

    this.scope = scope;
    this.loadFeed(true);
  }

  setShareFilter(filter: CommunityShareType): void {
    if (this.activeShareFilter === filter) {
      return;
    }

    this.activeShareFilter = filter;
    this.loadFeed(true);
  }

  loadFeed(reset: boolean): void {
    if (reset) {
      this.page = 1;
      this.feed = [];
      this.loadingFeed = true;
    } else {
      this.loadingMore = true;
    }

    this.feedError = "";

    this.communityService.listFeed(this.scope, this.page, 8, this.activeShareFilter).subscribe({
      next: (response) => {
        this.feed = reset ? response.items : [...this.feed, ...response.items];
        this.hasMore = response.hasMore;
        this.spotlightMentalState = response.spotlight.similarMentalState;
        this.loadingFeed = false;
        this.loadingMore = false;
        if (response.hasMore) {
          this.page += 1;
        }
      },
      error: (err) => {
        this.loadingFeed = false;
        this.loadingMore = false;
        this.feedError = err?.error?.error || "Unable to load the community feed right now.";
      }
    });
  }

  loadDiscover(): void {
    this.discoverLoading = true;
    this.discoverError = "";

    this.communityService.listDiscover(6).subscribe({
      next: (response) => {
        this.discoverUsers = response.items || [];
        this.discoverLoading = false;
      },
      error: () => {
        this.discoverUsers = [];
        this.discoverLoading = false;
        this.discoverError = "Unable to load discover suggestions right now.";
      }
    });
  }

  createPost(): void {
    if (this.creatingPost) {
      return;
    }

    this.creatingPost = true;
    this.createError = "";

    this.communityService
      .createPost({
        title: this.compose.title,
        content: this.compose.content,
        tags: splitList(this.compose.tags),
        mentalStateTag: this.compose.mentalStateTag,
        isAnonymous: this.compose.isAnonymous,
        anonymousAlias: this.compose.anonymousAlias,
        shareType: this.compose.shareType,
        progressSnapshot:
          this.compose.shareType === "reflection"
            ? null
            : {
                whatImproved: this.compose.whatImproved || undefined,
                whatHelped: this.compose.whatHelped || undefined,
                streakDays: this.compose.streakDays ?? undefined,
                moodAverage: this.compose.moodAverage ?? undefined,
                exerciseStreak: this.compose.exerciseStreak ?? undefined
              }
      })
      .subscribe({
        next: (post) => {
          this.creatingPost = false;
          if (this.shouldDisplayInCurrentFeed(post)) {
            this.feed = [post, ...this.feed.filter((item) => item.id !== post.id)];
          }
          this.resetCompose();
        },
        error: (err) => {
          this.creatingPost = false;
          this.createError = err?.error?.error || "Unable to create this post right now.";
        }
      });
  }

  submitComment(post: CommunityPost): void {
    const content = String(this.draftComments[post.id] || "").trim();
    if (!content || this.commentPending[post.id]) {
      return;
    }

    this.commentPending[post.id] = true;
    this.communityService.addComment(post.id, { content, isAnonymous: true }).subscribe({
      next: (updated) => {
        this.commentPending[post.id] = false;
        this.draftComments[post.id] = "";
        this.replacePost(updated);
      },
      error: () => {
        this.commentPending[post.id] = false;
      }
    });
  }

  toggleReaction(post: CommunityPost, reaction: CommunityReactionKey): void {
    this.communityService.toggleReaction(post.id, reaction).subscribe({
      next: (updated) => this.replacePost(updated)
    });
  }

  reportPost(post: CommunityPost): void {
    this.communityService.reportPost(post.id, "Needs moderator review").subscribe();
  }

  removePost(post: CommunityPost): void {
    if (!post.isOwnPost) {
      return;
    }

    this.communityService.deletePost(post.id).subscribe({
      next: () => {
        this.feed = this.feed.filter((item) => item.id !== post.id);
      }
    });
  }

  toggleFollow(post: CommunityPost): void {
    const userId = post.author.id;
    if (!userId) {
      return;
    }

    const request = post.author.isFollowing ? this.communityService.unfollow(userId) : this.communityService.follow(userId);
    request.subscribe({
      next: (state) => {
        if (this.scope === "following" && !state.isFollowing) {
          this.feed = this.feed.filter((item) => item.author.id !== userId);
        } else {
          this.feed = this.feed.map((item) =>
            item.author.id === userId
              ? {
                  ...item,
                  author: {
                    ...item.author,
                    isFollowing: state.isFollowing
                  }
                }
              : item
          );
        }

        this.loadDiscover();
      }
    });
  }

  followSuggestedUser(user: DiscoverUser): void {
    this.communityService.follow(user.id).subscribe({
      next: () => {
        this.discoverUsers = this.discoverUsers.filter((item) => item.id !== user.id);
        if (this.scope === "following") {
          this.loadFeed(true);
        }
      }
    });
  }

  sharePost(post: CommunityPost): void {
    const text = `I'm improving my mental health with MindTrack AI \ud83d\udc99\n\n${post.title}`;

    if (navigator.share) {
      void navigator.share({ title: "MindTrack AI", text });
      return;
    }

    void navigator.clipboard?.writeText(text);
  }

  loadConversations(): void {
    this.communityService.listConversations().subscribe({
      next: (response) => {
        this.conversations = response.items || [];
        this.realtimeService.subscribePresence(this.conversations.map((item) => item.participant.id));
      },
      error: () => {
        this.conversations = [];
      }
    });
  }

  startConversation(userId: string): void {
    this.communityService.createConversation(userId).subscribe({
      next: (response) => {
        const conversation = response.conversation;
        if (!conversation) {
          return;
        }

        this.conversations = [conversation, ...this.conversations.filter((item) => item.id !== conversation.id)];
        this.selectConversation(conversation);
      }
    });
  }

  selectConversation(conversation: ConversationSummary): void {
    this.selectedConversation = conversation;
    this.chatLoading = true;
    this.typingLabel = "";
    this.messages = [];
    this.realtimeService.joinConversation(conversation.id);
    this.realtimeService.subscribePresence([conversation.participant.id]);

    this.communityService.listMessages(conversation.id).subscribe({
      next: (response) => {
        this.chatLoading = false;
        this.messages = response.items || [];
      },
      error: () => {
        this.chatLoading = false;
        this.messages = [];
      }
    });
  }

  sendMessage(): void {
    const conversation = this.selectedConversation;
    const content = this.chatDraft.trim();
    if (!conversation || !content || this.chatPending) {
      return;
    }

    this.chatPending = true;
    this.communityService.sendMessage(conversation.id, content).subscribe({
      next: (response) => {
        this.chatPending = false;
        this.chatDraft = "";
        this.typingLabel = "";
        this.realtimeService.sendTyping(conversation.id, false);
        if (!this.messages.some((item) => item.id === response.message.id)) {
          this.messages = [...this.messages, response.message];
        }
        this.upsertConversationPreview(conversation.id, response.message);
      },
      error: () => {
        this.chatPending = false;
      }
    });
  }

  handleTyping(): void {
    if (!this.selectedConversation) {
      return;
    }

    this.realtimeService.sendTyping(this.selectedConversation.id, true);

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      if (this.selectedConversation) {
        this.realtimeService.sendTyping(this.selectedConversation.id, false);
      }
    }, 1200);
  }

  label(value: string): string {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private replacePost(post: CommunityPost): void {
    this.feed = this.feed.map((item) => (item.id === post.id ? post : item));
  }

  private resetCompose(): void {
    this.compose = {
      title: "",
      content: "",
      tags: "",
      mentalStateTag: this.spotlightMentalState || "Balanced",
      isAnonymous: true,
      anonymousAlias: "",
      shareType: "reflection",
      whatImproved: "",
      whatHelped: "",
      streakDays: null,
      moodAverage: null,
      exerciseStreak: null
    };
  }

  private shouldDisplayInCurrentFeed(post: CommunityPost): boolean {
    if (this.activeShareFilter !== "all" && post.shareType !== this.activeShareFilter) {
      return false;
    }

    if (this.scope === "global") {
      return true;
    }

    if (this.scope === "similar") {
      return post.mentalStateTag === (this.spotlightMentalState || post.mentalStateTag);
    }

    if (this.scope === "mine") {
      return post.isOwnPost;
    }

    return false;
  }

  private upsertConversationPreview(conversationId: string, message: ConversationMessage): void {
    this.conversations = this.conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            lastMessageText: message.content,
            lastMessageAt: message.createdAt,
            lastSenderId: message.sender.id
          }
        : conversation
    );

    this.conversations.sort((left, right) => {
      const leftTime = new Date(left.lastMessageAt || 0).getTime();
      const rightTime = new Date(right.lastMessageAt || 0).getTime();
      return rightTime - leftTime;
    });
  }
}

function splitList(value: string): string[] {
  return String(value || "")
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
