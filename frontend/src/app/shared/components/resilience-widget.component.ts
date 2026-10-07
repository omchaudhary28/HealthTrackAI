import { CommonModule } from "@angular/common";
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { IconComponent } from "./icon.component";

@Component({
  selector: "app-resilience-widget",
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-card mt-card-hover p-5 sm:p-6 w-full box-border">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="mt-card-brand">
          <div class="mt-card-icon h-12 w-12 rounded-[1rem]">
            <app-icon name="heartbeat" className="text-xl icon-bounce-soft"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker text-xs uppercase tracking-widest text-slate-500 font-semibold">Resilience Score</div>
            <div class="mt-1 flex items-end gap-2">
              <span class="text-3xl font-bold text-slate-900">{{ score }}</span>
              <span class="text-sm font-medium text-slate-500 mb-1">/ 100</span>
            </div>
            <p class="mt-card-copy mt-2 text-sm max-w-sm">{{ description }}</p>
          </div>
        </div>

        <div class="relative w-full sm:w-48 h-3 bg-slate-100 rounded-full overflow-hidden mt-4 sm:mt-0">
          <div 
            class="absolute top-0 left-0 h-full bg-gradient-to-r transition-all duration-700 ease-out rounded-full"
            [ngClass]="colorClass"
            [style.width.%]="score">
          </div>
        </div>
      </div>
      
      <div class="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stress Load</div>
          <div class="mt-1 text-sm font-medium text-slate-800">{{ stressLoad }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovery Capacity</div>
          <div class="mt-1 text-sm font-medium text-slate-800">{{ recoveryCapacity }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class ResilienceWidgetComponent {
  @Input() score: number = 72;
  @Input() description: string = "Your ability to bounce back is solid. Keep up the good work.";
  @Input() stressLoad: string = "Moderate";
  @Input() recoveryCapacity: string = "High";

  get colorClass(): string {
    if (this.score >= 75) return "from-emerald-400 to-emerald-500";
    if (this.score >= 50) return "from-blue-400 to-blue-500";
    return "from-amber-400 to-amber-500";
  }
}

