import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { MoodLog, MoodService } from "../../core/services/mood.service";
import { MoodHeatmapComponent } from "../../shared/components/mood-heatmap.component";
import { MoodTrackerComponent } from "../../shared/components/mood-tracker.component";

@Component({
  selector: "app-mood-calendar-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, MoodHeatmapComponent, MoodTrackerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-3xl border border-white/70 bg-[linear-gradient(145deg,rgba(216,214,239,0.22),rgba(255,255,255,0.86))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.45)]">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Mood calendar</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">See patterns across days, not just moments.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          Log quick check-ins to build a calmer, more accurate picture over time. MindTrack AI is for self-reflection only.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm font-semibold text-slate-900">Month view</div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="prevMonth()"
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Previous month">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>
              <button
                type="button"
                (click)="goToday()"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Today
              </button>
              <button
                type="button"
                (click)="nextMonth()"
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Next month">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>
          </div>

          <app-mood-heatmap [month]="month()" [logs]="logs()" (selectDate)="selectDate($event)"></app-mood-heatmap>
        </div>

        <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">Daily check-in</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">{{ selectedLabel() }}</div>
            </div>
            <div *ngIf="saved()" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</div>
          </div>

          <div class="mt-4">
            <app-mood-tracker [showHeader]="false" [value]="mood()" (valueChange)="mood.set($event)"></app-mood-tracker>
          </div>

          <div class="mt-5 space-y-4">
            <label class="block text-sm font-semibold text-slate-800">
              Stress level
              <div class="mt-2 flex items-center gap-3">
                <input [ngModel]="stressLevel()" (ngModelChange)="stressLevel.set($event)" type="range" min="0" max="100" class="w-full" />
                <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ stressLevel() }}</div>
              </div>
            </label>

            <label class="block text-sm font-semibold text-slate-800">
              Sleep quality
              <div class="mt-2 flex items-center gap-3">
                <input [ngModel]="sleepQuality()" (ngModelChange)="sleepQuality.set($event)" type="range" min="1" max="5" class="w-full" />
                <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ sleepQuality() }}/5</div>
              </div>
            </label>

            <label class="block text-sm font-semibold text-slate-800">
              Energy level
              <div class="mt-2 flex items-center gap-3">
                <input [ngModel]="energyLevel()" (ngModelChange)="energyLevel.set($event)" type="range" min="1" max="5" class="w-full" />
                <div class="w-12 text-right text-sm font-semibold text-slate-700 tabular-nums">{{ energyLevel() }}/5</div>
              </div>
            </label>

            <label class="block text-sm font-semibold text-slate-800">
              Notes (optional)
              <textarea
                [ngModel]="notes()"
                (ngModelChange)="notes.set($event)"
                rows="3"
                placeholder="Any context you want to remember later..."
                class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"></textarea>
            </label>
          </div>

          <div *ngIf="error()" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error() }}
          </div>

          <button
            type="button"
            (click)="save()"
            [disabled]="saving()"
            class="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
            {{ saving() ? "Saving..." : "Save check-in" }}
          </button>

          <div class="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            This helps track trends. It does not diagnose or treat mental health conditions.
          </div>
        </div>
      </div>
    </section>
  `
})
export class MoodCalendarPageComponent {
  readonly logs = signal<MoodLog[]>([]);

  readonly month = signal<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly selectedDate = signal<Date>(new Date());

  readonly mood = signal<1 | 2 | 3 | 4 | 5>(3);
  readonly stressLevel = signal(55);
  readonly sleepQuality = signal<1 | 2 | 3 | 4 | 5>(3);
  readonly energyLevel = signal<1 | 2 | 3 | 4 | 5>(3);
  readonly notes = signal("");

  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal("");

  readonly selectedLabel = computed(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
    return formatter.format(this.selectedDate());
  });

  private readonly logByKey = computed(() => {
    const map = new Map<string, MoodLog>();
    for (const item of this.logs()) {
      map.set(dateKey(item.date), item);
    }
    return map;
  });

  constructor(private readonly moodService: MoodService) {
    this.reload();
    this.prefill(this.selectedDate());
  }

  prevMonth(): void {
    const current = this.month();
    this.month.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.month();
    this.month.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToday(): void {
    const today = new Date();
    this.month.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectDate(today);
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    this.saved.set(false);
    this.prefill(date);
  }

  save(): void {
    if (this.saving()) {
      return;
    }

    this.error.set("");
    this.saved.set(false);
    this.saving.set(true);

    const date = new Date(this.selectedDate());
    date.setHours(12, 0, 0, 0); // avoid edge-case midnight TZ shifts when serializing

    this.moodService
      .upsert({
        date: date.toISOString(),
        mood: this.mood(),
        stressLevel: Number(this.stressLevel()),
        sleepQuality: this.sleepQuality(),
        energyLevel: this.energyLevel(),
        notes: this.notes().trim() || undefined
      })
      .subscribe({
        next: (item) => {
          const key = dateKey(item.date);
          const next = this.logs().filter((log) => dateKey(log.date) !== key);
          this.logs.set([item, ...next]);
          this.saved.set(true);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error || "Unable to save your check-in right now.");
          this.saving.set(false);
        }
      });
  }

  private reload(): void {
    this.moodService.list().subscribe({
      next: (items) => {
        this.logs.set(items);
        this.prefill(this.selectedDate());
      },
      error: () => this.logs.set([])
    });
  }

  private prefill(date: Date): void {
    const log = this.logByKey().get(dateKey(date));
    if (!log) {
      this.mood.set(3);
      this.stressLevel.set(55);
      this.sleepQuality.set(3);
      this.energyLevel.set(3);
      this.notes.set("");
      return;
    }

    this.mood.set(log.mood);
    this.stressLevel.set(log.stressLevel);
    this.sleepQuality.set(log.sleepQuality);
    this.energyLevel.set(log.energyLevel);
    this.notes.set(log.notes || "");
  }
}

function dateKey(value: string | Date): string {
  if (typeof value === "string") {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  return value.toISOString().slice(0, 10);
}


