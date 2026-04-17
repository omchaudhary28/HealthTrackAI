import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent, MindtrackIconName } from "./icon.component";

interface MoodOption {
  id: string;
  label: string;
  icon: MindtrackIconName;
  baseClass: string;
  activeClass: string;
}

@Component({
  selector: "app-daily-insight-card",
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: "./daily-insight-card.component.html",
  styleUrls: ["./daily-insight-card.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyInsightCardComponent implements OnInit, OnDestroy {
  moodOptions: MoodOption[] = [
    {
      id: "great",
      label: "Clear",
      icon: "sparkles",
      baseClass: "border-emerald-100 bg-white/82 text-emerald-700",
      activeClass: "border-emerald-200 bg-white/96 text-emerald-800 shadow-[0_24px_50px_-34px_rgba(5,150,105,0.34)]"
    },
    {
      id: "calm",
      label: "Calm",
      icon: "spa",
      baseClass: "border-sky-100 bg-white/82 text-sky-700",
      activeClass: "border-sky-200 bg-white/96 text-sky-800 shadow-[0_24px_50px_-34px_rgba(2,132,199,0.34)]"
    },
    {
      id: "neutral",
      label: "Steady",
      icon: "mood",
      baseClass: "border-slate-100 bg-white/82 text-slate-700",
      activeClass: "border-slate-200 bg-white/96 text-slate-800 shadow-[0_24px_50px_-34px_rgba(71,85,105,0.3)]"
    },
    {
      id: "stressed",
      label: "Busy",
      icon: "pulse",
      baseClass: "border-amber-100 bg-white/82 text-amber-700",
      activeClass: "border-amber-200 bg-white/96 text-amber-800 shadow-[0_24px_50px_-34px_rgba(217,119,6,0.3)]"
    },
    {
      id: "low",
      label: "Low",
      icon: "shield",
      baseClass: "border-fuchsia-100 bg-white/82 text-fuchsia-700",
      activeClass: "border-fuchsia-200 bg-white/96 text-fuchsia-800 shadow-[0_24px_50px_-34px_rgba(192,38,211,0.32)]"
    }
  ];

  private readonly insights = [
    "\"Tiny wins still win.\"",
    "Keep it chill. One slow breath counts.",
    "Low energy? One line in the journal is enough.",
    "One steady moment can cut the spiral.",
    "Gentle routines beat perfect ones."
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
