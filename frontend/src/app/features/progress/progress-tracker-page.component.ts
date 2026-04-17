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
              <div class="mt-card-kicker">Progress Tracker</div>
              <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">See how mood, stress, and routines move together over time.</h1>
              <p class="mt-card-copy mt-3 text-sm sm:text-base">
                Your trends stay easy to scan on mobile and expand into a richer side-by-side analytics view on larger screens.
              </p>
            </div>
          </div>
          <div class="mt-chip">
            <app-icon name="analytics" className="text-sm"></app-icon>
            Live signals
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <app-stat-card
          title="Weekly mood average"
          value="3.9 / 5"
          context="Up 0.6 from the first week"
          icon="smile"
          badge="Mood"></app-stat-card>
        <app-stat-card
          title="Stress trend"
          value="-14%"
          context="Down from early onboarding"
          icon="heartbeat"
          badge="Recovery"></app-stat-card>
        <app-stat-card
          title="Routine adherence"
          value="81%"
          context="Exercise completion across the last month"
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
