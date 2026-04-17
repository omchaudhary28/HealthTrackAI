import { CommonModule } from "@angular/common";
import { animate, style, transition, trigger } from "@angular/animations";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, catchError, of } from "rxjs";
import { Exercise, ExercisesService } from "../../core/services/exercises.service";
import { BoxBreathingComponent } from "../../shared/components/box-breathing.component";
import { ExerciseCardComponent, ExerciseCardStartEvent } from "../../shared/components/exercise-card.component";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-exercise-library-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, ExerciseCardComponent, BoxBreathingComponent, FormsModule, IconComponent],
  animations: [
    trigger("exerciseOverlay", [
      transition(":enter", [style({ opacity: 0 }), animate("320ms ease-out", style({ opacity: 1 }))]),
      transition(":leave", [animate("260ms ease-in", style({ opacity: 0 }))])
    ]),
    trigger("exercisePanel", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(26px) scale(0.98)" }),
        animate("420ms cubic-bezier(0.22, 1, 0.36, 1)", style({ opacity: 1, transform: "translateY(0) scale(1)" }))
      ]),
      transition(":leave", [
        animate("320ms cubic-bezier(0.4, 0, 1, 1)", style({ opacity: 0, transform: "translateY(16px) scale(0.985)" }))
      ])
    ])
  ],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="mt-card-brand max-w-4xl">
          <div class="mt-card-icon">
            <app-icon name="exercises" className="text-xl"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">Exercise Library</div>
            <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">Tiny resets, ready when you are.</h1>
            <p class="mt-card-copy mt-3 text-sm sm:text-base">
              Pick one, do it, leave a quick note. The library stays light, useful, and responsive.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="mt-chip"><app-icon name="activity" className="text-xs"></app-icon> Activity</span>
              <span class="mt-chip"><app-icon name="spa" className="text-xs"></app-icon> Calm</span>
              <span class="mt-chip"><app-icon name="heartbeat" className="text-xs"></app-icon> Recovery</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-card mt-card-hover p-5 sm:p-6">
        <div class="mt-card-head">
          <div class="mt-card-brand">
            <div class="mt-card-icon">
              <app-icon name="sparkles" className="text-lg"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Recommended for you</div>
              <div class="mt-card-copy mt-2 text-sm">Best fit from your latest signal.</div>
            </div>
          </div>
          <button type="button" (click)="refreshRecommendations()" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Refresh</button>
        </div>

        <div class="mt-5 grid gap-6 lg:grid-cols-3">
          <ng-container *ngIf="recommended$ | async as recommended">
            <div
              *ngFor="let exercise of recommended; let i = index"
              appScrollReveal
              [revealDelay]="i * 60"
              class="card-container h-full">
              <div class="card-wrapper">
                <article
                  class="card mt-card mt-card-hover comic-corner-doodle"
                  [style.view-transition-name]="cardTransitionName('recommended', exercise, i)">
                  <div class="card-inner">
                    <div class="mt-card-head">
                      <div class="mt-card-brand">
                        <div class="mt-card-icon">
                          <app-icon [name]="exercise.category === 'breathing' ? 'spa' : exercise.category === 'stress-release' ? 'activity' : 'heartbeat'" className="text-lg icon-bounce-soft"></app-icon>
                        </div>
                        <div>
                          <div class="mt-card-kicker">{{ label(exercise.category) }}</div>
                          <div class="mt-2 text-lg font-semibold text-slate-900">{{ exercise.title }}</div>
                        </div>
                      </div>
                      <div class="mt-chip">{{ exercise.durationMinutes }}m</div>
                    </div>
                    <div class="mt-card-copy mt-4 text-sm">{{ exercise.purpose || exercise.description }}</div>
                    <div class="mt-2 text-xs text-slate-500">Take it at your pace. A short reset still helps.</div>
                    <div class="exercise-note mt-4 p-4 text-sm leading-7 text-slate-700">
                      <div class="mt-card-kicker">Why it fits</div>
                      <div class="mt-2">{{ exercise.whyRecommended }}</div>
                    </div>
                    <div class="exercise-note mt-4 p-4 text-sm leading-7 text-slate-700">
                      <div class="mt-card-kicker">What you get</div>
                      <div class="mt-2">{{ exercise.expectedOutcome }}</div>
                    </div>
                    <button
                      type="button"
                      (click)="open(exercise, cardTransitionName('recommended', exercise, i))"
                      class="btn-primary mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold">
                      Open exercise
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <div class="mt-card mt-card-hover p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="mt-card-brand">
            <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
              <app-icon name="clipboard" className="text-base"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Browse by category</div>
              <div class="mt-card-copy text-sm">Pick one lane.</div>
            </div>
          </div>
          <button type="button" (click)="refresh()" class="btn-outline rounded-xl px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div class="chip-scroll mt-4">
          <button
            *ngFor="let cat of categories"
            type="button"
            (click)="selectCategory(cat.key)"
            class="mt-chip transition"
            [class.bg-slate-900]="selectedCategory === cat.key"
            [class.border-slate-900]="selectedCategory === cat.key"
            [class.text-white]="selectedCategory === cat.key">
            {{ cat.label }}
          </button>
        </div>
      </div>

      <ng-container *ngIf="exercises$ | async as exercises; else loading">
        <div *ngIf="!exercises.length" class="mt-card-soft p-6 text-sm text-slate-600">
          <div class="comic-empty-state">
            <div class="comic-empty-illustration"></div>
            <div>
              <div class="font-semibold text-slate-700">No exercises here yet.</div>
              <div class="mt-1 text-sm text-slate-600">Try another category and we will surface options.</div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <app-exercise-card
            *ngFor="let exercise of exercises; let i = index"
            appScrollReveal
            [revealDelay]="i * 60"
            [exercise]="exercise"
            [transitionName]="cardTransitionName('library', exercise, i)"
            (start)="onExerciseCardStart($event)"></app-exercise-card>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="mt-card-soft p-6 text-sm text-slate-600">
          <div class="comic-empty-state">
            <div class="comic-empty-illustration"></div>
            <div>Loading exercises...</div>
          </div>
        </div>
      </ng-template>

      <div *ngIf="activeExercise" @exerciseOverlay class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-950/25 backdrop-blur-sm" (click)="closeActiveExercise()"></div>
        <div
          @exercisePanel
          class="relative max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[1.75rem] border border-white/60 bg-white/96 shadow-2xl backdrop-blur sm:rounded-[2.25rem]"
          [style.view-transition-name]="activeTransitionName()">
          <div class="sticky top-0 z-10 border-b border-white/60 bg-white/88 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
            <div class="flex items-start justify-between gap-3">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon [name]="activeExercise.category === 'breathing' ? 'spa' : activeExercise.category === 'stress-release' ? 'activity' : 'heartbeat'" className="text-base"></app-icon>
                </div>
                <div>
                  <div class="mt-card-kicker">{{ label(activeExercise.category) }} | {{ activeExercise.durationMinutes }} min</div>
                  <div class="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{{ activeExercise.title }}</div>
                </div>
              </div>
              <button
                type="button"
                (click)="closeActiveExercise()"
                class="btn-outline inline-flex h-10 w-10 items-center justify-center rounded-2xl"
                aria-label="Close">
                <app-icon name="arrow" className="text-sm rotate-45"></app-icon>
              </button>
            </div>
          </div>

          <div class="px-4 py-4 sm:px-6 sm:py-6">
            <div class="exercise-layout">
              <div class="space-y-5">
                <div class="exercise-note p-5">
                  <div class="mt-card-kicker">Why</div>
                  <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.purpose || activeExercise.description }}</p>
                </div>

                <div class="exercise-note p-5">
                  <div class="mt-card-kicker">What you get</div>
                  <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.expectedOutcome || "A calmer next step and a little more room to breathe." }}</p>
                </div>

                <div *ngIf="activeExercise.benefits?.length" class="exercise-note p-5">
                  <div class="mt-card-kicker">Benefits</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span *ngFor="let benefit of activeExercise.benefits" class="mt-chip">
                      {{ benefit }}
                    </span>
                  </div>
                </div>

                <div *ngIf="activeExercise.instructions?.length" class="exercise-note p-5">
                  <div class="mt-card-kicker">Steps</div>
                  <ol class="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    <li *ngFor="let step of activeExercise.instructions; let i = index" class="flex gap-3">
                      <div class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{{ i + 1 }}</div>
                      <div>{{ step }}</div>
                    </li>
                  </ol>
                </div>
              </div>

              <div class="space-y-5">
                <div *ngIf="activeExercise.whyRecommended" class="exercise-note p-5">
                  <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="sparkles" className="text-base"></app-icon>
                    </div>
                    <div>
                      <div class="mt-card-kicker">AI note</div>
                      <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.whyRecommended }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="activeExercise.category === 'breathing'" class="breathing-card-shell">
                  <app-box-breathing></app-box-breathing>
                </div>

                <div class="mt-card p-5">
                  <div class="mt-card-brand">
                    <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                      <app-icon name="feedback" className="text-base"></app-icon>
                    </div>
                    <div>
                      <div class="mt-card-kicker">Quick feedback</div>
                      <div class="mt-card-copy mt-2 text-sm">Tell the recommender how this felt.</div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="mt-card-kicker">How'd it feel?</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button *ngFor="let rating of [1,2,3,4,5]" type="button" (click)="feedbackRating = rating"
                        class="mt-chip transition"
                        [class.bg-slate-900]="feedbackRating === rating"
                        [class.border-slate-900]="feedbackRating === rating"
                        [class.text-white]="feedbackRating === rating">
                        {{ rating }}/5
                      </button>
                    </div>
                  </div>

                  <label class="mt-4 block text-sm font-medium text-slate-600">
                    What changed after this?
                    <textarea [(ngModel)]="resultAfter" rows="3" class="app-textarea mt-2" placeholder="Example: Less tense. More clear."></textarea>
                  </label>

                  <label class="mt-4 block text-sm font-medium text-slate-600">
                    Optional note
                    <textarea [(ngModel)]="feedbackText" rows="3" class="app-textarea mt-2" placeholder="Anything worth remembering?"></textarea>
                  </label>

                  <div *ngIf="completionSuccess" class="mt-success-pop mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Saved. Future picks will learn from this.
                  </div>

                  <button type="button" (click)="completeActiveExercise()" [disabled]="completionPending" class="btn-primary mt-5 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
                    {{ completionPending ? "Saving..." : "Mark complete" }}
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
  activeExerciseTransitionName = "";
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

  onExerciseCardStart(event: ExerciseCardStartEvent): void {
    this.open(event.exercise, event.transitionName);
  }

  open(exercise: Exercise, transitionName: string | null = null): void {
    this.activeExerciseTransitionName = transitionName || this.transitionNameFor("library", exercise, 0);

    this.withViewTransition(() => {
      this.activeExercise = exercise;
      this.feedbackRating = 4;
      this.feedbackText = "";
      this.resultAfter = "";
      this.completionSuccess = false;
    });
  }

  closeActiveExercise(): void {
    if (!this.activeExercise) {
      return;
    }

    if (!this.activeExerciseTransitionName) {
      this.activeExerciseTransitionName = this.transitionNameFor("library", this.activeExercise, 0);
    }

    this.withViewTransition(() => {
      this.activeExercise = null;
      this.completionSuccess = false;
    });
  }

  cardTransitionName(scope: "recommended" | "library", exercise: Exercise, index: number): string | null {
    if (this.activeExercise) {
      return "none";
    }

    return this.transitionNameFor(scope, exercise, index);
  }

  activeTransitionName(): string | null {
    if (!this.activeExercise) {
      return null;
    }

    return this.activeExerciseTransitionName;
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

  private withViewTransition(update: () => void): void {
    if (typeof document === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update();
      return;
    }

    const transitionDoc = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (typeof transitionDoc.startViewTransition !== "function") {
      update();
      return;
    }

    transitionDoc.startViewTransition(() => update());
  }

  private transitionNameFor(scope: "recommended" | "library", exercise: Exercise, index: number): string {
    const source = `${exercise.key || exercise.title || "card"}`.toLowerCase();
    const cleaned = source.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `exercise-card-${scope}-${cleaned || "item"}-${index}`;
  }
}
