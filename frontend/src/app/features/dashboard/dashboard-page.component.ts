import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Observable, catchError, of } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";
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
          <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(255,255,255,0.52),rgba(2,132,199,0.08))] p-8">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div class="min-w-0">
                <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard</div>
                <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                  Welcome back, <span class="whitespace-nowrap">{{ displayName() }}</span>.
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-8 text-slate-700">
                  Your AI summary blends mood logs, journals, assessments, and completed exercises into one support snapshot.
                </p>
              </div>
              <div class="flex flex-wrap gap-3">
                <a routerLink="/tests/baseline" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                  Retake baseline
                </a>
                <a routerLink="/exercises" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                  Open guided exercises
                </a>
              </div>
            </div>

            <div class="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div class="rounded-[2rem] border border-white/70 bg-white/76 p-6">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Your current mental state</div>
                <div class="mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold text-[var(--mt-accent-strong)]" [style.background]="'var(--mt-accent-soft)'">
                  {{ summary.currentMentalState?.mentalState || summary.currentMentalState?.mental_state || 'Balanced' }}
                </div>
                <p class="mt-4 text-sm leading-8 text-slate-700">
                  {{ summary.currentMentalState?.description || 'Your current signals look steady overall. Continue supporting the routines that help.' }}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span *ngFor="let sign of (summary.currentMentalState?.commonSigns || []).slice(0, 3)" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {{ sign }}
                  </span>
                </div>
              </div>

              <div class="rounded-[2rem] border border-white/70 bg-slate-950/[0.92] p-6 text-white shadow-[0_30px_60px_-35px_rgba(2,132,199,0.5)]">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/70">Suggested action</div>
                <div class="mt-3 text-2xl font-semibold">{{ summary.suggestedAction?.title || 'Keep a gentle routine' }}</div>
                <div class="mt-3 text-sm leading-7 text-sky-50/85">{{ summary.suggestedAction?.whyRecommended || 'A small recovery action usually works better than trying to fix everything at once.' }}</div>
                <div class="mt-4 rounded-3xl bg-white/10 px-4 py-4 text-sm leading-7 text-sky-50/85">
                  Expected outcome: {{ summary.suggestedAction?.expectedOutcome || 'A steadier nervous system and a clearer next decision.' }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="glass-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mental score</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ latestScore(summary) }}</div>
              <div class="mt-2 text-sm text-slate-600">Latest baseline snapshot out of 100.</div>
            </div>
            <div class="glass-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood check-ins</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ summary.activitySummary?.moodCheckIns30d || 0 }}</div>
              <div class="mt-2 text-sm text-slate-600">Logged in the last 30 days.</div>
            </div>
            <div class="glass-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercise streak</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ summary.activitySummary?.exerciseStreak || 0 }}d</div>
              <div class="mt-2 text-sm text-slate-600">Consecutive days with completed exercises.</div>
            </div>
            <div class="glass-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Journal entries</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ summary.activitySummary?.journalEntries30d || 0 }}</div>
              <div class="mt-2 text-sm text-slate-600">Reflective entries over the last 30 days.</div>
            </div>
          </div>

          <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div class="space-y-6">
              <app-progress-chart
                title="Mental score trend"
                subtitle="Recent score movement"
                [labels]="summary.analytics?.scoreTrend?.labels || fallbackLabels"
                [values]="summary.analytics?.scoreTrend?.values || fallbackValues"
                lineColor="#0284c7"></app-progress-chart>

              <div class="grid gap-6 lg:grid-cols-2">
                <app-progress-chart
                  title="Mood trend"
                  subtitle="Last 7 check-ins"
                  [labels]="summary.analytics?.moodTrend?.labels || fallbackLabels"
                  [values]="summary.analytics?.moodTrend?.values || [3,3,4,3,4,4,5]"
                  lineColor="#10b981"></app-progress-chart>

                <app-progress-chart
                  title="Stress trend"
                  subtitle="Last 7 check-ins"
                  [labels]="summary.analytics?.stressTrend?.labels || fallbackLabels"
                  [values]="summary.analytics?.stressTrend?.values || [68,62,59,61,57,54,49]"
                  lineColor="#f97316"></app-progress-chart>
              </div>
            </div>

            <div class="space-y-6">
              <div class="glass-card rounded-[2rem] p-6">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">Daily check-in</div>
                    <div class="mt-1 text-xs leading-5 text-slate-500">Log stress, sleep, and energy for today.</div>
                  </div>
                  <span *ngIf="checkInSaved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
                </div>

                <div class="mt-4">
                  <app-mood-tracker [showHeader]="false" [value]="checkInMood" (valueChange)="checkInMood = $event"></app-mood-tracker>
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

              <div class="glass-card rounded-[2rem] p-6">
                <div class="text-sm font-semibold text-slate-900">AI insights history</div>
                <div class="mt-4 space-y-3">
                  <div *ngFor="let insight of (summary.aiInsightsHistory || []).slice(0, 3)" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="text-sm font-semibold text-slate-900">{{ insight.title }}</div>
                        <div class="mt-2 text-sm leading-7 text-slate-600">{{ insight.description }}</div>
                      </div>
                      <div *ngIf="insight.confidence" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {{ percent(insight.confidence) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card rounded-[2.25rem] p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-sm font-semibold text-slate-900">Recommended exercises</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Each recommendation includes purpose, outcome, and AI reasoning.</div>
              </div>
              <a routerLink="/exercises" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Browse all</a>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <article *ngFor="let ex of (summary.recommendationCards || []).slice(0, 4)" class="rounded-[2rem] border border-slate-100 bg-white/80 p-5 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ label(ex.category) }}</div>
                    <div class="mt-2 text-lg font-semibold text-slate-900">{{ ex.title }}</div>
                  </div>
                  <div class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--mt-accent-strong)]">
                    {{ ex.durationMinutes }}m
                  </div>
                </div>
                <div class="mt-3 text-sm leading-7 text-slate-600">{{ ex.purpose || ex.description }}</div>
                <div class="mt-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                  <div class="font-semibold text-slate-900">Why recommended</div>
                  <div class="mt-1">{{ ex.whyRecommended }}</div>
                </div>
                <div class="mt-4 rounded-3xl bg-slate-950/[0.03] px-4 py-4 text-sm leading-7 text-slate-700">
                  <div class="font-semibold text-slate-900">Expected outcome</div>
                  <div class="mt-1">{{ ex.expectedOutcome || ex.whatYouWillAchieve }}</div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </ng-template>
    </ng-container>

    <ng-template #loading>
      <div class="space-y-6">
        <div class="glass-card rounded-[2.75rem] p-8">
          <div class="skeleton h-4 w-28 rounded-full"></div>
          <div class="skeleton mt-5 h-12 w-2/3 rounded-2xl"></div>
          <div class="skeleton mt-4 h-24 rounded-3xl"></div>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div *ngFor="let _ of [1,2,3,4]" class="glass-card rounded-[2rem] p-5">
            <div class="skeleton h-4 w-24 rounded-full"></div>
            <div class="skeleton mt-4 h-10 w-20 rounded-2xl"></div>
            <div class="skeleton mt-3 h-4 rounded-full"></div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class DashboardPageComponent {
  readonly fallbackLabels = ["W1", "W2", "W3", "W4", "W5"];
  readonly fallbackValues = [58, 61, 64, 69, 72];

  summary$: Observable<DashboardSummary>;

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
    private readonly moodService: MoodService
  ) {
    this.summary$ = this.loadSummary();
  }

  displayName(): string {
    return this.authService.currentUser()?.name || "there";
  }

  latestScore(summary: DashboardSummary): number {
    const score = summary.latestBaseline?.mentalScore ?? summary.latestBaseline?.mental_score;
    return typeof score === "number" ? Math.round(score) : 0;
  }

  label(value: string): string {
    return (value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  percent(value: number): string {
    return `${Math.round(Number(value) * 100)}%`;
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
          recommendationCards: [],
          aiInsightsHistory: [],
          analytics: {
            scoreTrend: { labels: this.fallbackLabels, values: this.fallbackValues },
            moodTrend: { labels: this.fallbackLabels, values: [3, 3, 4, 4, 4] },
            stressTrend: { labels: this.fallbackLabels, values: [65, 61, 58, 54, 52] },
            exerciseMomentum: { labels: this.fallbackLabels, values: [0, 1, 1, 2, 2] }
          },
          error: true
        })
      )
    );
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
