import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Exercise } from "../../core/services/exercises.service";

@Component({
  selector: "app-exercise-card",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]">
      <div class="flex items-start justify-between gap-4">
        <div class="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span class="truncate">{{ categoryLabel(exercise.category) }}</span>
        </div>
        <div class="shrink-0 text-sm font-semibold text-slate-600">{{ exercise.durationMinutes }} min</div>
      </div>

      <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ exercise.title }}</h3>
      <p class="mt-2 text-sm leading-7 text-slate-600">{{ exercise.purpose || exercise.description }}</p>

      <div *ngIf="exercise.expectedOutcome" class="mt-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
        <div class="font-semibold text-slate-900">Expected outcome</div>
        <div class="mt-1">{{ exercise.expectedOutcome }}</div>
      </div>

      <div *ngIf="exercise.tags?.length" class="mt-4 flex flex-wrap gap-2">
        <span *ngFor="let tag of exercise.tags!.slice(0, 4)" class="rounded-full bg-[var(--mist)] px-3 py-1 text-xs font-semibold text-slate-600">
          {{ tag }}
        </span>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {{ (exercise.difficulty || "easy") }}
        </div>
        <button
          type="button"
          (click)="start.emit(exercise)"
          class="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950">
          View details
        </button>
      </div>
    </article>
  `
})
export class ExerciseCardComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Output() start = new EventEmitter<Exercise>();

  categoryLabel(value: string): string {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "exercise";
    }

    return trimmed
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
