import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService, UserProfile } from "../../core/services/auth.service";
import { CommunityPost, CommunityProfileResponse, CommunityService, CommunityShareType } from "../../core/services/community.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";
import { shareTextSafely } from "../../core/utils/share";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div *ngIf="loadingProfile" class="glass-card rounded-[2rem] p-8 text-sm text-slate-500">Loading profile...</div>

      <ng-container *ngIf="!loadingProfile && profileData as profile">
        <div class="mt-card mt-card-hover page-hero">
          <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div class="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] p-[3px] shadow-[0_24px_44px_-28px_rgba(129,52,175,0.55)]">
                <div class="grid h-full w-full place-items-center rounded-full bg-white text-2xl font-black text-slate-950">
                  {{ profile.profile.initials }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="profile" className="text-base"></app-icon>
                  </div>
                  <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Profile</div>
                </div>
                <h1 class="mt-3 text-2xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-3xl lg:text-4xl">{{ profile.profile.name }}</h1>
                <div class="mt-2 text-base font-semibold text-[var(--mt-accent-strong)]">
                  {{ profile.profile.headline || "'One step at a time.'" }}
                </div>
                <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:leading-8">
                  {{ profile.profile.bio || "Keeping it simple: mood, notes, exercises, progress." }}
                </p>
              </div>
            </div>

            <div class="cluster-actions">
              <div class="rounded-full bg-[var(--mt-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--mt-accent-strong)]">
                {{ profile.currentMentalState || "Balanced" }}
              </div>
              <a *ngIf="profile.isOwnProfile" routerLink="/community/create" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Create post</a>
              <button type="button" (click)="shareProfile()" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Share</button>
              <button *ngIf="!profile.isOwnProfile" type="button" (click)="toggleFollow()" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                {{ profile.isFollowing ? "Following" : "Follow" }}
              </button>
              <button *ngIf="!profile.isOwnProfile && profile.canMessage" type="button" (click)="messageUser()" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                Message
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_22rem]">
          <div class="space-y-6">
            <div class="mt-card mt-card-hover p-5 sm:p-6">
              <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div class="mt-card-brand">
                  <div class="mt-card-icon">
                    <app-icon name="analytics" className="text-lg"></app-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-950">
                      {{ profile.isOwnProfile ? "Tracking summary" : "Public tracking summary" }}
                    </div>
                    <div class="mt-1 text-xs leading-5 text-slate-500">
                      {{ profile.isOwnProfile ? "Your main signals, minus the noise." : "Shared signals first." }}
                    </div>
                  </div>
                </div>
                <div class="rounded-full bg-[rgba(243,248,253,0.92)] px-4 py-2 text-xs font-semibold text-slate-600">
                  State: {{ profile.currentMentalState || "Balanced" }}
                </div>
              </div>

              <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div class="mt-card-soft px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Mood logs</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">
                    {{ profile.activitySummary ? profile.activitySummary.moodCheckIns30d : profile.isOwnProfile ? 0 : "Private" }}
                  </div>
                </div>
                <div class="mt-card-soft px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Exercises</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">
                    {{ profile.activitySummary ? profile.activitySummary.exerciseCompleted30d : profile.isOwnProfile ? 0 : "Private" }}
                  </div>
                </div>
                <div class="mt-card-soft px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Journal entries</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">
                    {{ profile.activitySummary ? profile.activitySummary.journalEntries30d : profile.isOwnProfile ? 0 : "Private" }}
                  </div>
                </div>
                <div class="mt-card-soft px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Community posts</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">{{ profile.social.posts }}</div>
                </div>
              </div>

              <div *ngIf="profile.isOwnProfile && summary?.aiInsightsHistory?.length" class="mt-5 grid gap-4 md:grid-cols-2">
                <div *ngFor="let insight of (summary?.aiInsightsHistory || []).slice(0, 2)" class="mt-card-soft px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">AI insight</div>
                  <div class="mt-2 text-base font-semibold text-slate-950">{{ insight.title }}</div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ insight.description }}</div>
                </div>
              </div>
            </div>

            <div class="mt-card mt-card-hover p-4 sm:p-5">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="users" className="text-base"></app-icon>
                </div>
                <div class="text-sm font-semibold text-slate-950">Community snapshot</div>
              </div>
              <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div class="mt-card-soft border border-slate-100 bg-white px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Followers</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">{{ profile.social.followers }}</div>
                </div>
                <div class="mt-card-soft border border-slate-100 bg-white px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Following</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">{{ profile.social.following }}</div>
                </div>
                <div class="mt-card-soft border border-slate-100 bg-white px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Posts</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">{{ profile.social.posts }}</div>
                </div>
                <div class="mt-card-soft border border-slate-100 bg-white px-4 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Progress shares</div>
                  <div class="mt-2 text-2xl font-bold text-slate-950">{{ profile.social.progressShares }}</div>
                </div>
              </div>
            </div>

            <div class="mt-card mt-card-hover p-4 sm:p-5">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="comments" className="text-base"></app-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-950">Posts</div>
                    <div class="mt-1 text-xs leading-5 text-slate-500">Short updates only.</div>
                  </div>
                </div>

                <div class="chip-scroll">
                  <button
                    type="button"
                    (click)="setPostFilter('all')"
                    class="rounded-full border px-4 py-2 text-xs font-semibold transition"
                    [class.border-slate-950]="profilePostsFilter === 'all'"
                    [class.bg-slate-950]="profilePostsFilter === 'all'"
                    [class.text-white]="profilePostsFilter === 'all'"
                    [class.border-slate-200]="profilePostsFilter !== 'all'"
                    [class.bg-white]="profilePostsFilter !== 'all'"
                    [class.text-slate-600]="profilePostsFilter !== 'all'">
                    All
                  </button>
                  <button
                    type="button"
                    (click)="setPostFilter('progress')"
                    class="rounded-full border px-4 py-2 text-xs font-semibold transition"
                    [class.border-slate-950]="profilePostsFilter === 'progress'"
                    [class.bg-slate-950]="profilePostsFilter === 'progress'"
                    [class.text-white]="profilePostsFilter === 'progress'"
                    [class.border-slate-200]="profilePostsFilter !== 'progress'"
                    [class.bg-white]="profilePostsFilter !== 'progress'"
                    [class.text-slate-600]="profilePostsFilter !== 'progress'">
                    Progress
                  </button>
                  <button
                    type="button"
                    (click)="setPostFilter('reflection')"
                    class="rounded-full border px-4 py-2 text-xs font-semibold transition"
                    [class.border-slate-950]="profilePostsFilter === 'reflection'"
                    [class.bg-slate-950]="profilePostsFilter === 'reflection'"
                    [class.text-white]="profilePostsFilter === 'reflection'"
                    [class.border-slate-200]="profilePostsFilter !== 'reflection'"
                    [class.bg-white]="profilePostsFilter !== 'reflection'"
                    [class.text-slate-600]="profilePostsFilter !== 'reflection'">
                    Reflections
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="profilePostsLoading" class="glass-card rounded-[2rem] p-6 text-sm text-slate-500">Loading posts...</div>
            <div *ngIf="profilePostsError" class="rounded-[1.75rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ profilePostsError }}</div>
            <div *ngIf="!profilePostsLoading && !profilePosts.length" class="glass-card rounded-[2rem] p-6 text-sm text-slate-500">
              {{ profile.isOwnProfile ? "No posts yet. Share a quick win when you have one." : "No public posts yet." }}
            </div>

            <div *ngIf="profilePosts.length" class="space-y-4">
              <article *ngFor="let post of profilePosts" class="mt-card mt-card-hover p-4 sm:p-5">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--mt-accent-strong)]">{{ post.mentalStateTag }}</span>
                      <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{{ post.shareType }}</span>
                    </div>
                    <div class="mt-4 mt-card-brand">
                      <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                        <app-icon [name]="post.shareType === 'reflection' ? 'comments' : post.shareType === 'progress' ? 'chart-line' : post.shareType === 'streak' ? 'streak' : 'share'" className="text-base"></app-icon>
                      </div>
                      <div>
                        <div class="text-lg font-bold tracking-[-0.04em] text-slate-950 sm:text-xl">{{ post.title }}</div>
                        <div class="mt-card-copy mt-2 text-sm">{{ post.content }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {{ post.createdAt | date: "MMM d" }}
                  </div>
                </div>

                <div *ngIf="post.tags.length" class="mt-4 flex flex-wrap gap-2">
                  <span *ngFor="let tag of post.tags" class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    #{{ tag }}
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button type="button" (click)="sharePost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Share</button>
                  <button *ngIf="post.isOwnPost" type="button" (click)="removeOwnPost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Remove</button>
                </div>
              </article>
            </div>

            <div *ngIf="profilePostsHasMore" class="flex justify-center pt-1">
              <button type="button" (click)="loadMorePosts()" [disabled]="profilePostsLoadingMore" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
                {{ profilePostsLoadingMore ? "Loading..." : "Load more" }}
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <ng-container *ngIf="profile.isOwnProfile; else publicRail">
              <div class="mt-card mt-card-hover p-4 sm:p-5">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="arrow" className="text-base"></app-icon>
                  </div>
                  <div class="text-sm font-semibold text-slate-950">Quick links</div>
                </div>
                <div class="mt-4 space-y-3">
                  <a routerLink="/mood" class="mt-card-soft flex items-center justify-between px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    <span>Mood</span>
                    <span class="text-slate-400">Go</span>
                  </a>
                  <a routerLink="/journal" class="mt-card-soft flex items-center justify-between px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    <span>Journal</span>
                    <span class="text-slate-400">Go</span>
                  </a>
                  <a routerLink="/progress" class="mt-card-soft flex items-center justify-between px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    <span>Progress</span>
                    <span class="text-slate-400">Go</span>
                  </a>
                  <a routerLink="/tests" class="mt-card-soft flex items-center justify-between px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                    <span>Test center</span>
                    <span class="text-slate-400">Go</span>
                  </a>
                </div>
              </div>

              <form class="mt-card mt-card-hover p-4 sm:p-5" (ngSubmit)="save()">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="user-settings" className="text-base"></app-icon>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-950">Profile basics</div>
                      <div class="mt-1 text-xs leading-5 text-slate-500">Keep it short. Keep it real.</div>
                    </div>
                  </div>
                  <span *ngIf="saved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
                </div>

                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                  <label class="block text-sm font-medium text-slate-600">
                    Name
                    <input [(ngModel)]="form.name" name="name" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Email
                    <input [ngModel]="email" name="email" disabled class="app-field mt-2 rounded-[1.2rem] text-slate-500 disabled:cursor-not-allowed disabled:opacity-90" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Headline
                    <input [(ngModel)]="form.headline" name="headline" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Occupation
                    <input [(ngModel)]="form.occupation" name="occupation" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Age
                    <input [(ngModel)]="form.age" name="age" type="number" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Gender
                    <input [(ngModel)]="form.gender" name="gender" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                </div>

                <label class="mt-4 block text-sm font-medium text-slate-600">
                  Bio
                  <textarea [(ngModel)]="form.bio" name="bio" rows="4" class="app-textarea app-field-white mt-2 resize-none rounded-[1.4rem]"></textarea>
                </label>

                <div class="mt-4 grid gap-4">
                  <label class="block text-sm font-medium text-slate-600">
                    Sleep habits
                    <input [(ngModel)]="form.sleepHabits" name="sleepHabits" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Lifestyle indicators
                    <input [(ngModel)]="lifestyleIndicators" name="lifestyleIndicators" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                  <label class="block text-sm font-medium text-slate-600">
                    Stress indicators
                    <input [(ngModel)]="stressIndicators" name="stressIndicators" class="app-field app-field-white mt-2 rounded-[1.2rem]" />
                  </label>
                </div>

                <div class="mt-4 grid gap-3">
                  <label class="inline-flex items-center gap-3 rounded-[1.25rem] bg-[rgba(243,248,253,0.9)] px-4 py-3 text-sm font-medium text-slate-600">
                    <input [(ngModel)]="form.allowDirectMessages" name="allowDirectMessages" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
                    Allow direct messages from the community
                  </label>
                  <label class="inline-flex items-center gap-3 rounded-[1.25rem] bg-[rgba(243,248,253,0.9)] px-4 py-3 text-sm font-medium text-slate-600">
                    <input [(ngModel)]="form.shareProgressPublicly" name="shareProgressPublicly" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
                    Show progress stats on your profile
                  </label>
                </div>

                <div *ngIf="error" class="mt-4 rounded-[1.2rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</div>

                <button type="submit" [disabled]="pending" class="btn-primary mt-5 w-full rounded-[1.3rem] px-5 py-4 text-sm font-semibold disabled:opacity-60">
                  {{ pending ? "Saving..." : "Save changes" }}
                </button>
              </form>
            </ng-container>

            <ng-template #publicRail>
              <div class="mt-card mt-card-hover p-4 sm:p-5">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="profile" className="text-base"></app-icon>
                  </div>
                  <div class="text-sm font-semibold text-slate-950">About</div>
                </div>
                <div class="mt-card-soft mt-4 px-4 py-4 text-sm leading-7 text-slate-600">
                  {{ profile.profile.bio || "No extra note yet." }}
                </div>
              </div>

              <div class="mt-card mt-card-hover p-4 sm:p-5">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="settings" className="text-base"></app-icon>
                  </div>
                  <div class="text-sm font-semibold text-slate-950">Community settings</div>
                </div>
                <div class="mt-card-soft mt-4 px-4 py-4 text-sm text-slate-600">
                  {{ profile.canMessage ? "DMs are open." : "DMs are off right now." }}
                </div>
                <div class="mt-card-soft mt-3 px-4 py-4 text-sm text-slate-600">
                  {{ profile.activitySummary ? "Some stats are public." : "Stats are private." }}
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </ng-container>
    </section>
  `
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  pending = false;
  saved = false;
  error = "";
  loadingProfile = true;
  email = "";
  lifestyleIndicators = "";
  stressIndicators = "";
  summary: DashboardSummary | null = null;
  profileData: CommunityProfileResponse | null = null;
  profilePosts: CommunityPost[] = [];
  profilePostsPage = 1;
  profilePostsHasMore = false;
  profilePostsLoading = false;
  profilePostsLoadingMore = false;
  profilePostsError = "";
  profilePostsFilter: CommunityShareType = "all";

  form: {
    name: string;
    age?: number;
    gender?: string;
    occupation?: string;
    sleepHabits?: string;
    headline?: string;
    bio?: string;
    allowDirectMessages: boolean;
    shareProgressPublicly: boolean;
  } = {
    name: "",
    allowDirectMessages: true,
    shareProgressPublicly: true
  };

  private readonly subs = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly communityService: CommunityService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const currentUser = this.authService.currentUser();
        const targetUserId = params.get("userId") || currentUser?.id || "";
        this.loadProfile(targetUserId);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  save(): void {
    if (this.pending) {
      return;
    }

    this.pending = true;
    this.saved = false;
    this.error = "";

    this.authService
      .updateProfile({
        name: this.form.name,
        profile: {
          age: this.form.age,
          gender: this.form.gender,
          occupation: this.form.occupation,
          sleepHabits: this.form.sleepHabits,
          headline: this.form.headline,
          bio: this.form.bio,
          allowDirectMessages: this.form.allowDirectMessages,
          shareProgressPublicly: this.form.shareProgressPublicly,
          lifestyleIndicators: splitList(this.lifestyleIndicators),
          stressIndicators: splitList(this.stressIndicators)
        }
      })
      .subscribe({
        next: (user) => {
          this.prefill(user);
          this.saved = true;
          this.pending = false;
          if (this.profileData?.profile.id) {
            this.loadProfile(this.profileData.profile.id);
          }
        },
        error: (err) => {
          this.error = err?.error?.error || "Couldn't save your profile right now.";
          this.pending = false;
        }
      });
  }

  toggleFollow(): void {
    if (!this.profileData || this.profileData.isOwnProfile) {
      return;
    }

    const request = this.profileData.isFollowing
      ? this.communityService.unfollow(this.profileData.profile.id)
      : this.communityService.follow(this.profileData.profile.id);

    request.subscribe({
      next: (state) => {
        if (!this.profileData) {
          return;
        }

        this.profileData = {
          ...this.profileData,
          isFollowing: state.isFollowing,
          social: {
            ...this.profileData.social,
            followers: state.followers,
            following: state.following
          }
        };
      }
    });
  }

  messageUser(): void {
    if (!this.profileData || this.profileData.isOwnProfile) {
      return;
    }

    void this.router.navigate(["/community"], {
      queryParams: { chatUser: this.profileData.profile.id }
    });
  }

  shareProfile(): void {
    const text = "I'm improving my mental health with MindTrack AI \ud83d\udc99";

    void shareTextSafely("MindTrack AI", text);
  }

  setPostFilter(filter: CommunityShareType): void {
    if (this.profilePostsFilter === filter || !this.profileData) {
      return;
    }

    this.profilePostsFilter = filter;
    this.loadProfilePosts(this.profileData.profile.id, true);
  }

  loadMorePosts(): void {
    if (!this.profileData || this.profilePostsLoadingMore || !this.profilePostsHasMore) {
      return;
    }

    this.loadProfilePosts(this.profileData.profile.id, false);
  }

  sharePost(post: CommunityPost): void {
    const text = `I'm improving my mental health with MindTrack AI \ud83d\udc99\n\n${post.title}`;

    void shareTextSafely("MindTrack AI", text);
  }

  removeOwnPost(post: CommunityPost): void {
    if (!post.isOwnPost || !this.profileData) {
      return;
    }

    this.communityService.deletePost(post.id).subscribe({
      next: () => {
        this.profilePosts = this.profilePosts.filter((item) => item.id !== post.id);
        this.profileData = {
          ...this.profileData!,
          social: {
            ...this.profileData!.social,
            posts: Math.max(0, this.profileData!.social.posts - 1),
            progressShares:
              post.shareType === "reflection" ? this.profileData!.social.progressShares : Math.max(0, this.profileData!.social.progressShares - 1)
          }
        };
      }
    });
  }

  private loadProfile(userId: string): void {
    this.loadingProfile = true;
    this.profileData = null;
    this.summary = null;
    this.profilePosts = [];
    this.profilePostsPage = 1;
    this.profilePostsHasMore = false;
    this.profilePostsError = "";
    const currentUser = this.authService.currentUser();
    this.prefill(currentUser);

    this.communityService.getProfile(userId).subscribe({
      next: (profile) => {
        this.profileData = profile;
        this.loadingProfile = false;
        this.loadProfilePosts(profile.profile.id, true);

        if (profile.isOwnProfile) {
          this.dashboardService.getSummary().subscribe({
            next: (summary) => (this.summary = summary),
            error: () => (this.summary = null)
          });
        }
      },
      error: () => {
        this.loadingProfile = false;
        this.profileData = null;
      }
    });
  }

  private loadProfilePosts(userId: string, reset: boolean): void {
    if (reset) {
      this.profilePostsPage = 1;
      this.profilePosts = [];
      this.profilePostsLoading = true;
    } else {
      this.profilePostsLoadingMore = true;
    }

    this.profilePostsError = "";

    this.communityService.listProfilePosts(userId, this.profilePostsPage, 6, this.profilePostsFilter).subscribe({
      next: (response) => {
        this.profilePosts = reset ? response.items : [...this.profilePosts, ...response.items];
        this.profilePostsHasMore = response.hasMore;
        this.profilePostsLoading = false;
        this.profilePostsLoadingMore = false;
        if (response.hasMore) {
          this.profilePostsPage += 1;
        }
      },
      error: () => {
        this.profilePostsLoading = false;
        this.profilePostsLoadingMore = false;
        this.profilePostsError = "Couldn't load profile posts right now.";
      }
    });
  }

  private prefill(user: UserProfile | null): void {
    this.email = user?.email || "";
    this.form = {
      name: user?.name || "",
      age: user?.profile?.age,
      gender: user?.profile?.gender,
      occupation: user?.profile?.occupation,
      sleepHabits: user?.profile?.sleepHabits,
      headline: user?.profile?.headline,
      bio: user?.profile?.bio,
      allowDirectMessages: user?.profile?.allowDirectMessages ?? true,
      shareProgressPublicly: user?.profile?.shareProgressPublicly ?? true
    };
    this.lifestyleIndicators = (user?.profile?.lifestyleIndicators || []).join(", ");
    this.stressIndicators = (user?.profile?.stressIndicators || []).join(", ");
  }
}

function splitList(value: string): string[] {
  return String(value || "")
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
