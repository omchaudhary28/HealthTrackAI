import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CommunityPost, CommunityService, CommunityShareType } from "../../core/services/community.service";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-create-post-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div class="mt-card mt-card-hover page-hero">
          <div class="mt-card-brand min-w-0 max-w-3xl">
            <div class="mt-card-icon">
              <app-icon name="compose" className="text-xl"></app-icon>
            </div>
            <div class="min-w-0">
              <div class="mt-card-kicker">Create Post</div>
              <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">Share one clear update.</h1>
              <p class="mt-card-copy mt-3 max-w-3xl text-sm sm:text-base">
                No essay. Just the update. If it gets deep, keep that part in your journal.
              </p>
            </div>

            <div class="cluster-actions mt-6">
              <a routerLink="/mood" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Log mood first</a>
              <a routerLink="/journal" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Open journal</a>
              <a routerLink="/community" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Back to community</a>
            </div>
          </div>
        </div>

        <div class="mt-card mt-card-hover p-5 sm:p-6">
          <div class="mt-card-brand">
            <div class="mt-card-icon">
              <app-icon name="share" className="text-lg"></app-icon>
            </div>
            <div class="text-sm font-semibold text-slate-900">Before you post</div>
          </div>
          <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <div class="mt-card-soft px-4 py-4">Say what changed, not the full lore.</div>
            <div class="mt-card-soft px-4 py-4">Anonymous mode is there when privacy wins.</div>
            <div class="mt-card-soft px-4 py-4">If it's just for you, drop it in journal.</div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form class="mt-card mt-card-hover p-5 sm:p-6" (ngSubmit)="createPost()">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="pen" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-900">Simple composer</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Title, short note, done.</div>
              </div>
            </div>
            <label class="inline-flex items-center gap-2 rounded-full bg-[rgba(243,248,253,0.9)] px-3 py-2 text-xs font-semibold text-slate-600">
              <input [(ngModel)]="compose.isAnonymous" name="isAnonymous" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-200" />
              Anonymous mode
            </label>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Title
              <input [(ngModel)]="compose.title" name="title" class="app-field mt-2 rounded-2xl" placeholder="Example: Tiny win today" />
            </label>

            <label class="block text-sm font-medium text-slate-600">
              Share type
              <select [(ngModel)]="compose.shareType" name="shareType" class="app-field mt-2 rounded-2xl">
                <option value="reflection">Reflection</option>
                <option value="progress">Progress update</option>
                <option value="streak">Streak</option>
                <option value="milestone">Milestone</option>
              </select>
            </label>
          </div>

          <label class="mt-4 block text-sm font-medium text-slate-600">
            Content
            <textarea [(ngModel)]="compose.content" name="content" rows="6" class="app-textarea mt-2 resize-none rounded-[1.75rem]" placeholder="What changed? What helped? What do you need?"></textarea>
          </label>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Mental state tag
              <select [(ngModel)]="compose.mentalStateTag" name="mentalStateTag" class="app-field mt-2 rounded-2xl">
                <option *ngFor="let state of mentalStates" [ngValue]="state">{{ state }}</option>
              </select>
            </label>

            <label class="block text-sm font-medium text-slate-600">
              Tags
              <input [(ngModel)]="compose.tags" name="tags" class="app-field mt-2 rounded-2xl" placeholder="sleep, journaling, grounding" />
            </label>
          </div>

          <label *ngIf="compose.isAnonymous" class="mt-4 block text-sm font-medium text-slate-600">
              Anonymous alias
              <input [(ngModel)]="compose.anonymousAlias" name="anonymousAlias" class="app-field mt-2 rounded-2xl" placeholder="Optional. Example: Quiet Lantern" />
          </label>

          <div *ngIf="compose.shareType !== 'reflection'" class="mt-card-soft mt-5 border border-white/50 p-5">
            <div class="text-sm font-semibold text-slate-900">Optional progress details</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">Only fill what adds clarity.</div>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <label class="block text-sm font-medium text-slate-600">
                What improved
                <textarea [(ngModel)]="compose.whatImproved" name="whatImproved" rows="3" class="app-textarea app-field-white mt-2 resize-none rounded-2xl"></textarea>
              </label>

              <label class="block text-sm font-medium text-slate-600">
                What helped
                <textarea [(ngModel)]="compose.whatHelped" name="whatHelped" rows="3" class="app-textarea app-field-white mt-2 resize-none rounded-2xl"></textarea>
              </label>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-3">
              <label class="block text-sm font-medium text-slate-600">
                Streak days
                <input [(ngModel)]="compose.streakDays" name="streakDays" type="number" class="app-field app-field-white mt-2 rounded-2xl" />
              </label>
              <label class="block text-sm font-medium text-slate-600">
                Mood average
                <input [(ngModel)]="compose.moodAverage" name="moodAverage" type="number" step="0.1" class="app-field app-field-white mt-2 rounded-2xl" />
              </label>
              <label class="block text-sm font-medium text-slate-600">
                Exercise streak
                <input [(ngModel)]="compose.exerciseStreak" name="exerciseStreak" type="number" class="app-field app-field-white mt-2 rounded-2xl" />
              </label>
            </div>
          </div>

          <div *ngIf="createError" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ createError }}
          </div>

          <button type="submit" [disabled]="creatingPost" class="btn-primary mt-5 w-full rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60 sm:w-auto">
            {{ creatingPost ? "Publishing..." : "Publish post" }}
          </button>
        </form>

        <div class="space-y-6">
          <div class="mt-card mt-card-hover p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="analytics" className="text-lg"></app-icon>
              </div>
              <div class="text-sm font-semibold text-slate-900">Track before posting</div>
            </div>
            <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <a routerLink="/mood" class="mt-card-soft block px-4 py-4 font-semibold text-slate-900 transition hover:bg-slate-100">
                Mood check-in
              </a>
              <a routerLink="/journal" class="mt-card-soft block px-4 py-4 font-semibold text-slate-900 transition hover:bg-slate-100">
                Journal entry
              </a>
              <a routerLink="/progress" class="mt-card-soft block px-4 py-4 font-semibold text-slate-900 transition hover:bg-slate-100">
                Progress page
              </a>
            </div>
          </div>

          <div class="mt-card mt-card-hover p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="comments" className="text-lg"></app-icon>
              </div>
              <div class="text-sm font-semibold text-slate-900">What works here</div>
            </div>
            <div class="mt-card-soft mt-4 px-4 py-4 text-sm leading-7 text-slate-600">
              Short posts hit better. Tiny wins, quick notes, and honest asks work best.
            </div>
          </div>

          <div *ngIf="createdPost" class="mt-card mt-card-hover border border-emerald-100 bg-[linear-gradient(150deg,rgba(236,253,245,0.92),rgba(255,255,255,0.88))] p-6">
            <div class="text-sm font-semibold text-emerald-800">Post live</div>
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
