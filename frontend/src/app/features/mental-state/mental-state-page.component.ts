import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Observable, catchError, of } from "rxjs";
import { AssessmentService, LatestAssessmentState } from "../../core/services/assessment.service";

@Component({
  selector: "app-mental-state-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule],
  template: `
    <section appScrollReveal class="space-y-6">
      <ng-container *ngIf="latest$ | async as latest">
        <div class="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(216,214,239,0.45),rgba(255,255,255,0.9))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)]">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Know your mental state</div>
          <div class="mt-3 inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700">
            Mental state: {{ latest.mentalState?.mentalState || "Unknown" }}
          </div>
          <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
            {{ latest.mentalState?.description || fallbackDescription }}
          </p>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
            <div class="text-sm font-medium text-slate-500">What this state usually looks like</div>
            <ul class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li *ngFor="let signal of signals" class="rounded-2xl bg-slate-50 px-4 py-3">{{ signal }}</li>
            </ul>
          </div>
          <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
            <div class="text-sm font-medium text-slate-500">Recommended improvements</div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let item of (latest.mentalState?.recommendations?.length ? latest.mentalState.recommendations : fallbackRecommendations)" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
          MindTrack AI provides wellness support and self-reflection tools only. It does not diagnose medical conditions.
        </div>
      </ng-container>
    </section>
  `
})
export class MentalStatePageComponent {
  latest$: Observable<LatestAssessmentState>;

  fallbackDescription =
    "Patterns can shift with stress, sleep, social load, and recovery. MindTrack AI highlights trends to support reflection, not diagnosis.";

  signals = [
    "Replay of conversations long after they happen",
    "Difficulty closing open mental loops before sleep",
    "Need to analyze uncertainty before feeling settled"
  ];

  fallbackRecommendations = [
    "5 minute breathing reset",
    "Evening gratitude journal",
    "Thought reframing loop"
  ];

  constructor(private readonly assessmentService: AssessmentService) {
    this.latest$ = this.assessmentService.getLatest().pipe(
      catchError(() =>
        of({
          mentalState: null,
          latestBaseline: null
        })
      )
    );
  }
}


