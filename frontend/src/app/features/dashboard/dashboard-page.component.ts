import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Observable, catchError, map, of } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";
import { Exercise, ExercisesService } from "../../core/services/exercises.service";
import { MoodService } from "../../core/services/mood.service";
import { MoodTrackerComponent } from "../../shared/components/mood-tracker.component";
import { ProgressChartComponent } from "../../shared/components/progress-chart.component";

@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink, MoodTrackerComponent, ProgressChartComponent],
  template: `
    <ng-container *ngIf="summary$ | async as summary; else loading">
      <ng-container *ngIf="summary.error; else content">
        <div class="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p class="font-semibold">Could not load dashboard summary.</p>
          <p class="text-sm">Please try again later.</p>
        </div>
      </ng-container>

      <ng-template #content>
        <section appScrollReveal class="space-y-6">
          <div class="rounded-3xl border border-white/70 bg-[linear-gradient(145deg,rgba(142,184,215,0.20),rgba(159,215,201,0.18),rgba(255,255,255,0.86))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.45)]">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div class="min-w-0">
                <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard</div>
                <h1 class="mt-3 text-3xl font-semibold text-slate-900">
                  Welcome back, <span class="whitespace-nowrap">{{ displayName() }}</span>.
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-8 text-slate-700">
                  A gentle snapshot of your check-ins, reflections, and baseline assessment. This is wellness support only, not diagnosis.
                </p>
              </div>
              <div class="flex flex-wrap gap-3">
                <a routerLink="/tests/baseline" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                  Retake baseline
                </a>
                <a routerLink="/mental-state" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                  Know your mental state
                </a>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-6">
              <div appScrollReveal [revealDelay]="40" class="col-span-12 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-4">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-900">Mental health score</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Based on your latest baseline assessment.</div>
                </div>
                <div class="relative grid h-24 w-24 place-items-center rounded-full" [style.background]="ringBackground(latestScore(summary))">
                  <div class="grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full bg-white text-center shadow-sm">
                    <div class="text-lg font-semibold text-slate-900 tabular-nums">{{ latestScore(summary) }}</div>
                    <div class="-mt-1 text-[11px] font-semibold text-slate-500">/ 100</div>
                  </div>
                </div>
              </div>

              <div class="mt-5 grid gap-3">
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Detected state</div>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm">
                      {{ summary.mentalStates?.[0]?.mentalState || "Unknown" }}
                    </span>
                    <span class="text-xs text-slate-500">Recent snapshot</span>
                  </div>
                </div>

                <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                  Focus on trends, not single days. Small, repeatable actions usually win.
                </div>
              </div>
            </div>

              <div appScrollReveal [revealDelay]="80" class="col-span-12 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Mood tracker</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Choose how you feel right now.</div>
                </div>
                <a routerLink="/mood" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">
                  Open calendar
                </a>
              </div>

              <div class="mt-4">
                <app-mood-tracker [showHeader]="false" [value]="checkInMood" (valueChange)="checkInMood = $event"></app-mood-tracker>
              </div>

              <div class="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                Latest check-in:
                <span class="font-semibold text-slate-800">{{ latestCheckInLabel(summary) }}</span>
              </div>
            </div>

              <div appScrollReveal [revealDelay]="120" class="col-span-12 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Daily check-in</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Log stress, sleep, and energy for today.</div>
                </div>
                <span *ngIf="checkInSaved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
              </div>

              <div class="mt-5 space-y-4">
                <label class="block text-sm font-semibold text-slate-800">
                  Stress level
                  <div class="mt-2 flex items-center gap-3">
                    <input [(ngModel)]="stressLevel" type="range" min="0" max="100" class="w-full" />
                    <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ stressLevel }}</div>
                  </div>
                </label>

                <label class="block text-sm font-semibold text-slate-800">
                  Sleep quality
                  <div class="mt-2 flex items-center gap-3">
                    <input [(ngModel)]="sleepQuality" type="range" min="1" max="5" class="w-full" />
                    <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ sleepQuality }}/5</div>
                  </div>
                </label>

                <label class="block text-sm font-semibold text-slate-800">
                  Energy level
                  <div class="mt-2 flex items-center gap-3">
                    <input [(ngModel)]="energyLevel" type="range" min="1" max="5" class="w-full" />
                    <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ energyLevel }}/5</div>
                  </div>
                </label>
              </div>

              <div *ngIf="checkInError" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ checkInError }}
              </div>

              <button
                type="button"
                (click)="saveCheckIn()"
                [disabled]="checkInPending"
                class="btn-primary mt-5 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                {{ checkInPending ? "Saving..." : "Save check-in" }}
              </button>
            </div>

            <div appScrollReveal [revealDelay]="160" class="col-span-12 lg:col-span-8">
              <app-progress-chart
                title="Progress chart"
                subtitle="A simple trend view (prototype data)"
                [labels]="scoreLabels"
                [values]="scoreValues"
                lineColor="#8eb8d7"></app-progress-chart>
            </div>

            <div appScrollReveal [revealDelay]="200" class="col-span-12 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Recommended exercises</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Short, supportive next steps.</div>
                </div>
                <a routerLink="/exercises" class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Browse all
                </a>
              </div>

              <div class="mt-5 space-y-3">
                <ng-container *ngIf="recommendedExercises$ | async as exercises">
                  <div *ngFor="let ex of exercises" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:bg-slate-100">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ label(ex.category) }}</div>
                        <div class="mt-1 truncate text-sm font-semibold text-slate-900">{{ ex.title }}</div>
                      </div>
                      <div class="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{{ ex.durationMinutes }}m</div>
                    </div>
                    <div class="mt-2 text-sm leading-6 text-slate-600">{{ ex.description }}</div>
                  </div>
                </ng-container>
              </div>
            </div>

            <div appScrollReveal [revealDelay]="240" class="col-span-12 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-semibold text-slate-900">Recent journal entry</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Your latest reflection, ready to revisit.</div>
                </div>
                <a routerLink="/journal" class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Open journal
                </a>
              </div>

              <div class="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
                <div *ngIf="summary.recentJournalEntries?.length; else emptyEntry" class="space-y-3">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {{ summary.recentJournalEntries[0]?.createdAt ? (summary.recentJournalEntries[0].createdAt | date : "mediumDate") : "Saved" }}
                  </div>
                  <div class="text-sm leading-7 text-slate-700">{{ snippet(summary.recentJournalEntries[0]?.content) }}</div>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let tag of (summary.recentJournalEntries[0]?.moodTags || []).slice(0, 4)" class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <ng-template #emptyEntry>
                  <div class="text-sm leading-7 text-slate-600">
                    No entries yet. Try one sentence about what felt hardest, and one sentence about what helped.
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </section>
      </ng-template>
    </ng-container>

    <ng-template #loading>
      <div class="flex animate-pulse items-center justify-center rounded-3xl border border-white/70 bg-white/80 p-6 text-slate-500">
        <svg class="mr-3 h-5 w-5 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading dashboard...</span>
      </div>
    </ng-template>
  `
})
export class DashboardPageComponent {
  summary$: Observable<DashboardSummary>;
  scoreLabels: string[];
  scoreValues: number[];
  recommendedExercises$: Observable<Exercise[]>;

