import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  baseClass: string;
  activeClass: string;
}

@Component({
  selector: "app-daily-insight-card",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./daily-insight-card.component.html",
  styleUrls: ["./daily-insight-card.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyInsightCardComponent implements OnInit, OnDestroy {
  moodOptions: MoodOption[] = [
    {
      id: "great",
      label: "Great",
      emoji: "\u{1F600}",
      baseClass: "bg-emerald-50 text-emerald-700",
      activeClass: "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300"
    },
    {
      id: "calm",
      label: "Calm",
      emoji: "\u{1F642}",
      baseClass: "bg-blue-50 text-blue-700",
      activeClass: "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
    },
    {
      id: "neutral",
      label: "Neutral",
      emoji: "\u{1F610}",
      baseClass: "bg-slate-50 text-slate-700",
      activeClass: "bg-slate-100 text-slate-800 ring-2 ring-slate-300"
    },
    {
      id: "stressed",
      label: "Stressed",
      emoji: "\u{1F61F}",
      baseClass: "bg-amber-50 text-amber-700",
      activeClass: "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
    },
    {
      id: "low",
      label: "Low",
      emoji: "\u{1F614}",
      baseClass: "bg-rose-50 text-rose-700",
      activeClass: "bg-rose-100 text-rose-800 ring-2 ring-rose-300"
    }
  ];

  private readonly insights = [
    "Small daily reflections can reduce overthinking.",
    "Five minutes of slow breathing can calm the nervous system.",
    "Writing down thoughts helps reduce rumination.",
    "Noticing one steady moment can soften stress spikes.",
    "Gentle routines beat perfect routines on hard days."
  ];

  selectedMood = signal<string>("neutral");
  insightIndex = signal(0);
  currentInsight = computed(() => this.insights[this.insightIndex()]);

  private intervalId: number | null = null;

  ngOnInit(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.intervalId = window.setInterval(() => {
      this.insightIndex.update((value) => (value + 1) % this.insights.length);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
  }

  selectMood(option: MoodOption): void {
    this.selectedMood.set(option.id);
  }

  buttonClass(option: MoodOption): string {
    return this.selectedMood() === option.id ? option.activeClass : option.baseClass;
  }
}
