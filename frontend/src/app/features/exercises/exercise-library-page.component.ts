import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Observable, catchError, of } from "rxjs";
import { Exercise, ExercisesService } from "../../core/services/exercises.service";
import { ExerciseCardComponent } from "../../shared/components/exercise-card.component";
import { BoxBreathingComponent } from "../../shared/components/box-breathing.component";

@Component({
  selector: "app-exercise-library-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, ExerciseCardComponent, BoxBreathingComponent],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-3xl border border-white/70 bg-[linear-gradient(145deg,rgba(159,215,201,0.20),rgba(255,255,255,0.88))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.45)]">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Exercise Library</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">Small practices matched to stress, focus, sleep, and reflection.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          Choose a short exercise and start gently. These are wellness activities, not treatment plans.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">Browse by category</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">Pick one focus to lower decision fatigue.</div>
          </div>
          <button
            type="button"
            (click)="refresh()"
            class="btn-outline rounded-xl px-4 py-2 text-sm font-semibold">
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
        <div *ngIf="!exercises.length" class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
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
        <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
          Loading exercises...
        </div>
      </ng-template>

      <div *ngIf="activeExercise" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" (click)="activeExercise = null"></div>
        <div class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
          <div class="border-b border-slate-100 px-6 py-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{{ label(activeExercise.category) }} | {{ activeExercise.durationMinutes }} min</div>
                <div class="mt-2 text-xl font-semibold text-slate-900">{{ activeExercise.title }}</div>
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
            <p class="text-sm leading-7 text-slate-700">{{ activeExercise.description }}</p>

            <div *ngIf="activeExercise.instructions?.length" class="mt-5">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Instructions</div>
              <ol class="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                <li *ngFor="let step of activeExercise.instructions; let i = index" class="flex gap-3">
                  <div class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{{ i + 1 }}</div>
                  <div>{{ step }}</div>
                </li>
              </ol>
            </div>

            <div *ngIf="activeExercise.category === 'breathing'" class="mt-6">
              <app-box-breathing></app-box-breathing>
            </div>

            <div class="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
              Try to keep this gentle. If anything feels activating, pause and choose a smaller step.
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ExerciseLibraryPageComponent {
  exercises$: Observable<Exercise[]>;
  activeExercise: Exercise | null = null;

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
  }

  selectCategory(value: string | null): void {
    this.selectedCategory = value;
    this.exercises$ = this.load();
  }

  refresh(): void {
    this.exercises$ = this.load();
  }

  open(exercise: Exercise): void {
    this.activeExercise = exercise;
  }

  label(value: string): string {
    return (value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private load(): Observable<Exercise[]> {
    return this.exercisesService.list(this.selectedCategory || undefined).pipe(catchError(() => of([])));
  }
}


