import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import Chart from "chart.js/auto";
import { IconComponent, MindtrackIconName } from "./icon.component";

@Component({
  selector: "app-progress-chart",
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="mt-card mt-card-hover h-full p-5 sm:p-6">
      <div class="mt-card-head">
        <div class="mt-card-brand">
          <div class="mt-card-icon">
            <app-icon [name]="icon" className="text-lg"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">{{ title }}</div>
            <div class="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{{ subtitle }}</div>
          </div>
        </div>
        <div *ngIf="latestValueText" class="mt-chip">{{ latestValueText }}</div>
      </div>

      <div class="relative mt-5 h-[220px] sm:h-[260px] lg:h-[280px]">
        <canvas #canvas class="h-full w-full" [class.hidden]="!hasTrendData"></canvas>

        <div *ngIf="!hasTrendData" class="mt-card-soft flex h-full flex-col justify-between p-5">
          <div>
            <div class="mt-card-kicker">{{ emptyEyebrow }}</div>
            <div class="mt-2 text-xl font-semibold text-slate-900">{{ emptyHeadline }}</div>
            <div class="mt-card-copy mt-2 text-sm">{{ emptyBody }}</div>
          </div>

          <div *ngIf="latestValueText; else noData" class="flex items-end justify-between gap-4">
            <div>
              <div class="mt-card-kicker">Latest entry</div>
              <div class="mt-card-stat mt-2 text-slate-950">{{ latestValueText }}</div>
            </div>
            <div class="mt-chip">{{ latestLabel || "Most recent" }}</div>
          </div>

          <ng-template #noData>
            <div class="mt-chip">Waiting for your first entry</div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ProgressChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("canvas") canvas?: ElementRef<HTMLCanvasElement>;
  @Input() title = "Progress";
  @Input() subtitle = "Recent trend";
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() lineColor = "#8eb8d7";
  @Input() icon: MindtrackIconName = "chart-line";

  private chart?: Chart;
  hasTrendData = false;
  latestLabel = "";
  latestValueText = "";
  emptyEyebrow = "Chart status";
  emptyHeadline = "No chart data yet";
  emptyBody = "Complete a few check-ins or exercises to unlock this trend view.";

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    this.prepareSeries();

    if (!this.canvas) {
      return;
    }

    this.chart?.destroy();
    this.chart = undefined;

    if (!this.hasTrendData) {
      return;
    }

    const { min, max } = buildScaleBounds(this.values);
    const reducedAnimation =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    this.chart = new Chart(this.canvas.nativeElement, {
      type: "line",
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.values,
            borderColor: this.lineColor,
            backgroundColor: `${this.lineColor}33`,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBorderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: this.lineColor,
            borderWidth: 3
          }
        ]
      },
      options: {
        animation: {
          duration: reducedAnimation ? 0 : 420
        },
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index"
        },
        scales: {
          y: {
            beginAtZero: min === 0,
            suggestedMin: min,
            suggestedMax: max,
            ticks: {
              color: "rgba(71, 85, 105, 0.9)",
              maxTicksLimit: 6
            },
            grid: { color: "rgba(148, 163, 184, 0.16)" }
          },
          x: {
            ticks: {
              color: "rgba(100, 116, 139, 0.92)",
              maxRotation: 0
            },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            padding: 12
          }
        }
      }
    });
  }

  private prepareSeries(): void {
    const points = sanitizeSeries(this.labels, this.values);
    const latestPoint = points.at(-1);

    this.labels = points.map((item) => item.label);
    this.values = points.map((item) => item.value);
    this.latestLabel = latestPoint?.label || "";
    this.latestValueText = latestPoint ? formatTrendValue(latestPoint.value) : "";
    this.hasTrendData = points.length >= 2;

    if (points.length >= 2) {
      return;
    }

    if (points.length === 1) {
      this.emptyEyebrow = "Trend warming up";
      this.emptyHeadline = "One more entry will unlock the chart";
      this.emptyBody = "Your latest data point is saved. Add another check-in to turn this into a visible trend instead of a single snapshot.";
      return;
    }

    this.emptyEyebrow = "Chart status";
    this.emptyHeadline = "No chart data yet";
    this.emptyBody = "Complete a mood check-in, baseline test, or exercise session and this area will turn into a live trend chart.";
  }
}

function sanitizeSeries(labels: string[] = [], values: number[] = []): Array<{ label: string; value: number }> {
  const limit = Math.max(labels.length, values.length);
  const points: Array<{ label: string; value: number }> = [];

  for (let index = 0; index < limit; index += 1) {
    const numericValue = Number(values[index]);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    const rawLabel = String(labels[index] ?? "").trim();
    points.push({
      label: rawLabel || `Point ${points.length + 1}`,
      value: numericValue
    });
  }

  return points;
}

function buildScaleBounds(values: number[]): { min: number; max: number } {
  const cleaned = values.map(Number).filter(Number.isFinite);
  if (!cleaned.length) {
    return { min: 0, max: 5 };
  }

  const minValue = Math.min(...cleaned);
  const maxValue = Math.max(...cleaned);
  const range = maxValue - minValue;
  const padding = range === 0 ? Math.max(1, Math.abs(maxValue) * 0.15) : Math.max(0.5, range * 0.2);

  return {
    min: Math.max(0, roundForScale(minValue - padding)),
    max: roundForScale(maxValue + padding)
  };
}

function roundForScale(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatTrendValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
