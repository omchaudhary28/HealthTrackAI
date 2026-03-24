import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService, UserProfile } from "../../core/services/auth.service";
import { CommunityPost, CommunityProfileResponse, CommunityService, CommunityShareType } from "../../core/services/community.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink],
  template: `
    <section appScrollReveal class="space-y-6">
      <div *ngIf="loadingProfile" class="glass-card rounded-[2.75rem] p-8 text-sm text-slate-500">Loading profile...</div>

      <ng-container *ngIf="!loadingProfile">
      <ng-container *ngIf="profileData as profile">
        <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.8),rgba(255,255,255,0.52),rgba(37,99,235,0.08))] p-8">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div class="min-w-0">
              <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Profile</div>
              <div class="mt-4 flex items-start gap-4">
                <div class="grid h-16 w-16 shrink-0 place-items-center rounded-[1.75rem] bg-slate-900 text-lg font-semibold text-white">
                  {{ profile.profile.initials }}
                </div>
                <div class="min-w-0">
                  <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{{ profile.profile.name }}</h1>
                  <div class="mt-2 text-base font-medium text-[var(--mt-accent-strong)]">{{ profile.profile.headline }}</div>
                  <p class="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
                    {{ profile.profile.bio || 'This profile is still quiet, but the support stats below are live.' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <div *ngIf="profile.currentMentalState" class="rounded-full bg-[var(--mt-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--mt-accent-strong)]">
                {{ profile.currentMentalState }}
              </div>
              <a *ngIf="profile.isOwnProfile" routerLink="/community/create" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Create post</a>
              <button type="button" (click)="shareProfile()" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Share</button>
              <button *ngIf="!profile.isOwnProfile" type="button" (click)="toggleFollow()" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                {{ profile.isFollowing ? 'Following' : 'Follow' }}
              </button>
              <button *ngIf="!profile.isOwnProfile && profile.canMessage" type="button" (click)="messageUser()" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                Message
              </button>
            </div>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-[2rem] border border-white/70 bg-white/80 p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Followers</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ profile.social.followers }}</div>
            </div>
            <div class="rounded-[2rem] border border-white/70 bg-white/80 p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Following</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ profile.social.following }}</div>
            </div>
            <div class="rounded-[2rem] border border-white/70 bg-white/80 p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Posts shared</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ profile.social.posts }}</div>
            </div>
            <div class="rounded-[2rem] border border-white/70 bg-white/80 p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Progress shares</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ profile.social.progressShares }}</div>
            </div>
          </div>
        </div>

        <div *ngIf="profile.isOwnProfile; else publicView" class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form class="glass-card rounded-[2rem] p-6" (ngSubmit)="save()">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-sm font-semibold text-slate-900">Account and social profile</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Shape how you appear in the community and what context AI recommendations can use.</div>
              </div>
              <span *ngIf="saved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
            </div>

            <div class="mt-5 grid gap-5 md:grid-cols-2">
              <label class="block text-sm font-medium text-slate-600">Name
                <input [(ngModel)]="form.name" name="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">Email
                <input [ngModel]="email" name="email" disabled class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none" />
              </label>
              <label class="block text-sm font-medium text-slate-600 md:col-span-2">Headline
                <input [(ngModel)]="form.headline" name="headline" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" placeholder="Example: Learning how to recover more gently" />
              </label>
              <label class="block text-sm font-medium text-slate-600 md:col-span-2">Bio
                <textarea [(ngModel)]="form.bio" name="bio" rows="4" class="mt-2 w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"></textarea>
              </label>
              <label class="block text-sm font-medium text-slate-600">Age
                <input [(ngModel)]="form.age" name="age" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">Occupation
                <input [(ngModel)]="form.occupation" name="occupation" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">Sleep habits
                <input [(ngModel)]="form.sleepHabits" name="sleepHabits" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600">Gender
                <input [(ngModel)]="form.gender" name="gender" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600 md:col-span-2">Lifestyle indicators
                <input [(ngModel)]="lifestyleIndicators" name="lifestyleIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
              <label class="block text-sm font-medium text-slate-600 md:col-span-2">Stress indicators
                <input [(ngModel)]="stressIndicators" name="stressIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              </label>
            </div>

            <div class="mt-5 grid gap-3">
              <label class="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                <input [(ngModel)]="form.allowDirectMessages" name="allowDirectMessages" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
                Allow direct messages from the community
              </label>
              <label class="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                <input [(ngModel)]="form.shareProgressPublicly" name="shareProgressPublicly" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
                Allow public progress stats on your profile
              </label>
            </div>

            <div *ngIf="error" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</div>

            <button type="submit" [disabled]="pending" class="btn-primary mt-6 rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
              {{ pending ? 'Saving...' : 'Save changes' }}
            </button>
          </form>

          <div class="space-y-6">
            <div class="glass-card rounded-[2rem] p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Create post separately</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Publishing has its own page. Your profile stays focused on account details and post history.</div>
                </div>
                <a routerLink="/community/create" class="btn-primary rounded-full px-4 py-2 text-xs font-semibold">Open create post</a>
              </div>
              <div class="mt-5 rounded-[1.75rem] bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600">
                Use the dedicated create-post page when you want to publish. Posts will still appear here on your account once they are live.
              </div>
            </div>

            <div class="glass-card rounded-[2rem] p-6">
              <div class="text-sm font-semibold text-slate-900">Shared progress stats</div>
              <div class="mt-5 grid gap-4 sm:grid-cols-3" *ngIf="profile.activitySummary as activity">
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood logs</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.moodCheckIns30d }}</div>
                </div>
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercises</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.exerciseCompleted30d }}</div>
                </div>
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Journal entries</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.journalEntries30d }}</div>
                </div>
              </div>
            </div>

            <div class="glass-card rounded-[2rem] p-6">
              <div class="text-sm font-semibold text-slate-900">AI insights history</div>
              <div class="mt-4 space-y-3">
                <div *ngFor="let insight of (summary?.aiInsightsHistory || []).slice(0, 4)" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                  <div class="text-sm font-semibold text-slate-900">{{ insight.title }}</div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ insight.description }}</div>
                  <div *ngIf="insight.suggestedAction" class="mt-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    Suggested action: {{ insight.suggestedAction }}
                  </div>
                </div>
              </div>
            </div>

            <div class="glass-card rounded-[2rem] p-6">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Posts on your account</div>
                  <div class="mt-1 text-xs text-slate-500">Your profile feed updates as you publish.</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" (click)="setPostFilter('all')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">All</button>
                  <button type="button" (click)="setPostFilter('progress')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Progress</button>
                  <button type="button" (click)="setPostFilter('reflection')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Reflections</button>
                </div>
              </div>
              <div class="mt-4 space-y-3">
                <div *ngIf="profilePostsLoading" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  Loading your posts...
                </div>
                <div *ngIf="profilePostsError" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ profilePostsError }}</div>
                <div *ngIf="!profilePostsLoading && !profilePosts.length" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  Publish from this profile to start your account feed.
                </div>
                <div *ngFor="let post of profilePosts" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-sm font-semibold text-slate-900">{{ post.title }}</div>
                    <span class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--mt-accent-strong)]">{{ post.mentalStateTag }}</span>
                    <span *ngIf="post.shareType !== 'reflection'" class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{{ post.shareType }}</span>
                  </div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ post.content }}</div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <button type="button" (click)="sharePost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Share</button>
                    <button type="button" (click)="removeOwnPost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Remove</button>
                  </div>
                </div>
                <div *ngIf="profilePostsHasMore" class="pt-1">
                  <button type="button" (click)="loadMorePosts()" [disabled]="profilePostsLoadingMore" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60">
                    {{ profilePostsLoadingMore ? 'Loading...' : 'Load more' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #publicView>
          <div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div class="glass-card rounded-[2rem] p-6">
              <div class="text-sm font-semibold text-slate-900">Public progress snapshot</div>
              <div *ngIf="profile.activitySummary as activity; else privateStats" class="mt-5 grid gap-4 sm:grid-cols-3">
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood logs</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.moodCheckIns30d }}</div>
                </div>
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercises</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.exerciseCompleted30d }}</div>
                </div>
                <div class="rounded-3xl bg-slate-50/80 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Journal</div>
                  <div class="mt-3 text-2xl font-semibold text-slate-900">{{ activity.journalEntries30d }}</div>
                </div>
              </div>

              <ng-template #privateStats>
                <div class="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  This user is keeping their personal progress metrics private.
                </div>
              </ng-template>
            </div>

            <div class="glass-card rounded-[2rem] p-6">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-slate-900">Visible posts</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" (click)="setPostFilter('all')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">All</button>
                  <button type="button" (click)="setPostFilter('progress')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Progress</button>
                  <button type="button" (click)="setPostFilter('reflection')" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Reflections</button>
                </div>
              </div>
              <div class="mt-4 space-y-3">
                <div *ngIf="profilePostsLoading" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  Loading posts...
                </div>
                <div *ngIf="profilePostsError" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ profilePostsError }}</div>
                <div *ngIf="!profilePostsLoading && !profilePosts.length" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  No public posts yet.
                </div>
                <div *ngFor="let post of profilePosts" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-sm font-semibold text-slate-900">{{ post.title }}</div>
                    <span class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--mt-accent-strong)]">{{ post.mentalStateTag }}</span>
                  </div>
                  <div class="mt-2 text-sm leading-7 text-slate-600">{{ post.content }}</div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <button type="button" (click)="sharePost(post)" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Share</button>
                  </div>
                </div>
                <div *ngIf="profilePostsHasMore" class="pt-1">
                  <button type="button" (click)="loadMorePosts()" [disabled]="profilePostsLoadingMore" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60">
                    {{ profilePostsLoadingMore ? 'Loading...' : 'Load more' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
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
          this.error = err?.error?.error || "Unable to save profile right now.";
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

    if (navigator.share) {
      void navigator.share({ title: "MindTrack AI", text });
      return;
    }

    void navigator.clipboard?.writeText(text);
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

    if (navigator.share) {
      void navigator.share({ title: "MindTrack AI", text });
      return;
    }

    void navigator.clipboard?.writeText(text);
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
        this.profilePostsError = "Unable to load profile posts right now.";
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
