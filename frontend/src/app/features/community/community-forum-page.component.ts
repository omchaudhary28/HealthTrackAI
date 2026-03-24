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
  ConversationMessage,
  ConversationSummary
} from "../../core/services/community.service";
import { RealtimeService } from "../../core/services/realtime.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-community-forum-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.8),rgba(255,255,255,0.52),rgba(99,102,241,0.08))] p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="min-w-0">
            <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Community</div>
            <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Supportive social space with calm sharing, follows, and live chat.</h1>
            <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
              Share reflections or progress wins, follow people who feel relatable, and message them in a low-pressure space. Anonymous mode stays available for anything that should remain private.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500">
              Similar state: {{ spotlightMentalState || 'Balanced' }}
            </div>
            <a routerLink="/feedback" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Product feedback</a>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <button
            *ngFor="let item of scopes"
            type="button"
            (click)="setScope(item.key)"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition"
            [class.border-slate-900]="scope === item.key"
            [class.bg-slate-900]="scope === item.key"
            [class.text-white]="scope === item.key"
            [class.border-slate-200]="scope !== item.key"
            [class.text-slate-600]="scope !== item.key">
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div class="space-y-6">
          <form class="glass-card rounded-[2rem] p-6" (ngSubmit)="createPost()">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-sm font-semibold text-slate-900">Create a post</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Share a reflection, progress win, streak, or something that helped.</div>
              </div>
              <label class="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <input [(ngModel)]="compose.isAnonymous" name="isAnonymous" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
                Anonymous mode
              </label>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="block text-sm font-medium text-slate-600">
                Title
                <input [(ngModel)]="compose.title" name="title" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Example: A small win from this week" />
              </label>

              <label class="block text-sm font-medium text-slate-600">
                Mental state tag
                <select [(ngModel)]="compose.mentalStateTag" name="mentalStateTag" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100">
                  <option *ngFor="let state of mentalStates" [ngValue]="state">{{ state }}</option>
                </select>
              </label>
            </div>

            <div class="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <label class="block text-sm font-medium text-slate-600">
                Share type
                <select [(ngModel)]="compose.shareType" name="shareType" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100">
                  <option value="reflection">Reflection</option>
                  <option value="progress">Progress update</option>
                  <option value="streak">Streak</option>
                  <option value="milestone">Milestone</option>
                </select>
              </label>

              <label *ngIf="compose.isAnonymous" class="block text-sm font-medium text-slate-600">
                Anonymous alias
                <input [(ngModel)]="compose.anonymousAlias" name="anonymousAlias" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Optional. Example: Quiet Lantern" />
              </label>
            </div>

            <label class="mt-4 block text-sm font-medium text-slate-600">
              Content
              <textarea [(ngModel)]="compose.content" name="content" rows="5" class="mt-2 w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="What improved? What feels hard? What helped a little?"></textarea>
            </label>

            <div *ngIf="compose.shareType !== 'reflection'" class="mt-4 grid gap-4 md:grid-cols-2">
              <label class="block text-sm font-medium text-slate-600">
                What improved
                <textarea [(ngModel)]="compose.whatImproved" name="whatImproved" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Example: I recovered faster after stressful meetings."></textarea>
              </label>

              <label class="block text-sm font-medium text-slate-600">
                What helped
                <textarea [(ngModel)]="compose.whatHelped" name="whatHelped" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="Example: Breathing, journaling, and cutting late-night scrolling."></textarea>
              </label>
            </div>

            <div *ngIf="compose.shareType !== 'reflection'" class="mt-4 grid gap-4 sm:grid-cols-3">
              <label class="block text-sm font-medium text-slate-600">
                Streak days
                <input [(ngModel)]="compose.streakDays" name="streakDays" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">
                Mood average
                <input [(ngModel)]="compose.moodAverage" name="moodAverage" type="number" step="0.1" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">
                Exercise streak
                <input [(ngModel)]="compose.exerciseStreak" name="exerciseStreak" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
              </label>
            </div>

            <label class="mt-4 block text-sm font-medium text-slate-600">
              Tags
              <input [(ngModel)]="compose.tags" name="tags" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" placeholder="sleep, journaling, overthinking" />
            </label>

            <div *ngIf="createError" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ createError }}
            </div>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div class="text-xs leading-6 text-slate-500">Safety filters block hostile or harmful language. Reactions stay supportive only.</div>
              <button type="submit" [disabled]="creatingPost" class="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60">
                {{ creatingPost ? 'Posting...' : 'Post to community' }}
              </button>
            </div>
          </form>

          <div class="space-y-4">
            <div *ngIf="loadingFeed" class="glass-card rounded-[2rem] p-6 text-sm text-slate-500">Loading community feed...</div>
            <div *ngIf="feedError" class="rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">{{ feedError }}</div>
            <div *ngIf="!loadingFeed && !feed.length" class="glass-card rounded-[2rem] p-6 text-sm text-slate-500">
              No posts match this feed yet. Start the tone by sharing the first supportive update.
            </div>

            <article *ngFor="let post of feed; trackBy: trackById" appScrollReveal class="glass-card rounded-[2rem] p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 gap-3">
                  <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {{ post.author.initials }}
                  </div>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <ng-container *ngIf="post.author.id; else anonymousName">
                        <a [routerLink]="['/profile', post.author.id]" class="text-sm font-semibold text-slate-900 hover:text-[var(--mt-accent-strong)]">
                          {{ post.author.displayName }}
                        </a>
                      </ng-container>
                      <ng-template #anonymousName>
                        <div class="text-sm font-semibold text-slate-900">{{ post.author.displayName }}</div>
                      </ng-template>
                      <span class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--mt-accent-strong)]">
                        {{ post.mentalStateTag }}
                      </span>
                      <span *ngIf="post.shareType !== 'reflection'" class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        {{ label(post.shareType) }}
                      </span>
                    </div>
                    <div class="mt-1 text-xs text-slate-400">{{ post.author.headline }} · {{ post.createdAt | date: 'mediumDate' }}</div>
                  </div>
                </div>

                <div class="flex flex-wrap justify-end gap-2">
                  <button *ngIf="post.author.canFollow" type="button" (click)="toggleFollow(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">
                    {{ post.author.isFollowing ? 'Following' : 'Follow' }}
                  </button>
                  <button *ngIf="post.author.canMessage && post.author.id" type="button" (click)="startConversation(post.author.id)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">
                    Message
                  </button>
                </div>
              </div>

              <h2 class="mt-4 text-xl font-semibold text-slate-900">{{ post.title }}</h2>
              <p class="mt-3 text-sm leading-8 text-slate-600">{{ post.content }}</p>

              <div *ngIf="post.progressSnapshot" class="mt-4 grid gap-3 sm:grid-cols-2">
                <div *ngIf="post.progressSnapshot.whatImproved" class="rounded-3xl bg-slate-50 px-4 py-4">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">What improved</div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ post.progressSnapshot.whatImproved }}</div>
                </div>
                <div *ngIf="post.progressSnapshot.whatHelped" class="rounded-3xl bg-slate-50 px-4 py-4">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">What helped</div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ post.progressSnapshot.whatHelped }}</div>
                </div>
                <div *ngIf="post.progressSnapshot.streakDays" class="rounded-3xl bg-slate-50 px-4 py-4">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Streak days</div>
                  <div class="mt-2 text-2xl font-semibold text-slate-900">{{ post.progressSnapshot.streakDays }}</div>
                </div>
                <div *ngIf="post.progressSnapshot.moodAverage" class="rounded-3xl bg-slate-50 px-4 py-4">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood average</div>
                  <div class="mt-2 text-2xl font-semibold text-slate-900">{{ post.progressSnapshot.moodAverage }}</div>
                </div>
              </div>

              <div *ngIf="post.tags.length" class="mt-4 flex flex-wrap gap-2">
                <span *ngFor="let tag of post.tags" class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  #{{ tag }}
                </span>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  *ngFor="let reaction of post.reactions"
                  type="button"
                  (click)="toggleReaction(post, reaction.key)"
                  class="rounded-full border px-3 py-2 text-xs font-semibold transition"
                  [class.border-slate-900]="reaction.active"
                  [class.bg-slate-900]="reaction.active"
                  [class.text-white]="reaction.active"
                  [class.border-slate-200]="!reaction.active"
                  [class.text-slate-600]="!reaction.active">
                  {{ reaction.emoji }} {{ reaction.count }}
                </button>
                <button type="button" (click)="sharePost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Share</button>
                <button type="button" (click)="reportPost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Report</button>
              </div>

              <div class="mt-5 rounded-[1.75rem] bg-slate-50/80 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm font-semibold text-slate-900">Comments</div>
                  <div class="text-xs text-slate-400">{{ post.commentCount }} total</div>
                </div>

                <div class="mt-3 space-y-3">
                  <div *ngFor="let comment of post.comments" class="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>{{ comment.author.displayName }}</span>
                      <span class="text-slate-300">&middot;</span>
                      <span>{{ comment.createdAt | date: 'short' }}</span>
                    </div>
                    <div class="mt-2 text-sm leading-7 text-slate-600">{{ comment.content }}</div>
                  </div>
                </div>

                <div class="mt-4 flex gap-3">
                  <input
                    [(ngModel)]="draftComments[post.id]"
                    [ngModelOptions]="{ standalone: true }"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                    placeholder="Add a supportive comment..." />
                  <button
                    type="button"
                    (click)="submitComment(post)"
                    [disabled]="commentPending[post.id]"
                    class="btn-primary shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60">
                    {{ commentPending[post.id] ? 'Sending...' : 'Send' }}
                  </button>
                </div>
              </div>
            </article>

            <div *ngIf="hasMore" class="flex justify-center pt-2">
              <button type="button" (click)="loadFeed(false)" [disabled]="loadingMore" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
                {{ loadingMore ? 'Loading...' : 'Load more posts' }}
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">Community principles</div>
            <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">Support people without diagnosing them.</div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">Use anonymous mode whenever privacy matters more than recognition.</div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">Report anything hostile, unsafe, or manipulative so moderators can review it.</div>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">Direct messages</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Low-pressure 1:1 support with online state and typing indicators.</div>
              </div>
              <button type="button" (click)="loadConversations()" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Refresh</button>
            </div>

            <div class="mt-4 space-y-3">
              <button
                *ngFor="let conversation of conversations; trackBy: trackById"
                type="button"
                (click)="selectConversation(conversation)"
                class="flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition"
                [class.border-slate-900]="selectedConversation?.id === conversation.id"
                [class.bg-slate-900]="selectedConversation?.id === conversation.id"
                [class.text-white]="selectedConversation?.id === conversation.id"
                [class.border-slate-100]="selectedConversation?.id !== conversation.id"
                [class.bg-white]="selectedConversation?.id !== conversation.id">
                <div class="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-sm font-semibold" [class.bg-slate-100]="selectedConversation?.id !== conversation.id">
                  <span [class.text-slate-900]="selectedConversation?.id !== conversation.id">{{ conversation.participant.initials }}</span>
                  <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                    [class.bg-emerald-400]="conversation.participant.isOnline"
                    [class.bg-slate-300]="!conversation.participant.isOnline"></span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-semibold">{{ conversation.participant.name }}</div>
                  <div class="mt-1 text-xs opacity-75">{{ conversation.participant.headline }}</div>
                  <div class="mt-2 truncate text-xs opacity-75">{{ conversation.lastMessageText || 'No messages yet' }}</div>
                </div>
              </button>

              <div *ngIf="!conversations.length" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                Follow someone or tap Message on a post author to start a conversation.
              </div>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6">
            <div *ngIf="selectedConversation; else emptyChat">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ selectedConversation?.participant?.name }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ selectedConversation?.participant?.isOnline ? 'Online now' : 'Offline' }} · {{ selectedConversation?.participant?.headline }}
                  </div>
                </div>
                <a [routerLink]="['/profile', selectedConversation?.participant?.id]" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">View profile</a>
              </div>

              <div class="mt-4 h-[20rem] space-y-3 overflow-y-auto rounded-[1.75rem] bg-slate-50/80 p-4">
                <div *ngIf="chatLoading" class="text-sm text-slate-500">Loading messages...</div>
                <div *ngFor="let message of messages; trackBy: trackById" class="flex" [class.justify-end]="message.isOwn">
                  <div class="max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-sm"
                    [class.bg-slate-900]="message.isOwn"
                    [class.text-white]="message.isOwn"
                    [class.bg-white]="!message.isOwn"
                    [class.text-slate-700]="!message.isOwn">
                    <div>{{ message.content }}</div>
                    <div class="mt-2 text-[11px] opacity-70">{{ message.createdAt | date: 'shortTime' }}</div>
                  </div>
                </div>
                <div *ngIf="typingLabel" class="text-xs font-semibold text-slate-500">{{ typingLabel }}</div>
              </div>

              <div class="mt-4 flex gap-3">
                <input
                  [(ngModel)]="chatDraft"
                  [ngModelOptions]="{ standalone: true }"
                  (ngModelChange)="handleTyping()"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Send a calm, supportive message..." />
                <button type="button" (click)="sendMessage()" [disabled]="chatPending" class="btn-primary rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60">
                  {{ chatPending ? 'Sending...' : 'Send' }}
                </button>
              </div>
            </div>

            <ng-template #emptyChat>
              <div class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                Select a conversation to start chatting in real time.
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CommunityForumPageComponent implements OnInit, OnDestroy {
  readonly scopes: Array<{ key: CommunityScope; label: string }> = [
    { key: "global", label: "Global feed" },
    { key: "following", label: "Following" },
    { key: "similar", label: "Similar minds" }
  ];
  readonly mentalStates = ["Overthinker", "Stressed", "Depressed", "FOMO", "Balanced"];

  scope: CommunityScope = "global";
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
    shareType: "reflection" as "reflection" | "progress" | "streak" | "milestone",
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

  ngOnInit(): void {
    this.realtimeService.ensureConnected();
    this.loadFeed(true);
    this.loadConversations();

    this.subs.add(
      this.realtimeService.communityPostCreated$.subscribe((post) => {
        if (this.scope === "global") {
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
          this.router.navigate([], { queryParams: { chatUser: null }, queryParamsHandling: "merge" });
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

  loadFeed(reset: boolean): void {
    if (reset) {
      this.page = 1;
      this.feed = [];
      this.loadingFeed = true;
    } else {
      this.loadingMore = true;
    }

    this.feedError = "";

    this.communityService.listFeed(this.scope, this.page, 8).subscribe({
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
          this.feed = [post, ...this.feed.filter((item) => item.id !== post.id)];
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

  toggleFollow(post: CommunityPost): void {
    const userId = post.author.id;
    if (!userId) {
      return;
    }

    const request = post.author.isFollowing ? this.communityService.unfollow(userId) : this.communityService.follow(userId);
    request.subscribe({
      next: (state) => {
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
