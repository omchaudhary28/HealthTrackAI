import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_45px_-30px_rgba(32,50,71,0.45)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_28px_55px_-35px_rgba(32,50,71,0.5)] active:scale-[0.99] sm:rounded-3xl sm:p-5">
      <div class="text-sm font-medium text-slate-500">{{ title }}</div>
      <div class="mt-3 text-2xl font-semibold text-slate-800 sm:text-3xl">{{ value }}</div>
      <div class="mt-2 text-sm text-slate-500">{{ context }}</div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = "";
  @Input() value = "";
  @Input() context = "";
}
