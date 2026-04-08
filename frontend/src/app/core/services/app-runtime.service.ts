import { Injectable, signal } from "@angular/core";
import { markBootstrapReady, normalizeErrorMessage, shouldIgnoreRuntimeError, showBootstrapError } from "../bootstrap/bootstrap-ui";

export interface RuntimeIssue {
  title: string;
  message: string;
  context: string;
  timestamp: number;
}

@Injectable({ providedIn: "root" })
export class AppRuntimeService {
  readonly runtimeIssue = signal<RuntimeIssue | null>(null);

  private appReady = false;

  markReady(): void {
    if (this.appReady) {
      return;
    }

    this.appReady = true;
    markBootstrapReady();
  }

  reportError(error: unknown, context = "runtime"): void {
    if (shouldIgnoreRuntimeError(error)) {
      return;
    }

    const message = normalizeErrorMessage(error);

    console.error(`[MindTrack] ${context}`, error);

    if (!this.appReady) {
      showBootstrapError(message);
      return;
    }

    this.runtimeIssue.set({
      title: "Something Went Wrong",
      message,
      context,
      timestamp: Date.now()
    });
  }

  clearError(): void {
    this.runtimeIssue.set(null);
  }

  reload(): void {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }
}
