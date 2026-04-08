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

interface PatternInsightCard {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  supporting: string;
  badge?: string;
  dark?: boolean;
}

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
        <section appScrollReveal class="page-stack">
          <div class="glass-card theme-hero-card page-hero">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div class="min-w-0">
                <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard</div>
                <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
                  Welcome back, <span class="break-words">{{ displayName() }}</span>.
                </h1>
                <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                  Your AI summary blends mood logs, journals, assessments, and completed exercises into one support snapshot.
                </p>
              </div>
              <div class="cluster-actions">
                <a routerLink="/tests/baseline" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                  Retake baseline
                </a>
                <a routerLink="/exercises" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                  Open guided exercises
                </a>
              </div>
            </div>

            <div class="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div class="theme-bento-card rounded-[2rem] p-6">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Your current mental state</div>
                <div class="theme-chip mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold">
                  {{ summary.currentMentalState?.mentalState || summary.currentMentalState?.mental_state || 'Balanced' }}
                </div>
                <p class="mt-4 text-sm leading-8 text-slate-700">
                  {{ summary.currentMentalState?.description || 'Your current signals look steady overall. Continue supporting the routines that help.' }}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span *ngFor="let sign of (summary.currentMentalState?.commonSigns || []).slice(0, 3)" class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                    {{ sign }}
                  </span>
                </div>
              </div>

              <div class="theme-bento-card-strong rounded-[2rem] p-6">
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
            <div class="theme-bento-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mental score</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ latestScore(summary) }}</div>
              <div class="mt-2 text-sm text-slate-600">Latest baseline snapshot out of 100.</div>
            </div>
            <div class="theme-bento-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood check-ins</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ summary.activitySummary?.moodCheckIns30d || 0 }}</div>
              <div class="mt-2 text-sm text-slate-600">Logged in the last 30 days.</div>
            </div>
            <div class="theme-bento-card rounded-[2rem] p-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercise streak</div>
              <div class="mt-3 text-3xl font-semibold text-slate-900">{{ summary.activitySummary?.exerciseStreak || 0 }}d</div>
              <div class="mt-2 text-sm text-slate-600">Consecutive days with completed exercises.</div>
            </div>
            <div class="theme-bento-card rounded-[2rem] p-5">
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

              <div class="theme-bento-card-soft rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">Pattern analysis</div>
                    <div class="mt-1 text-xs leading-5 text-slate-500">A more useful read on what your recent logs, habits, and writing are saying together.</div>
                  </div>
                  <span class="theme-kicker rounded-full px-3 py-1 text-xs font-semibold">Updated from recent data</span>
                </div>

                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <article
                    *ngFor="let card of patternCards(summary); trackBy: trackPatternCard"
                    class="rounded-[1.75rem] px-4 py-4"
                    [class.theme-bento-card-strong]="card.dark"
                    [class.theme-bento-card]="!card.dark">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em]" [ngClass]="card.dark ? 'text-white/65' : 'text-slate-400'">
                          {{ card.eyebrow }}
                        </div>
                        <div class="mt-2 text-lg font-semibold tracking-[-0.03em]" [class.text-slate-950]="!card.dark" [class.text-white]="card.dark">
                          {{ card.title }}
                        </div>
                      </div>
                      <span
                        *ngIf="card.badge"
                        class="rounded-full px-3 py-1 text-[11px] font-semibold"
                        [ngClass]="card.dark ? 'border border-white/20 bg-white/10 text-white' : 'theme-chip-outline'">
                        {{ card.badge }}
                      </span>
                    </div>

                    <div class="mt-3 text-sm leading-7" [ngClass]="card.dark ? 'text-white/80' : 'text-slate-600'">
                      {{ card.description }}
                    </div>
                    <div class="mt-3 text-sm leading-7" [ngClass]="card.dark ? 'text-white/65' : 'text-slate-500'">
                      {{ card.supporting }}
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="theme-bento-card-soft rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

              <div class="theme-bento-card-soft rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div class="text-sm font-semibold text-slate-900">AI insights history</div>
                <div class="mt-4 space-y-3">
                  <div *ngFor="let insight of (summary.aiInsightsHistory || []).slice(0, 3)" class="theme-bento-card rounded-[1.5rem] px-4 py-4">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="text-sm font-semibold text-slate-900">{{ insight.title }}</div>
                        <div class="mt-2 text-sm leading-7 text-slate-600">{{ insight.description }}</div>
                      </div>
                      <div *ngIf="insight.confidence" class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                        {{ percent(insight.confidence) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card theme-bento-card-soft rounded-[2rem] p-5 sm:rounded-[2.25rem] sm:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="text-sm font-semibold text-slate-900">Recommended exercises</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Each recommendation includes purpose, outcome, and AI reasoning.</div>
              </div>
              <a routerLink="/exercises" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Browse all</a>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <article *ngFor="let ex of (summary.recommendationCards || []).slice(0, 4)" class="theme-bento-card rounded-[2rem] p-5">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ label(ex.category) }}</div>
                    <div class="mt-2 text-lg font-semibold text-slate-900">{{ ex.title }}</div>
                  </div>
                  <div class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                    {{ ex.durationMinutes }}m
                  </div>
                </div>
                <div class="mt-3 text-sm leading-7 text-slate-600">{{ ex.purpose || ex.description }}</div>
                <div class="theme-bento-card-soft mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
                  <div class="font-semibold text-slate-900">Why recommended</div>
                  <div class="mt-1">{{ ex.whyRecommended }}</div>
                </div>
                <div class="theme-bento-card-soft mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
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
      <div class="page-stack">
        <div class="glass-card page-hero">
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

  patternCards(summary: DashboardSummary): PatternInsightCard[] {
    return buildPatternCards(summary);
  }

  trackPatternCard(_index: number, card: PatternInsightCard): string {
    return card.key;
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

function buildPatternCards(summary: DashboardSummary): PatternInsightCard[] {
  const scoreSeries = summary.analytics?.scoreTrend;
  const moodSeries = summary.analytics?.moodTrend;
  const stressSeries = summary.analytics?.stressTrend;
  const activity = summary.activitySummary;
  const journalPatterns = summary.journalSignals?.patterns || [];
  const sentiment = Number(summary.journalSignals?.sentiment ?? 0);
  const primaryJournalPattern = journalPatterns[0];
  const scoreDelta = trendDelta(scoreSeries?.values);
  const latestMood = lastValue(moodSeries?.values, 3);
  const latestStress = lastValue(stressSeries?.values, 55);
  const suggestedAction = summary.suggestedAction?.title || "protect one supportive routine";
  const exerciseStreak = Number(activity?.exerciseStreak || 0);
  const moodCheckIns = Number(activity?.moodCheckIns30d || 0);

  const momentumCard: PatternInsightCard =
    scoreDelta >= 5
      ? {
          key: "momentum",
          eyebrow: "Momentum",
          title: "Your mental score is trending up.",
          description: `Recent score snapshots are up ${scoreDelta} points, which usually means your current routines are giving you better support.`,
          supporting: "Keep the helpful pieces stable for another few days instead of changing too much at once.",
          badge: `+${scoreDelta}`
        }
      : scoreDelta <= -5
        ? {
            key: "momentum",
            eyebrow: "Momentum",
            title: "Your baseline looks a bit more strained lately.",
            description: `Recent score snapshots are down ${Math.abs(scoreDelta)} points, so recovery habits likely matter more than pushing harder right now.`,
            supporting: `Use ${suggestedAction.toLowerCase()} as the first reset instead of trying to improve every metric at once.`,
            badge: `${scoreDelta}`
          }
        : {
            key: "momentum",
            eyebrow: "Momentum",
            title: "Your baseline is relatively steady.",
            description: "The score trend is fairly flat, which suggests maintenance habits are doing their job even if things are not perfect.",
            supporting: "When the pattern is steady, the best move is usually consistency rather than intensity.",
            badge: "steady"
          };

  const pressureCard: PatternInsightCard =
    latestStress >= 60 && latestMood <= 3
      ? {
          key: "pressure",
          eyebrow: "Mood and stress",
          title: "Stress looks like the main pressure point.",
          description: "Recent mood is flatter while stress stays elevated, which often means the nervous system needs settling before problem-solving.",
          supporting: "Choose a smaller task load and do one calming action before trying to think through everything else.",
          badge: `${Math.round(latestStress)} stress`,
          dark: true
        }
      : latestStress <= 52 && latestMood >= 4
        ? {
            key: "pressure",
            eyebrow: "Mood and stress",
            title: "Mood is stabilizing while stress cools.",
            description: "Your recent check-ins suggest a steadier balance between energy and emotional load.",
            supporting: "This is a good time to reinforce the routines that are already working instead of adding extra pressure.",
            badge: `${latestMood.toFixed(1)} mood`
          }
        : {
            key: "pressure",
            eyebrow: "Mood and stress",
            title: "Your signals look mixed rather than one-directional.",
            description: "Mood and stress are moving, but not in a clean pattern yet. A few more check-ins will sharpen the read.",
            supporting: "Keep logging for signal quality, then compare what happens on lighter versus heavier days.",
            badge: "mixed"
          };

  const journalCard: PatternInsightCard = primaryJournalPattern
    ? {
        key: "journal",
        eyebrow: "Journal signal",
        title: `Your writing keeps circling ${formatPattern(primaryJournalPattern)}.`,
        description: `The journal tone feels ${sentimentTone(sentiment)}, which helps explain how much weight that pattern may be carrying right now.`,
        supporting: journalGuidance(primaryJournalPattern),
        badge: formatPattern(primaryJournalPattern)
      }
    : {
        key: "journal",
        eyebrow: "Journal signal",
        title: "There is not enough journal signal yet for a strong read.",
        description: "A few more reflective entries will make the pattern analysis more specific and less generic.",
        supporting: "Short entries still count. Even two or three honest lines can improve the quality of the insight.",
        badge: "build signal"
      };

  const routineCard: PatternInsightCard =
    exerciseStreak >= 3 || moodCheckIns >= 5
      ? {
          key: "routine",
          eyebrow: "Habit signal",
          title: "Consistency is helping the app read you better.",
          description: `${exerciseStreak} day exercise streak and ${moodCheckIns} mood check-ins give the analysis cleaner context instead of isolated moments.`,
          supporting: `Next focus: ${suggestedAction}.`,
          badge: exerciseStreak >= 3 ? `${exerciseStreak}d streak` : `${moodCheckIns} logs`
        }
      : {
          key: "routine",
          eyebrow: "Habit signal",
          title: "The next improvement is better signal, not more complexity.",
          description: "The app can give stronger insights when mood, journal, and exercise data are logged a bit more consistently.",
          supporting: "Prioritize short daily tracking before adding more features or trying to interpret too much at once.",
          badge: "track first"
        };

  return [momentumCard, pressureCard, journalCard, routineCard];
}

function trendDelta(values?: number[]): number {
  if (!values?.length || values.length < 2) {
    return 0;
  }

  return Math.round(values[values.length - 1] - values[0]);
}

function lastValue(values: number[] | undefined, fallback: number): number {
  if (!values?.length) {
    return fallback;
  }

  return Number(values[values.length - 1]);
}

function sentimentTone(value: number): string {
  if (value <= -0.35) {
    return "heavy";
  }

  if (value >= 0.3) {
    return "hopeful";
  }

  return "mixed";
}

function journalGuidance(pattern: string): string {
  const key = String(pattern || "").toLowerCase();
  if (key.includes("rumination")) {
    return "Try to turn one repeated thought into one bounded action instead of letting it keep looping.";
  }

  if (key.includes("comparison")) {
    return "Step back from comparison triggers briefly and bring the focus back to your own values and pace.";
  }

  if (key.includes("self")) {
    return "Translate one harsh sentence into a fairer version so the next step feels more workable.";
  }

  if (key.includes("grat")) {
    return "Notice what is helping and make it easier to repeat, rather than only appreciating it in hindsight.";
  }

  return "Use the journal signal to choose one next move, not just to better describe the pattern.";
}

function formatPattern(value: string): string {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
