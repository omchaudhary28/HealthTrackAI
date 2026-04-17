import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IconComponent, MindtrackIconName } from "./icon.component";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="mt-card mt-card-hover mt-card-intro h-full p-5 sm:p-6">
      <div class="mt-card-head">
        <div class="mt-card-brand">
          <div class="mt-card-icon">
            <app-icon [name]="icon" className="text-lg"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">{{ title }}</div>
            <div *ngIf="badge" class="mt-chip mt-3">{{ badge }}</div>
          </div>
        </div>
      </div>

      <div class="mt-card-stat mt-6 text-slate-950">{{ value }}</div>
      <div class="mt-card-copy mt-3 text-sm">{{ context }}</div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = "";
  @Input() value = "";
  @Input() context = "";
  @Input() icon: MindtrackIconName = "dashboard";
  @Input() badge = "";
}
