import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { ProgressChartComponent } from "../../shared/components/progress-chart.component";
import { StatCardComponent } from "../../shared/components/stat-card.component";

@Component({
  selector: "app-progress-tracker-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, ProgressChartComponent, StatCardComponent],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-[2.5rem] border border-white/70 bg-white/80 p-7 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)] backdrop-blur">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Progress tracker</div>
        <h1 class="mt-2 text-3xl font-semibold text-slate-900">See how mood, stress, and routines move together over time.</h1>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <app-stat-card title="Weekly mood average" value="3.9 / 5" context="Up 0.6 from the first week"></app-stat-card>
        <app-stat-card title="Stress trend" value="-14%" context="Down from early onboarding"></app-stat-card>
        <app-stat-card title="Routine adherence" value="81%" context="Exercise completion across the last month"></app-stat-card>
      </div>
      <div class="grid gap-6 xl:grid-cols-2">
        <app-progress-chart title="Stress trend" subtitle="Four-week change" [labels]="labels" [values]="stressValues" lineColor="#d8a47f"></app-progress-chart>
        <app-progress-chart title="Mood trend" subtitle="Four-week change" [labels]="labels" [values]="moodValues" lineColor="#9fd7c9"></app-progress-chart>
      </div>
    </section>
  `
})
export class ProgressTrackerPageComponent {
  labels = ["W1", "W2", "W3", "W4", "W5", "W6"];
  stressValues = [74, 69, 66, 62, 60, 58];
  moodValues = [2.8, 3.1, 3.2, 3.5, 3.7, 3.9];
}


