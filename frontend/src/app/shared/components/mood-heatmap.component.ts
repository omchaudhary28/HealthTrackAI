import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from "@angular/core";

export interface MoodLogLite {
  date: string | Date;
  mood: number;
}

interface CalendarCell {
  key: string;
  dayLabel: string;
  inMonth: boolean;
  date: Date | null;
  mood?: number;
  isToday: boolean;
}

@Component({
  selector: "app-mood-heatmap",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Mood calendar</div>
          <div class="mt-1 text-sm text-slate-600">{{ monthLabel() }}</div>
        </div>
        <div class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <span class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            positive
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
            neutral
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1">
            <span class="h-2 w-2 rounded-full bg-rose-500"></span>
            stressed
          </span>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div *ngFor="let label of weekdayLabels" class="pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {{ label }}
        </div>

        <button
          *ngFor="let cell of cells()"
          type="button"
          [disabled]="!cell.inMonth"
          (click)="cell.date && selectDate.emit(cell.date)"
          class="relative grid aspect-square place-items-center rounded-2xl text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-60"
          [class]="tileClass(cell)"
          [attr.aria-label]="cell.inMonth ? cell.key : null">
          <span class="tabular-nums">{{ cell.dayLabel }}</span>
          <span *ngIf="cell.isToday" class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-slate-700/60"></span>
        </button>
      </div>

      <div class="mt-5 text-xs leading-6 text-slate-500">
        Tip: You can log a quick mood even on low-energy days. Consistency matters more than perfection.
      </div>
    </div>
  `
})
export class MoodHeatmapComponent {
  private readonly monthSig = signal<Date>(new Date());
  private readonly logsSig = signal<MoodLogLite[]>([]);

  @Input() set month(value: Date) {
    const raw = value instanceof Date ? value : new Date(value);
    this.monthSig.set(new Date(raw.getFullYear(), raw.getMonth(), 1));
  }

  @Input() set logs(value: MoodLogLite[]) {
    this.logsSig.set(Array.isArray(value) ? value : []);
  }

  @Output() selectDate = new EventEmitter<Date>();

  weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  private readonly todayKey = signal(dateKey(new Date()));

  monthLabel = computed(() => {
    const value = this.monthSig();
    const formatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
    return formatter.format(new Date(value.getFullYear(), value.getMonth(), 1));
  });

  cells = computed<CalendarCell[]>(() => {
    const month = new Date(this.monthSig().getFullYear(), this.monthSig().getMonth(), 1);
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const startOffset = month.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const moodByKey = new Map<string, number>();
    for (const item of this.logsSig()) {
      moodByKey.set(dateKey(item.date), item.mood);
    }

    const result: CalendarCell[] = [];
    for (let i = 0; i < startOffset; i += 1) {
      result.push({
        key: `empty-${i}`,
        dayLabel: "",
        inMonth: false,
        date: null,
        isToday: false
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
      result.push({
        key,
        dayLabel: String(day),
        inMonth: true,
        date: new Date(year, monthIndex, day),
        mood: moodByKey.get(key),
        isToday: key === this.todayKey()
      });
    }

    // Pad to full weeks (up to 6 rows).
    while (result.length % 7 !== 0) {
      result.push({
        key: `pad-${result.length}`,
        dayLabel: "",
        inMonth: false,
        date: null,
        isToday: false
      });
    }

    return result;
  });

  tileClass(cell: CalendarCell): string {
    if (!cell.inMonth) {
      return "bg-transparent text-slate-300 shadow-none hover:shadow-none hover:translate-y-0";
    }

    const mood = cell.mood;
    if (typeof mood !== "number") {
      return "bg-slate-50 text-slate-500 ring-1 ring-slate-200/70";
    }

    if (mood >= 4) {
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/70";
    }

    if (mood === 3) {
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-200/70";
    }

    return "bg-rose-100 text-rose-800 ring-1 ring-rose-200/70";
  }
}

function dateKey(value: string | Date): string {
  if (typeof value === "string") {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  return value.toISOString().slice(0, 10);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
