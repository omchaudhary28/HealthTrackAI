import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { Observable, Subscription, catchError, of } from "rxjs";
import { ExerciseModalService } from "../../core/services/exercise-modal.service";
import { Exercise, ExercisesService } from "../../core/services/exercises.service";
import { ExerciseCardComponent } from "../../shared/components/exercise-card.component";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-exercise-library-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, ExerciseCardComponent, IconComponent],
  template: `
    <section appScrollReveal class="page-stack motion-zone">
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
                  class="card mt-card mt-card-hover comic-corner-doodle cursor-pointer"
                  [style.view-transition-name]="cardTransitionName('recommended', exercise, i)"
                  (click)="openExercise(exercise, cardTransitionName('recommended', exercise, i))">
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
                      class="btn-primary mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold pointer-events-none">
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
            (start)="openExercise($event.exercise, $event.transitionName)"></app-exercise-card>
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
    </section>
  `
})
export class ExerciseLibraryPageComponent implements OnDestroy {
  exercises$: Observable<Exercise[]>;
  recommended$: Observable<Exercise[]>;
  selectedCategory: string | null = null;

  private readonly modalCompletionSubscription: Subscription;

  categories = [
    { key: null as string | null, label: "All" },
    { key: "breathing", label: "Breathing" },
    { key: "journaling", label: "Journaling" },
    { key: "thought-reframing", label: "Reframing" },
    { key: "stress-release", label: "Stress release" },
    { key: "sleep-improvement", label: "Sleep" },
    { key: "self-reflection", label: "Self reflection" }
  ];

  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly exerciseModalService: ExerciseModalService
  ) {
    this.exercises$ = this.load();
    this.recommended$ = this.loadRecommended();
    this.modalCompletionSubscription = this.exerciseModalService.completed$.subscribe(() => {
      this.refreshRecommendations();
    });
  }

  ngOnDestroy(): void {
    this.modalCompletionSubscription.unsubscribe();
    this.exerciseModalService.close();
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

  openExercise(exercise: Exercise, transitionName: string | null = null): void {
    const resolvedTransitionName = transitionName || this.transitionNameFor("library", exercise, 0);
    this.exerciseModalService.open(exercise, resolvedTransitionName);
  }

  cardTransitionName(scope: "recommended" | "library", exercise: Exercise, index: number): string | null {
    if (this.exerciseModalService.isOpen()) {
      return "none";
    }

    return this.transitionNameFor(scope, exercise, index);
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

  private transitionNameFor(scope: "recommended" | "library", exercise: Exercise, index: number): string {
    const source = `${exercise.key || exercise.title || "card"}`.toLowerCase();
    const cleaned = source.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `exercise-card-${scope}-${cleaned || "item"}-${index}`;
  }
}
