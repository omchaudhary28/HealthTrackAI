import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "./icon.component";

@Component({
  selector: "app-daily-intention",
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-card mt-card-hover p-5 sm:p-6 w-full box-border">
      <div class="mt-card-brand mb-4">
        <div class="mt-card-icon h-10 w-10 rounded-[0.85rem]">
          <app-icon name="target" className="text-lg"></app-icon>
        </div>
        <div>
          <div class="mt-card-kicker text-xs uppercase tracking-widest text-slate-500 font-semibold">Daily Intention</div>
          <div class="mt-1 text-sm text-slate-700">Set a small, actionable focus for today.</div>
        </div>
      </div>
      
      <div *ngIf="!saved()" class="mt-4 flex gap-3">
        <input 
          type="text" 
          [(ngModel)]="intention" 
          placeholder="I will focus on..." 
          class="app-field w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--mt-accent)] transition-colors"
          (keyup.enter)="saveIntention()"
        />
        <button 
          (click)="saveIntention()" 
          [disabled]="!intention()"
          class="btn-primary shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-50 transition-opacity">
          Set
        </button>
      </div>

      <div *ngIf="saved()" class="mt-4 mt-card-soft p-4 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50">
        <div class="flex items-center gap-3 min-w-0">
          <div class="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <app-icon name="check" className="text-sm"></app-icon>
          </div>
          <span class="text-sm font-medium text-emerald-900 truncate">{{ intention() }}</span>
        </div>
        <button (click)="resetIntention()" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0 ml-4">
          Clear
        </button>
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
export class DailyIntentionComponent {
  intention = signal<string>("");
  saved = signal<boolean>(false);

  saveIntention() {
    if (this.intention().trim()) {
      this.saved.set(true);
    }
  }

  resetIntention() {
    this.intention.set("");
    this.saved.set(false);
  }
}

