import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent, MindtrackIconName } from "./icon.component";

export interface MoodOption {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  icon: MindtrackIconName;
  hint: string;
  toneClass: string;
  surfaceClass: string;
  selectedClass: string;
}

@Component({
  selector: "app-mood-tracker",
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div *ngIf="showHeader" class="flex items-start justify-between gap-3">
        <div class="mt-card-brand">
          <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
            <app-icon name="mood" className="text-base"></app-icon>
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900">Mood tracker</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">Pick the vibe right now. You can tweak it later.</div>
          </div>
        </div>
        <div class="hidden rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.3)] sm:inline-flex">
          1 to 5
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-5">
        <button
          *ngFor="let opt of options"
          type="button"
          [disabled]="disabled"
          (click)="select(opt.value)"
          [attr.aria-pressed]="value === opt.value"
          class="mt-card-soft mt-card-hover h-full min-h-[6rem] rounded-[1.4rem] px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[6.75rem]"
          [ngClass]="value === opt.value ? opt.selectedClass : 'border-white/70 bg-white/86'">
          <div class="flex items-start justify-between gap-3">
            <div class="mt-card-brand gap-3">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]" [ngClass]="opt.surfaceClass">
                <app-icon [name]="opt.icon" className="text-base"></app-icon>
              </div>
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Level {{ opt.value }}</div>
                <div class="mt-2 text-sm font-semibold text-slate-900">{{ opt.label }}</div>
              </div>
            </div>
            <div class="hidden h-2.5 w-2.5 rounded-full sm:block" [class]="opt.toneClass"></div>
          </div>
          <div class="mt-3 text-[11px] leading-5 text-slate-500">{{ opt.hint }}</div>
          <div class="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]" [ngClass]="value === opt.value ? 'text-slate-900' : 'text-slate-400'">
            {{ value === opt.value ? "Selected" : "Tap to choose" }}
          </div>
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
    {
      value: 5,
      label: "Bright",
      icon: "sparkles",
      hint: "Light, good, steady",
      toneClass: "bg-emerald-400",
      surfaceClass: "text-emerald-700",
      selectedClass: "border-emerald-200 bg-white/96 shadow-[0_28px_56px_-36px_rgba(5,150,105,0.4)]"
    },
    {
      value: 4,
      label: "Chill",
      icon: "spa",
      hint: "Grounded, okay",
      toneClass: "bg-emerald-300",
      surfaceClass: "text-teal-700",
      selectedClass: "border-teal-200 bg-white/96 shadow-[0_28px_56px_-36px_rgba(13,148,136,0.36)]"
    },
    {
      value: 3,
      label: "Mid",
      icon: "mood",
      hint: "In-between",
      toneClass: "bg-amber-400",
      surfaceClass: "text-amber-700",
      selectedClass: "border-amber-200 bg-white/96 shadow-[0_28px_56px_-36px_rgba(217,119,6,0.34)]"
    },
    {
      value: 2,
      label: "Tense",
      icon: "pulse",
      hint: "A bit fried",
      toneClass: "bg-rose-400",
      surfaceClass: "text-rose-700",
      selectedClass: "border-rose-200 bg-white/96 shadow-[0_28px_56px_-36px_rgba(225,29,72,0.34)]"
    },
    {
      value: 1,
      label: "Low",
      icon: "shield",
      hint: "Heavy day",
      toneClass: "bg-rose-500",
      surfaceClass: "text-fuchsia-700",
      selectedClass: "border-fuchsia-200 bg-white/96 shadow-[0_28px_56px_-36px_rgba(192,38,211,0.34)]"
    }
  ];

  select(value: 1 | 2 | 3 | 4 | 5): void {
    this.valueChange.emit(value);
  }
}
