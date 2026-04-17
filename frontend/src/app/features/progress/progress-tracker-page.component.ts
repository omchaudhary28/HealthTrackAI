import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { IconComponent } from "../../shared/components/icon.component";
import { ProgressChartComponent } from "../../shared/components/progress-chart.component";
import { StatCardComponent } from "../../shared/components/stat-card.component";

@Component({
  selector: "app-progress-tracker-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, IconComponent, ProgressChartComponent, StatCardComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="mt-card-brand max-w-3xl">
            <div class="mt-card-icon">
              <app-icon name="progress" className="text-xl"></app-icon>
            </div>
            <div>
              <div class="comic-subline text-slate-500">XP Board</div>
              <h1 class="comic-heading mt-3 text-3xl text-slate-900 sm:text-5xl">See your momentum.</h1>
              <p class="mt-card-copy mt-3 text-sm sm:text-base">
                Mood, stress, and habits in one quick read.
              </p>
            </div>
          </div>
          <div class="mt-chip">
            <app-icon name="analytics" className="text-sm"></app-icon>
            Live feed
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <app-stat-card
          title="Mood average"
          value="3.9 / 5"
          context="+0.6 from week one"
          icon="smile"
          badge="Mood"></app-stat-card>
        <app-stat-card
          title="Stress trend"
          value="-14%"
          context="Down since start"
          icon="heartbeat"
          badge="Recovery"></app-stat-card>
        <app-stat-card
          title="Mission completion"
          value="81%"
          context="Completed missions this month"
          icon="activity"
          badge="Consistency"></app-stat-card>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <app-progress-chart
          title="Stress trend"
          subtitle="Four-week change"
          [labels]="labels"
          [values]="stressValues"
          lineColor="#d8a47f"
          icon="pulse"></app-progress-chart>
        <app-progress-chart
          title="Mood trend"
          subtitle="Four-week change"
          [labels]="labels"
          [values]="moodValues"
          lineColor="#9fd7c9"
          icon="chart-line"></app-progress-chart>
      </div>
    </section>
  `
})
export class ProgressTrackerPageComponent {
  labels = ["W1", "W2", "W3", "W4", "W5", "W6"];
  stressValues = [74, 69, 66, 62, 60, 58];
  moodValues = [2.8, 3.1, 3.2, 3.5, 3.7, 3.9];
}
