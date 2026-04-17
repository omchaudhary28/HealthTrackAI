import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Exercise } from "../../core/services/exercises.service";
import { IconComponent, MindtrackIconName } from "./icon.component";

export interface ExerciseCardStartEvent {
  exercise: Exercise;
  source: HTMLElement | null;
  transitionName: string;
}

@Component({
  selector: "app-exercise-card",
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-container h-full">
      <div class="card-wrapper">
        <article class="card mt-card mt-card-hover mt-card-intro comic-corner-doodle" [style.view-transition-name]="transitionName || null">
          <div class="card-inner">
            <div class="mt-card-head">
              <div class="mt-card-brand">
                <div class="mt-card-icon">
                  <app-icon [name]="iconForCategory(exercise.category)" className="text-lg icon-bounce-soft"></app-icon>
                </div>
                <div>
                  <div class="mt-card-kicker">{{ categoryLabel(exercise.category) }}</div>
                  <h3 class="mt-2 text-xl font-semibold text-slate-900">{{ exercise.title }}</h3>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="mt-chip">{{ exercise.durationMinutes }} min</div>
                <svg viewBox="0 0 40 20" class="h-5 w-10 text-slate-300/80" aria-hidden="true">
                  <path d="M2 10c4-8 10-8 14 0s10 8 14 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                  <circle cx="34" cy="10" r="1.6" fill="currentColor"></circle>
                </svg>
              </div>
            </div>

            <p class="mt-card-copy mt-4 text-sm">{{ exercise.purpose || exercise.description }}</p>

            <div *ngIf="exercise.expectedOutcome" class="exercise-note mt-5 p-4">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                  <app-icon name="heartbeat" className="text-base"></app-icon>
                </div>
                <div>
                  <div class="mt-card-kicker">What you get</div>
                  <div class="mt-card-copy mt-2 text-sm">{{ exercise.expectedOutcome }}</div>
                </div>
              </div>
            </div>

            <div *ngIf="exercise.tags?.length" class="mt-5 flex flex-wrap gap-2">
              <span *ngFor="let tag of exercise.tags!.slice(0, 4)" class="mt-chip">
                {{ tag }}
              </span>
            </div>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="mt-chip">
                <app-icon name="sparkles" className="text-xs"></app-icon>
                {{ exercise.difficulty || "easy" }}
              </div>
              <button
                type="button"
                (click)="emitStart($event)"
                class="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold sm:w-auto sm:min-w-[8rem]">
                Open
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `
  ]
})
export class ExerciseCardComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Input() transitionName = "";
  @Output() start = new EventEmitter<ExerciseCardStartEvent>();

  emitStart(event: Event): void {
    const target = event.currentTarget as HTMLElement | null;
    this.start.emit({
      exercise: this.exercise,
      source: target?.closest("article") ?? null,
      transitionName: this.transitionName
    });
  }

  categoryLabel(value: string): string {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return "Exercise";
    }

    return trimmed
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  iconForCategory(value: string): MindtrackIconName {
    const key = String(value || "").toLowerCase();

    if (key.includes("breath")) {
      return "spa";
    }

    if (key.includes("sleep")) {
      return "heartbeat";
    }

    if (key.includes("journal") || key.includes("reflect")) {
      return "brain";
    }

    if (key.includes("stress")) {
      return "activity";
    }

    return "exercises";
  }
}
