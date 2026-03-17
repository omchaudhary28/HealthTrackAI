import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import Chart from "chart.js/auto";

@Component({
  selector: "app-progress-chart",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-slate-500">{{ title }}</div>
          <div class="text-lg font-semibold text-slate-800">{{ subtitle }}</div>
        </div>
      </div>
      <canvas #canvas></canvas>
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

  private chart?: Chart;

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
    if (!this.canvas) {
      return;
    }

    this.chart?.destroy();
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
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(148, 163, 184, 0.16)" }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    this.canvas.nativeElement.parentElement!.style.height = "280px";
  }
}