  checkInMood: 1 | 2 | 3 | 4 | 5 = 3;
  stressLevel = 55;
  sleepQuality = 3;
  energyLevel = 3;
  checkInPending = false;
  checkInSaved = false;
  checkInError = "";

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly exercisesService: ExercisesService,
    private readonly moodService: MoodService
  ) {
    this.summary$ = this.loadSummary();

    this.recommendedExercises$ = this.exercisesService.list().pipe(
      map((items) => items.slice(0, 3)),
      catchError(() => of([]))
    );

    this.scoreLabels = this.dashboardService.scoreLabels;
    this.scoreValues = this.dashboardService.scoreValues;
  }

  displayName(): string {
    return this.authService.currentUser()?.name || "there";
  }

  ringBackground(score: number): string {
    const value = clamp(score, 0, 100);
    return `conic-gradient(from 180deg, rgba(142, 184, 215, 0.95) 0% ${value}%, rgba(226, 232, 240, 0.9) ${value}% 100%)`;
  }

  latestScore(summary: DashboardSummary): number {
    const score = summary.latestBaseline?.mentalScore ?? summary.latestBaseline?.mental_score;
    if (typeof score !== "number") {
      return 0;
    }

    return clamp(score, 0, 100);
  }

  latestCheckInLabel(summary: DashboardSummary): string {
    const latest = summary.recentMoodLogs?.[0];
    if (!latest?.date) {
      return "No check-ins yet";
    }

    const key = String(latest.date).slice(0, 10);
    if (!key) {
      return "Saved";
    }

    const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const parsed = new Date(key);
    if (Number.isNaN(parsed.getTime())) {
      return "Saved";
    }

    return formatter.format(parsed);
  }

  label(value: string): string {
    return (value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  snippet(text: string): string {
    const trimmed = (text || "").trim();
    if (!trimmed) {
      return "";
    }

    return trimmed.length > 220 ? `${trimmed.slice(0, 220)}...` : trimmed;
  }

  saveCheckIn(): void {
    if (this.checkInPending) {
      return;
    }

    this.checkInPending = true;
    this.checkInSaved = false;
    this.checkInError = "";

    const date = new Date();
    date.setHours(12, 0, 0, 0);

    this.moodService
      .upsert({
        date: date.toISOString(),
        mood: this.checkInMood,
        stressLevel: Number(this.stressLevel),
        sleepQuality: clamp(this.sleepQuality, 1, 5) as 1 | 2 | 3 | 4 | 5,
        energyLevel: clamp(this.energyLevel, 1, 5) as 1 | 2 | 3 | 4 | 5
      })
      .subscribe({
        next: () => {
          this.checkInPending = false;
          this.checkInSaved = true;
          this.summary$ = this.loadSummary();
        },
        error: (err) => {
          this.checkInError = err?.error?.error || "Unable to save check-in right now.";
          this.checkInPending = false;
        }
      });
  }

  private loadSummary(): Observable<DashboardSummary> {
    return this.dashboardService.getSummary().pipe(
      catchError(() =>
        of({
          latestBaseline: null,
          recentMoodLogs: [],
          recentJournalEntries: [],
          mentalStates: [],
          communityVisiblePosts: 0,
          error: true
        })
      )
    );
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


