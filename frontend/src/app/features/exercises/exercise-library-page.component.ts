import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Observable, catchError, of } from "rxjs";
import { Exercise, ExercisesService } from "../../core/services/exercises.service";
import { ExerciseCardComponent } from "../../shared/components/exercise-card.component";
import { BoxBreathingComponent } from "../../shared/components/box-breathing.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-exercise-library-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, ExerciseCardComponent, BoxBreathingComponent, FormsModule],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(255,255,255,0.48),rgba(16,185,129,0.08))] p-8">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Exercise Library</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Actionable exercises with AI reasoning, expected outcomes, and feedback loops.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          These practices are small, supportive interventions. Complete one, leave feedback, and MindTrack will learn what helps you most.
        </p>
      </div>

      <div class="glass-card rounded-[2rem] p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">Recommended for you</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">Generated from your latest mental-state snapshot and activity patterns.</div>
          </div>
          <button type="button" (click)="refreshRecommendations()" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Refresh</button>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-3">
          <ng-container *ngIf="recommended$ | async as recommended">
            <article *ngFor="let exercise of recommended; let i = index" appScrollReveal [revealDelay]="i * 60" class="rounded-[2rem] border border-slate-100 bg-white/80 p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ label(exercise.category) }}</div>
                  <div class="mt-2 text-lg font-semibold text-slate-900">{{ exercise.title }}</div>
                </div>
                <div class="rounded-full bg-[var(--mt-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--mt-accent-strong)]">
                  {{ exercise.durationMinutes }}m
                </div>
              </div>
              <div class="mt-3 text-sm leading-7 text-slate-600">{{ exercise.purpose || exercise.description }}</div>
              <div class="mt-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                <div class="font-semibold text-slate-900">Why recommended</div>
                <div class="mt-1">{{ exercise.whyRecommended }}</div>
              </div>
              <div class="mt-4 rounded-3xl bg-slate-950/[0.03] px-4 py-4 text-sm leading-7 text-slate-700">
                <div class="font-semibold text-slate-900">Expected outcome</div>
                <div class="mt-1">{{ exercise.expectedOutcome }}</div>
              </div>
              <button type="button" (click)="open(exercise)" class="btn-primary mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold">
                Open exercise
              </button>
            </article>
          </ng-container>
        </div>
      </div>

      <div class="glass-card rounded-[2rem] p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">Browse by category</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">Pick one focus to lower decision fatigue.</div>
          </div>
          <button type="button" (click)="refresh()" class="btn-outline rounded-xl px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            *ngFor="let cat of categories"
            type="button"
            (click)="selectCategory(cat.key)"
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            [class.bg-slate-900]="selectedCategory === cat.key"
            [class.text-white]="selectedCategory === cat.key"
            [class.border-slate-900]="selectedCategory === cat.key">
            {{ cat.label }}
          </button>
        </div>
      </div>

      <ng-container *ngIf="exercises$ | async as exercises; else loading">
        <div *ngIf="!exercises.length" class="glass-card rounded-[2rem] p-6 text-sm text-slate-600">
          No exercises found for this category yet.
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <app-exercise-card
            *ngFor="let exercise of exercises; let i = index"
            appScrollReveal
            [revealDelay]="i * 60"
            [exercise]="exercise"
            (start)="open(exercise)"></app-exercise-card>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="glass-card rounded-[2rem] p-6 text-sm text-slate-600">
          Loading exercises...
        </div>
      </ng-template>

      <div *ngIf="activeExercise" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-950/25 backdrop-blur-sm" (click)="activeExercise = null"></div>
        <div class="relative max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2.25rem] border border-white/60 bg-white shadow-2xl">
          <div class="sticky top-0 z-10 border-b border-slate-100 bg-white/92 px-6 py-5 backdrop-blur">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{{ label(activeExercise.category) }} | {{ activeExercise.durationMinutes }} min</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ activeExercise.title }}</div>
              </div>
              <button
                type="button"
                (click)="activeExercise = null"
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Close">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="px-6 py-6">
            <div class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div class="space-y-5">
                <div class="rounded-[2rem] bg-slate-50 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Purpose</div>
                  <p class="mt-2 text-sm leading-7 text-slate-700">{{ activeExercise.purpose || activeExercise.description }}</p>
                </div>

                <div class="rounded-[2rem] bg-slate-50 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Expected outcome</div>
                  <p class="mt-2 text-sm leading-7 text-slate-700">{{ activeExercise.expectedOutcome || 'A calmer next step and more emotional breathing room.' }}</p>
                </div>

                <div *ngIf="activeExercise.benefits?.length" class="rounded-[2rem] bg-slate-50 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Benefits</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span *ngFor="let benefit of activeExercise.benefits" class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {{ benefit }}
                    </span>
                  </div>
                </div>

                <div *ngIf="activeExercise.instructions?.length" class="rounded-[2rem] bg-slate-50 p-5">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Steps</div>
                  <ol class="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    <li *ngFor="let step of activeExercise.instructions; let i = index" class="flex gap-3">
                      <div class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{{ i + 1 }}</div>
                      <div>{{ step }}</div>
                    </li>
                  </ol>
                </div>
              </div>

              <div class="space-y-5">
                <div *ngIf="activeExercise.whyRecommended" class="rounded-[2rem] p-5" [ngStyle]="{ border: '1px solid var(--mt-accent-soft)', background: 'linear-gradient(135deg, var(--mt-accent-soft), rgba(255,255,255,0.65))' }">
                  <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mt-accent-strong)]">AI reasoning</div>
                  <p class="mt-2 text-sm leading-7 text-slate-700">{{ activeExercise.whyRecommended }}</p>
                </div>

                <div *ngIf="activeExercise.category === 'breathing'" class="rounded-[2rem] border border-slate-100 bg-white p-4">
                  <app-box-breathing></app-box-breathing>
                </div>

                <div class="rounded-[2rem] border border-slate-100 bg-white p-5">
                  <div class="text-sm font-semibold text-slate-900">Completion feedback</div>
                  <div class="mt-4">
                    <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">How helpful does this feel?</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button *ngFor="let rating of [1,2,3,4,5]" type="button" (click)="feedbackRating = rating"
                        class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                        [class.border-slate-900]="feedbackRating === rating"
                        [class.bg-slate-900]="feedbackRating === rating"
                        [class.text-white]="feedbackRating === rating"
                        [class.border-slate-200]="feedbackRating !== rating"
                        [class.text-slate-600]="feedbackRating !== rating">
                        {{ rating }}/5
                      </button>
                    </div>
                  </div>

                  <label class="mt-4 block text-sm font-medium text-slate-600">
                    What changed after this?
                    <textarea [(ngModel)]="resultAfter" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" placeholder="Example: I felt less tense and a bit clearer."></textarea>
                  </label>

                  <label class="mt-4 block text-sm font-medium text-slate-600">
                    Optional note
                    <textarea [(ngModel)]="feedbackText" rows="3" class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" placeholder="Anything MindTrack should remember about this exercise?"></textarea>
                  </label>

                  <div *ngIf="completionSuccess" class="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Completion saved. Future recommendations will adapt from this feedback.
                  </div>

                  <button type="button" (click)="completeActiveExercise()" [disabled]="completionPending" class="btn-primary mt-5 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
                    {{ completionPending ? 'Saving...' : 'Mark complete' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ExerciseLibraryPageComponent {
  exercises$: Observable<Exercise[]>;
  recommended$: Observable<Exercise[]>;
  activeExercise: Exercise | null = null;
  feedbackRating = 4;
  feedbackText = "";
  resultAfter = "";
  completionPending = false;
  completionSuccess = false;

  categories = [
    { key: null as string | null, label: "All" },
    { key: "breathing", label: "Breathing" },
    { key: "journaling", label: "Journaling" },
    { key: "thought-reframing", label: "Reframing" },
    { key: "stress-release", label: "Stress release" },
    { key: "sleep-improvement", label: "Sleep" },
    { key: "self-reflection", label: "Self reflection" }
  ];

  selectedCategory: string | null = null;

  constructor(private readonly exercisesService: ExercisesService) {
    this.exercises$ = this.load();
    this.recommended$ = this.loadRecommended();
  }

  selectCategory(value: string | null): void {
    this.selectedCategory = value;
    this.exercises$ = this.load();
  }

  refresh(): void {
    this.exercises$ = this.load();
  }

  refreshRecommendations(): void {
    this.recommended$ = this.loadRecommended();
  }

  open(exercise: Exercise): void {
    this.activeExercise = exercise;
    this.feedbackRating = 4;
    this.feedbackText = "";
    this.resultAfter = "";
    this.completionSuccess = false;
  }

  completeActiveExercise(): void {
    if (!this.activeExercise || this.completionPending) {
      return;
    }

    this.completionPending = true;
    this.exercisesService
      .complete({
        exerciseKey: this.activeExercise.key,
        exerciseTitle: this.activeExercise.title,
        category: this.activeExercise.category,
        durationMinutes: this.activeExercise.durationMinutes,
        source: this.activeExercise.whyRecommended ? "recommended" : "library",
        feedbackRating: this.feedbackRating,
        feedbackText: this.feedbackText.trim() || undefined,
        resultAfter: this.resultAfter.trim() || undefined,
        whyRecommended: this.activeExercise.whyRecommended,
        expectedOutcome: this.activeExercise.expectedOutcome
      })
      .subscribe({
        next: () => {
          this.completionPending = false;
          this.completionSuccess = true;
          this.refreshRecommendations();
        },
        error: () => {
          this.completionPending = false;
        }
      });
  }

  label(value: string): string {
    return (value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private load(): Observable<Exercise[]> {
    return this.exercisesService.list(this.selectedCategory || undefined).pipe(catchError(() => of([])));
  }

  private loadRecommended(): Observable<Exercise[]> {
    return this.exercisesService.recommended().pipe(catchError(() => of([])));
  }
}
