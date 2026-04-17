import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Observable, catchError, of } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";
import { MoodService } from "../../core/services/mood.service";
import { IconComponent, MindtrackIconName } from "../../shared/components/icon.component";
import { MoodTrackerComponent } from "../../shared/components/mood-tracker.component";
import { ProgressChartComponent } from "../../shared/components/progress-chart.component";

interface PatternInsightCard {
  key: string;
  icon: MindtrackIconName;
  eyebrow: string;
  title: string;
  description: string;
  supporting: string;
  badge?: string;
  dark?: boolean;
}

interface MissionCard {
  key: string;
  kicker: string;
  title: string;
  description: string;
  progress: string;
  link: string;
  icon: MindtrackIconName;
  rewardXp: number;
}

interface AchievementBadge {
  key: string;
  label: string;
  icon: MindtrackIconName;
  unlocked: boolean;
}

@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, RouterLink, IconComponent, MoodTrackerComponent, ProgressChartComponent],
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
          <div class="mt-card mt-card-hover page-hero">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div class="min-w-0 max-w-4xl">
                <div class="flex flex-wrap gap-2">
                  <span class="xp-pill"><app-icon name="sparkles" className="text-xs"></app-icon> Level {{ level(summary) }}</span>
                  <span class="xp-pill"><app-icon name="progress" className="text-xs"></app-icon> {{ totalXp(summary) }} XP</span>
                  <span class="xp-pill"><app-icon name="streak" className="text-xs"></app-icon> {{ streakDays(summary) }}d streak</span>
                </div>

                <h1 class="comic-heading mt-4 text-3xl text-slate-900 sm:text-5xl">
                  Mission hub, {{ displayName() }}.
                </h1>
                <p class="mt-3 text-sm font-semibold leading-7 text-slate-700 sm:text-base">
                  Pick one mission. Win one moment.
                </p>

                <div class="speech-bubble mt-4 max-w-2xl">
                  <div class="flex items-start gap-3">
                    <div class="guide-avatar">
                      <app-icon name="bot" className="text-sm"></app-icon>
                    </div>
                    <div>
                      <div class="comic-subline text-slate-500">Nova, AI guide</div>
                      <div class="mt-2 text-sm font-semibold leading-7" [ngClass]="emotionClass(summary)">
                        {{ emotionalLine(summary) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="cluster-actions">
                <a routerLink="/tests/baseline" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                  Scan now
                </a>
                <a routerLink="/journal" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">
                  Dump thoughts
                </a>
                <a routerLink="/exercises" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                  Calm now
                </a>
              </div>
            </div>

            <div class="mission-grid mt-7">
              <a
                *ngFor="let mission of missionCards(summary)"
                [routerLink]="mission.link"
                class="mission-card block">
                <div class="flex items-start justify-between gap-3">
                  <div class="mt-card-brand min-w-0">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon [name]="mission.icon" className="text-base"></app-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="mission-tag">{{ mission.kicker }}</div>
                      <div class="mt-3 text-xl font-semibold text-slate-900">{{ mission.title }}</div>
                    </div>
                  </div>
                  <div class="mt-chip">+{{ mission.rewardXp }} XP</div>
                </div>
                <div class="mt-3 text-sm font-medium leading-6 text-slate-700">{{ mission.description }}</div>
                <div class="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ mission.progress }}</div>
              </a>
            </div>

            <div class="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div class="mission-card">
                <div class="mt-card-brand">
                  <div class="mt-card-icon">
                    <app-icon name="brain" className="text-lg"></app-icon>
                  </div>
                  <div>
                    <div class="comic-subline text-slate-500">Current state</div>
                    <div class="mt-chip mt-3">
                      {{ summary.currentMentalState?.mentalState || summary.currentMentalState?.mental_state || 'Balanced' }}
                    </div>
                  </div>
                </div>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-700">
                  {{ summary.currentMentalState?.description || 'Things look steady. Keep the rhythm.' }}
                </p>
              </div>

              <div class="mt-card-strong mt-card-hover p-6">
                <div class="mt-card-brand">
                  <div class="mt-card-icon">
                    <app-icon name="target" className="text-lg"></app-icon>
                  </div>
                  <div>
                    <div class="comic-subline text-white/70">Best next move</div>
                    <div class="mt-3 text-2xl font-semibold">{{ summary.suggestedAction?.title || 'Keep a gentle routine' }}</div>
                  </div>
                </div>
                <div class="mt-card-copy mt-3 text-sm">{{ summary.suggestedAction?.whyRecommended || 'Calm first. Then focus.' }}</div>
                <div class="mt-4 rounded-3xl bg-white/10 px-4 py-4 text-sm leading-7 text-sky-50/85">
                  Reward: {{ summary.suggestedAction?.expectedOutcome || 'A steadier vibe and a clearer next move.' }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="mt-card mt-card-hover p-5">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="chart-line" className="text-base"></app-icon>
                </div>
                <div class="mt-card-kicker">Mind score</div>
              </div>
              <div class="mt-card-stat mt-4 text-slate-900">{{ latestScore(summary) }}</div>
              <div class="mt-card-copy mt-2 text-sm">Latest scan out of 100.</div>
            </div>
            <div class="mt-card mt-card-hover p-5">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="smile" className="text-base"></app-icon>
                </div>
                <div class="mt-card-kicker">Mood pings</div>
              </div>
              <div class="mt-card-stat mt-4 text-slate-900">{{ summary.activitySummary?.moodCheckIns30d || 0 }}</div>
              <div class="mt-card-copy mt-2 text-sm">Last 30 days.</div>
            </div>
            <div class="mt-card mt-card-hover p-5">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="streak" className="text-base"></app-icon>
                </div>
                <div class="mt-card-kicker">Calm streak</div>
              </div>
              <div class="mt-card-stat mt-4 text-slate-900">{{ summary.activitySummary?.exerciseStreak || 0 }}d</div>
              <div class="mt-card-copy mt-2 text-sm">Keep this alive.</div>
            </div>
            <div class="mt-card mt-card-hover p-5">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="journal" className="text-base"></app-icon>
                </div>
                <div class="mt-card-kicker">Thought dumps</div>
              </div>
              <div class="mt-card-stat mt-4 text-slate-900">{{ summary.activitySummary?.journalEntries30d || 0 }}</div>
              <div class="mt-card-copy mt-2 text-sm">Last 30 days.</div>
            </div>
          </div>

          <div class="mt-card mt-card-hover p-5 sm:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="sparkles" className="text-base"></app-icon>
                </div>
                <div>
                  <div class="comic-subline text-slate-500">Achievements</div>
                  <div class="mt-2 text-lg font-semibold text-slate-900">Unlocked by momentum</div>
                </div>
              </div>
              <div class="mt-chip">{{ unlockedAchievements(summary).length }}/{{ achievements(summary).length }} unlocked</div>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <div
                *ngFor="let badge of achievements(summary)"
                class="achievement-chip"
                [class.opacity-45]="!badge.unlocked">
                <app-icon [name]="badge.icon" className="text-xs"></app-icon>
                <span>{{ badge.label }}</span>
              </div>
            </div>
          </div>

          <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div class="space-y-6">
              <app-progress-chart
                title="Mental score trend"
                subtitle="Recent score movement"
                [labels]="summary.analytics?.scoreTrend?.labels || fallbackLabels"
                [values]="summary.analytics?.scoreTrend?.values || fallbackValues"
                lineColor="#0284c7"
                icon="analytics"></app-progress-chart>

              <div class="grid gap-6 lg:grid-cols-2">
                <app-progress-chart
                  title="Mood trend"
                  subtitle="Last 7 check-ins"
                  [labels]="summary.analytics?.moodTrend?.labels || fallbackLabels"
                  [values]="summary.analytics?.moodTrend?.values || [3,3,4,3,4,4,5]"
                  lineColor="#10b981"
                  icon="smile"></app-progress-chart>

                <app-progress-chart
                  title="Stress trend"
                  subtitle="Last 7 check-ins"
                  [labels]="summary.analytics?.stressTrend?.labels || fallbackLabels"
                  [values]="summary.analytics?.stressTrend?.values || [68,62,59,61,57,54,49]"
                  lineColor="#f97316"
                  icon="heartbeat"></app-progress-chart>
              </div>

              <div class="theme-bento-card-soft rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="analytics" className="text-base"></app-icon>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900">Pattern read</div>
                      <div class="mt-1 text-xs leading-5 text-slate-500">The short version of what your recent logs are saying.</div>
                    </div>
                  </div>
                  <span class="theme-kicker rounded-full px-3 py-1 text-xs font-semibold">Fresh read</span>
                </div>

                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <article
                    *ngFor="let card of patternCards(summary); trackBy: trackPatternCard"
                    class="rounded-[1.75rem] px-4 py-4"
                    [class.theme-bento-card-strong]="card.dark"
                    [class.theme-bento-card]="!card.dark">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0">
                        <div class="flex items-center gap-3">
                          <div class="mt-card-icon h-10 w-10 rounded-[0.85rem]">
                            <app-icon [name]="card.icon" className="text-sm"></app-icon>
                          </div>
                          <div class="text-[11px] font-semibold uppercase tracking-[0.18em]" [ngClass]="card.dark ? 'text-white/65' : 'text-slate-400'">
                            {{ card.eyebrow }}
                          </div>
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
                  <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="mood" className="text-base"></app-icon>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900">Mood ping</div>
                      <div class="mt-1 text-xs leading-5 text-slate-500">Tap mood. Slide stress, sleep, energy.</div>
                    </div>
                  </div>
                  <span *ngIf="checkInSaved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
                </div>

                <div class="mt-4">
                  <app-mood-tracker [showHeader]="false" [value]="checkInMood" (valueChange)="checkInMood = $event"></app-mood-tracker>
                </div>

                <div class="mt-5 space-y-4">
                  <label class="block text-sm font-semibold text-slate-800">
                    Stress
                    <div class="mt-2 flex items-center gap-3">
                      <input [(ngModel)]="stressLevel" type="range" min="0" max="100" class="w-full" />
                      <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ stressLevel }}</div>
                    </div>
                  </label>

                  <label class="block text-sm font-semibold text-slate-800">
                    Sleep
                    <div class="mt-2 flex items-center gap-3">
                      <input [(ngModel)]="sleepQuality" type="range" min="1" max="5" class="w-full" />
                      <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ sleepQuality }}/5</div>
                    </div>
                  </label>

                  <label class="block text-sm font-semibold text-slate-800">
                    Energy
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
                  {{ checkInPending ? "Saving..." : "Lock check-in" }}
                </button>
              </div>

              <div class="theme-bento-card-soft rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="sparkles" className="text-base"></app-icon>
                    </div>
                  <div class="text-sm font-semibold text-slate-900">AI callouts</div>
                </div>
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
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="exercises" className="text-base"></app-icon>
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">Recommended exercises</div>
                  <div class="mt-1 text-xs leading-5 text-slate-500">Short list. Best fit first.</div>
                </div>
              </div>
              <a routerLink="/exercises" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Browse all</a>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <article *ngFor="let ex of (summary.recommendationCards || []).slice(0, 4)" class="theme-bento-card rounded-[2rem] p-5">
                <div class="flex items-start justify-between gap-4">
                  <div class="mt-card-brand min-w-0">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon [name]="ex.category === 'breathing' ? 'spa' : ex.category === 'stress-release' ? 'activity' : 'heartbeat'" className="text-base"></app-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ label(ex.category) }}</div>
                      <div class="mt-2 text-lg font-semibold text-slate-900">{{ ex.title }}</div>
                    </div>
                  </div>
                  <div class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                    {{ ex.durationMinutes }}m
                  </div>
                </div>
                <div class="mt-3 text-sm leading-7 text-slate-600">{{ ex.purpose || ex.description }}</div>
                <div class="theme-bento-card-soft mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
                  <div class="font-semibold text-slate-900">Why it fits</div>
                  <div class="mt-1">{{ ex.whyRecommended }}</div>
                </div>
                <div class="theme-bento-card-soft mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
                  <div class="font-semibold text-slate-900">What you get</div>
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

  totalXp(summary: DashboardSummary): number {
    const moodLogs = Number(summary.activitySummary?.moodCheckIns30d || 0);
    const journalLogs = Number(summary.activitySummary?.journalEntries30d || 0);
    const exerciseLogs = Number(summary.activitySummary?.exerciseCompleted30d || 0);
    const scoreBonus = Math.max(0, this.latestScore(summary));
    return moodLogs * 8 + journalLogs * 12 + exerciseLogs * 15 + Math.round(scoreBonus * 2.5);
  }

  level(summary: DashboardSummary): number {
    return Math.max(1, Math.floor(this.totalXp(summary) / 320) + 1);
  }

  streakDays(summary: DashboardSummary): number {
    const exercise = Number(summary.activitySummary?.exerciseStreak || 0);
    const journal = Number(summary.activitySummary?.journalStreak || 0);
    return Math.max(exercise, journal);
  }

  emotionClass(summary: DashboardSummary): string {
    const stress = lastValue(summary.analytics?.stressTrend?.values, 55);
    const mood = lastValue(summary.analytics?.moodTrend?.values, 3);
    const delta = trendDelta(summary.analytics?.scoreTrend?.values);

    if (delta >= 5 && mood >= 4) {
      return "status-line-good";
    }

    if (stress >= 65 || mood <= 2) {
      return "status-line-slow";
    }

    return "status-line-steady";
  }

  emotionalLine(summary: DashboardSummary): string {
    const stress = lastValue(summary.analytics?.stressTrend?.values, 55);
    const mood = lastValue(summary.analytics?.moodTrend?.values, 3);
    const delta = trendDelta(summary.analytics?.scoreTrend?.values);

    if (delta >= 5 && mood >= 4) {
      return "You're doing better today. Keep this rhythm.";
    }

    if (stress >= 65 || mood <= 2) {
      return "Let's slow things down. Calm first, then decide.";
    }

    if (this.streakDays(summary) >= 4) {
      return "Streak looks strong. One more mission keeps momentum.";
    }

    return "Small moves still count. Pick one mission and go.";
  }

  missionCards(summary: DashboardSummary): MissionCard[] {
    const journalCount = Number(summary.activitySummary?.journalEntries30d || 0);
    const exerciseCount = Number(summary.activitySummary?.exerciseCompleted30d || 0);
    const testsTaken = summary.latestBaseline ? 1 : 0;

    return [
      {
        key: "journal",
        kicker: "Mission 02",
        title: "Dump your thoughts",
        description: "Drop 2-5 lines. Clear the mental noise.",
        progress: `${journalCount} dumps in 30d`,
        link: "/journal",
        icon: "journal",
        rewardXp: 20
      },
      {
        key: "exercise",
        kicker: "Mission 03",
        title: "Calm your mind",
        description: "Run one reset move and log how it felt.",
        progress: `${exerciseCount} calm runs in 30d`,
        link: "/exercises",
        icon: "exercises",
        rewardXp: 25
      },
      {
        key: "test",
        kicker: "Mission 01",
        title: "Scan your mind",
        description: "Take a quick check. Update your read.",
        progress: testsTaken ? "Latest scan complete" : "No scan yet",
        link: "/tests/baseline",
        icon: "tests",
        rewardXp: 30
      }
    ];
  }

  achievements(summary: DashboardSummary): AchievementBadge[] {
    const streak = this.streakDays(summary);
    const moodLogs = Number(summary.activitySummary?.moodCheckIns30d || 0);
    const journalLogs = Number(summary.activitySummary?.journalEntries30d || 0);
    const exercises = Number(summary.activitySummary?.exerciseCompleted30d || 0);
    const scoreDelta = trendDelta(summary.analytics?.scoreTrend?.values);

    return [
      { key: "starter", label: "First Scan", icon: "tests", unlocked: !!summary.latestBaseline },
      { key: "tracker", label: "Mood Tracker", icon: "mood", unlocked: moodLogs >= 5 },
      { key: "writer", label: "Thought Dumper", icon: "journal", unlocked: journalLogs >= 5 },
      { key: "calm", label: "Calm Runner", icon: "exercises", unlocked: exercises >= 4 },
      { key: "streak", label: "Streak Keeper", icon: "streak", unlocked: streak >= 3 },
      { key: "momentum", label: "Momentum Up", icon: "progress", unlocked: scoreDelta >= 5 }
    ];
  }

  unlockedAchievements(summary: DashboardSummary): AchievementBadge[] {
    return this.achievements(summary).filter((badge) => badge.unlocked);
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
          this.checkInError = err?.error?.error || "Couldn't save that check-in.";
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
          icon: "chart-line",
          eyebrow: "Momentum",
          title: "Your score is climbing.",
          description: `You're up ${scoreDelta} points. The current routine is doing its thing.`,
          supporting: "Keep the good pieces steady for a few more days.",
          badge: `+${scoreDelta}`
        }
      : scoreDelta <= -5
        ? {
            key: "momentum",
            icon: "chart-line",
            eyebrow: "Momentum",
            title: "Your baseline looks a bit strained.",
            description: `You're down ${Math.abs(scoreDelta)} points, so recovery matters more than pushing harder.`,
            supporting: `Start with ${suggestedAction.toLowerCase()} and keep it simple.`,
            badge: `${scoreDelta}`
          }
        : {
            key: "momentum",
            icon: "chart-line",
            eyebrow: "Momentum",
            title: "Your baseline is pretty steady.",
            description: "The trend is flat, which usually means your maintenance habits are holding.",
            supporting: "Stay consistent. No need to force it.",
            badge: "steady"
          };

  const pressureCard: PatternInsightCard =
    latestStress >= 60 && latestMood <= 3
      ? {
          key: "pressure",
          icon: "heartbeat",
          eyebrow: "Mood and stress",
          title: "Stress looks like the main issue.",
          description: "Mood is flatter while stress stays high. Reset first, solve stuff second.",
          supporting: "Smaller task load, one calming move, then think.",
          badge: `${Math.round(latestStress)} stress`,
          dark: true
        }
      : latestStress <= 52 && latestMood >= 4
        ? {
            key: "pressure",
            icon: "smile",
            eyebrow: "Mood and stress",
            title: "Mood is stabilizing.",
            description: "Recent check-ins look more balanced.",
            supporting: "Good time to repeat what's already working.",
            badge: `${latestMood.toFixed(1)} mood`
          }
        : {
            key: "pressure",
            icon: "pulse",
            eyebrow: "Mood and stress",
            title: "Your signals are mixed.",
            description: "Mood and stress are moving, but not in a clean way yet.",
            supporting: "A few more check-ins will sharpen the read.",
            badge: "mixed"
          };

  const journalCard: PatternInsightCard = primaryJournalPattern
    ? {
        key: "journal",
        icon: "journal",
        eyebrow: "Journal signal",
        title: `Your writing keeps circling ${formatPattern(primaryJournalPattern)}.`,
        description: `The tone feels ${sentimentTone(sentiment)}, so that pattern may be carrying some weight right now.`,
        supporting: journalGuidance(primaryJournalPattern),
        badge: formatPattern(primaryJournalPattern)
      }
    : {
        key: "journal",
        icon: "journal",
        eyebrow: "Journal signal",
        title: "Not enough journal signal yet.",
        description: "A few more notes will make this read way better.",
        supporting: "\"Two honest lines\" still count.",
        badge: "build signal"
      };

  const routineCard: PatternInsightCard =
    exerciseStreak >= 3 || moodCheckIns >= 5
      ? {
          key: "routine",
          icon: "streak",
          eyebrow: "Habit signal",
          title: "Consistency is helping.",
          description: `${exerciseStreak} day streak and ${moodCheckIns} mood logs give the app a cleaner read.`,
          supporting: `Next focus: ${suggestedAction}.`,
          badge: exerciseStreak >= 3 ? `${exerciseStreak}d streak` : `${moodCheckIns} logs`
        }
      : {
          key: "routine",
          icon: "target",
          eyebrow: "Habit signal",
          title: "Better signal beats more complexity.",
          description: "The app gets sharper when mood, notes, and exercises show up more often.",
          supporting: "Track a little more before adding more stuff.",
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
    return "Turn one repeated thought into one bounded action.";
  }

  if (key.includes("comparison")) {
    return "Step back from comparison and come back to your own pace.";
  }

  if (key.includes("self")) {
    return "Rewrite one harsh line so the next step feels workable.";
  }

  if (key.includes("grat")) {
    return "Notice what's helping and make it easier to repeat.";
  }

  return "Use the note to pick one next move, not just describe the loop.";
}

function formatPattern(value: string): string {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
