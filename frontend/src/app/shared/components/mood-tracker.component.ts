import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";

export interface MoodOption {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  emoji: string;
  hint: string;
  toneClass: string;
}

@Component({
  selector: "app-mood-tracker",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div *ngIf="showHeader" class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-900">Mood tracker</div>
          <div class="mt-1 text-xs leading-5 text-slate-500">Pick the closest match for right now. You can adjust later.</div>
        </div>
        <div class="hidden rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
          1 to 5
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-5">
        <button
          *ngFor="let opt of options"
          type="button"
          [disabled]="disabled"
          (click)="select(opt.value)"
          [attr.aria-pressed]="value === opt.value"
          class="group h-full min-h-[5.75rem] rounded-[1.35rem] border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[6.5rem]"
          [class.ring-4]="value === opt.value"
          [class.ring-sky-100]="value === opt.value">
          <div class="flex items-center justify-between gap-2">
            <div class="text-2xl leading-none">{{ opt.emoji }}</div>
            <div class="hidden h-2 w-2 rounded-full sm:block" [class]="opt.toneClass"></div>
          </div>
          <div class="mt-2 text-xs font-semibold text-slate-800">{{ opt.label }}</div>
          <div class="mt-1 text-[11px] leading-4 text-slate-500">{{ opt.hint }}</div>
        </button>
      </div>
    </div>
  `
})
export class MoodTrackerComponent {
  @Input() value: 1 | 2 | 3 | 4 | 5 = 3;
  @Input() disabled = false;
  @Input() showHeader = true;
  @Output() valueChange = new EventEmitter<1 | 2 | 3 | 4 | 5>();

  options: MoodOption[] = [
    { value: 5, label: "Happy", emoji: "\u{1F604}", hint: "Light, open, steady", toneClass: "bg-emerald-400" },
    { value: 4, label: "Calm", emoji: "\u{1F642}", hint: "Grounded, present", toneClass: "bg-emerald-300" },
    { value: 3, label: "Neutral", emoji: "\u{1F610}", hint: "Ok, in-between", toneClass: "bg-amber-400" },
    { value: 2, label: "Stressed", emoji: "\u{1F61F}", hint: "Tense, overloaded", toneClass: "bg-rose-400" },
    { value: 1, label: "Sad", emoji: "\u{1F622}", hint: "Low, heavy", toneClass: "bg-rose-500" }
  ];

  select(value: 1 | 2 | 3 | 4 | 5): void {
    this.valueChange.emit(value);
  }
}
