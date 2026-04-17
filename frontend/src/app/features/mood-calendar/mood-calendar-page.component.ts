import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MoodLog, MoodService } from "../../core/services/mood.service";
import { IconComponent } from "../../shared/components/icon.component";
import { MoodHeatmapComponent } from "../../shared/components/mood-heatmap.component";
import { MoodTrackerComponent } from "../../shared/components/mood-tracker.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-mood-calendar-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, MoodHeatmapComponent, MoodTrackerComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="mt-card-brand max-w-3xl">
          <div class="mt-card-icon">
            <app-icon name="mood" className="text-xl"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">Mood Calendar</div>
            <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">See the bigger vibe.</h1>
            <p class="mt-card-copy mt-3 text-sm sm:text-base">
              Quick logs add up. One tap a day is enough to turn mood, stress, and energy into a clearer trend.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="mt-chip"><app-icon name="smile" className="text-xs"></app-icon> Mood</span>
              <span class="mt-chip"><app-icon name="heart" className="text-xs"></app-icon> Energy</span>
              <span class="mt-chip"><app-icon name="brain" className="text-xs"></app-icon> Reflection</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="mt-card-brand">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                <app-icon name="calendar" className="text-base"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Month view</div>
                <div class="mt-card-copy text-sm">Your recent emotional rhythm at a glance.</div>
              </div>
            </div>
            <div class="chip-scroll">
              <button
                type="button"
                (click)="prevMonth()"
                class="btn-outline inline-flex h-10 w-10 items-center justify-center rounded-2xl"
                aria-label="Previous month">
                <app-icon name="arrow" className="text-sm rotate-180"></app-icon>
              </button>
              <button type="button" (click)="goToday()" class="btn-outline rounded-2xl px-4 py-2 text-sm font-semibold">
                Today
              </button>
              <button
                type="button"
                (click)="nextMonth()"
                class="btn-outline inline-flex h-10 w-10 items-center justify-center rounded-2xl"
                aria-label="Next month">
                <app-icon name="arrow" className="text-sm"></app-icon>
              </button>
            </div>
          </div>

          <app-mood-heatmap [month]="month()" [logs]="logs()" (selectDate)="selectDate($event)"></app-mood-heatmap>
        </div>

        <div class="mt-card mt-card-hover p-5 sm:p-6">
          <div class="mt-card-head">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="heart" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Daily check-in</div>
                <div class="mt-card-copy mt-2 text-sm">{{ selectedLabel() }}</div>
              </div>
            </div>
            <div *ngIf="saved()" class="mt-chip">Saved</div>
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
                placeholder="Anything worth remembering?"
                class="app-textarea mt-2"></textarea>
            </label>
          </div>

          <div *ngIf="error()" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error() }}
          </div>

          <button
            type="button"
            (click)="save()"
            [disabled]="saving()"
            class="btn-primary mt-5 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
            {{ saving() ? "Saving..." : "Save check-in" }}
          </button>

          <div class="mt-card-soft mt-4 p-4 text-sm leading-7 text-slate-600">
            This tracks trends. It is not a diagnosis.
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
    date.setHours(12, 0, 0, 0);

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
          this.error.set(err?.error?.error || "Couldn't save that check-in.");
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
