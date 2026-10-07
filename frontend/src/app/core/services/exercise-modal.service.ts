import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { Exercise } from "./exercises.service";

@Injectable({ providedIn: "root" })
export class ExerciseModalService {
  readonly selectedExercise = signal<Exercise | null>(null);
  readonly isOpen = signal(false);
  readonly transitionName = signal<string | null>(null);

  private readonly completionSubject = new Subject<void>();
  readonly completed$ = this.completionSubject.asObservable();

  open(exercise: Exercise, transitionName: string | null = null): void {
    this.selectedExercise.set(exercise);
    this.transitionName.set(transitionName);
    this.isOpen.set(true);
    this.lockBodyScroll(true);
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    this.selectedExercise.set(null);
    this.transitionName.set(null);
    this.lockBodyScroll(false);
  }

  notifyCompleted(): void {
    this.completionSubject.next();
  }

  private lockBodyScroll(shouldLock: boolean): void {
    if (typeof document === "undefined") {
      return;
    }

    document.body.style.overflow = shouldLock ? "hidden" : "";
    document.documentElement.style.overflow = shouldLock ? "hidden" : "";
  }
}
