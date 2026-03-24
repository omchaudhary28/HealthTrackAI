import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CommunityPost, CommunityService, CommunityShareType } from "../../core/services/community.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-create-post-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.84),rgba(255,255,255,0.52),rgba(249,115,22,0.08))] p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="min-w-0">
            <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Create Post</div>
            <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Publish separately from the feed.</h1>
            <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
              This page is only for posting. The community page stays focused on browsing, discovery, reactions, comments, and conversations.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/community" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Open feed</a>
            <a routerLink="/profile" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">My profile</a>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form class="glass-card rounded-[2rem] p-6" (ngSubmit)="createPost()">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-slate-900">Post composer</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Publish a reflection, progress update, streak, or milestone.</div>
            </div>
            <label class="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <input [(ngModel)]="compose.isAnonymous" name="isAnonymous" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
              Anonymous mode
            </label>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Title
              <input [(ngModel)]="compose.title" name="title" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
            </label>

            <label class="block text-sm font-medium text-slate-600">
              Mental state tag
              <select [(ngModel)]="compose.mentalStateTag" name="mentalStateTag" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
                <option *ngFor="let state of mentalStates" [ngValue]="state">{{ state }}</option>
              </select>
            </label>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <label class="block text-sm font-medium text-slate-600">
              Share type
              <select [(ngModel)]="compose.shareType" name="shareType" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
                <option value="reflection">Reflection</option>
                <option value="progress">Progress update</option>
                <option value="streak">Streak</option>
                <option value="milestone">Milestone</option>
              </select>
            </label>

            <label *ngIf="compose.isAnonymous" class="block text-sm font-medium text-slate-600">
              Anonymous alias
              <input [(ngModel)]="compose.anonymousAlias" name="anonymousAlias" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Optional. Example: Quiet Lantern" />
            </label>
          </div>

          <label class="mt-4 block text-sm font-medium text-slate-600">
            Content
            <textarea [(ngModel)]="compose.content" name="content" rows="6" class="mt-2 w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"></textarea>
          </label>

          <div *ngIf="compose.shareType !== 'reflection'" class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              What improved
              <textarea [(ngModel)]="compose.whatImproved" name="whatImproved" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"></textarea>
            </label>

            <label class="block text-sm font-medium text-slate-600">
              What helped
              <textarea [(ngModel)]="compose.whatHelped" name="whatHelped" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"></textarea>
            </label>
          </div>

          <div *ngIf="compose.shareType !== 'reflection'" class="mt-4 grid gap-4 sm:grid-cols-3">
            <label class="block text-sm font-medium text-slate-600">
              Streak days
              <input [(ngModel)]="compose.streakDays" name="streakDays" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">
              Mood average
              <input [(ngModel)]="compose.moodAverage" name="moodAverage" type="number" step="0.1" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">
              Exercise streak
              <input [(ngModel)]="compose.exerciseStreak" name="exerciseStreak" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
            </label>
          </div>

          <label class="mt-4 block text-sm font-medium text-slate-600">
            Tags
            <input [(ngModel)]="compose.tags" name="tags" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="sleep, journaling, grounding" />
          </label>

          <div *ngIf="createError" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ createError }}
          </div>

          <button type="submit" [disabled]="creatingPost" class="btn-primary mt-5 rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60">
            {{ creatingPost ? "Publishing..." : "Publish post" }}
          </button>
        </form>

        <div class="space-y-6">
          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">Posting flow</div>
            <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">Create here.</div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">Browse and react in Community.</div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">See your account posts in Profile.</div>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">Safety</div>
            <div class="mt-4 rounded-3xl bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600">
              Anonymous mode is still available here. Community moderation and supportive-only reactions remain unchanged.
            </div>
          </div>

          <div *ngIf="createdPost" class="glass-card rounded-[2rem] border border-emerald-100 bg-[linear-gradient(150deg,rgba(236,253,245,0.92),rgba(255,255,255,0.88))] p-6">
            <div class="text-sm font-semibold text-emerald-800">Post published</div>
            <div class="mt-3 text-2xl font-semibold text-slate-900">{{ createdPost.title }}</div>
            <div class="mt-3 text-sm leading-7 text-slate-600">{{ createdPost.content }}</div>
            <div class="mt-5 flex flex-wrap gap-3">
              <a routerLink="/community" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Go to feed</a>
              <a routerLink="/profile" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Go to profile</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CreatePostPageComponent {
  readonly mentalStates = ["Overthinker", "Stressed", "Depressed", "FOMO", "Balanced"];

  creatingPost = false;
  createError = "";
  createdPost: CommunityPost | null = null;
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

  constructor(private readonly communityService: CommunityService) {}

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
          this.createdPost = post;
          this.compose = {
            title: "",
            content: "",
            tags: "",
            mentalStateTag: "Balanced",
            isAnonymous: true,
            anonymousAlias: "",
            shareType: "reflection",
            whatImproved: "",
            whatHelped: "",
            streakDays: null,
            moodAverage: null,
            exerciseStreak: null
          };
        },
        error: (err) => {
          this.creatingPost = false;
          this.createError = err?.error?.error || "Unable to publish this post right now.";
        }
      });
  }
}

function splitList(value: string): string[] {
  return String(value || "")
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
