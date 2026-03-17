import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from "@angular/core";

type PhaseKey = "inhale" | "hold" | "exhale";

interface BreathingPhase {
  key: PhaseKey;
  label: string;
  instruction: string;
  scaleClass: string;
}

const PHASE_SECONDS = 4;
const PHASES: BreathingPhase[] = [
  { key: "inhale", label: "Inhale", instruction: "Inhale slowly", scaleClass: "scale-125" },
  { key: "hold", label: "Hold", instruction: "Hold your breath", scaleClass: "scale-125" },
  { key: "exhale", label: "Exhale", instruction: "Exhale gently", scaleClass: "scale-75" },
  { key: "hold", label: "Hold", instruction: "Hold your breath", scaleClass: "scale-75" }
];

@Component({
  selector: "app-box-breathing",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./box-breathing.component.html",
  styleUrls: ["./box-breathing.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoxBreathingComponent implements OnDestroy {
  readonly durationOptions = [1, 3, 5];

  private intervalId: number | null = null;

  running = signal(false);
  elapsedSeconds = signal(0);
  phaseIndex = signal(0);
  phaseRemaining = signal(PHASE_SECONDS);
  durationMinutes = signal(1);
  shapeScaleClass = signal("scale-75");

  currentPhase = computed(() => PHASES[this.phaseIndex()]);
  phaseLabel = computed(() => this.currentPhase().label);
  instruction = computed(() => this.currentPhase().instruction);
  durationSeconds = computed(() => this.durationMinutes() * 60);
  remainingSeconds = computed(() => Math.max(this.durationSeconds() - this.elapsedSeconds(), 0));
  isComplete = computed(() => this.elapsedSeconds() >= this.durationSeconds());

  ngOnDestroy(): void {
    this.clearTimer();
  }

  start(): void {
    if (this.running()) {
      return;
    }

    if (this.isComplete()) {
      this.reset();
    }

    this.running.set(true);
    if (this.elapsedSeconds() === 0) {
      this.shapeScaleClass.set(PHASES[0].scaleClass);
    }
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  pause(): void {
    if (!this.running()) {
      return;
    }

    this.clearTimer();
    this.running.set(false);
  }

  reset(): void {
    this.clearTimer();
    this.running.set(false);
    this.elapsedSeconds.set(0);
    this.phaseIndex.set(0);
    this.phaseRemaining.set(PHASE_SECONDS);
    this.shapeScaleClass.set("scale-75");
  }

  selectDuration(minutes: number): void {
    if (this.running()) {
      return;
    }

    this.durationMinutes.set(minutes);
    this.reset();
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  private tick(): void {
    const nextElapsed = this.elapsedSeconds() + 1;
    this.elapsedSeconds.set(nextElapsed);

    if (nextElapsed >= this.durationSeconds()) {
      this.complete();
      return;
    }

    const nextPhaseRemaining = this.phaseRemaining() - 1;
    if (nextPhaseRemaining <= 0) {
      this.advancePhase();
      return;
    }

    this.phaseRemaining.set(nextPhaseRemaining);
  }

  private advancePhase(): void {
    const nextIndex = (this.phaseIndex() + 1) % PHASES.length;
    this.phaseIndex.set(nextIndex);
    this.phaseRemaining.set(PHASE_SECONDS);
    this.shapeScaleClass.set(PHASES[nextIndex].scaleClass);
  }

  private complete(): void {
    this.clearTimer();
    this.running.set(false);
    this.phaseRemaining.set(0);
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
