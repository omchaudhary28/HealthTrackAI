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
    <section appScrollReveal class="page-stack">
      <ng-container *ngIf="latest$ | async as latest">
        <div class="page-hero rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(216,214,239,0.45),rgba(255,255,255,0.9))] shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)] sm:rounded-[2.5rem]">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Know your mental state</div>
          <div class="mt-3 inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700">
            Mental state: {{ latest.mentalState?.mentalState || "Unknown" }}
          </div>
          <p class="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
            {{ latest.mentalState?.description || fallbackDescription }}
          </p>
          <div *ngIf="latest.suggestedAction" class="mt-5 rounded-3xl bg-white/80 px-5 py-4 text-sm leading-7 text-slate-700">
            Next move: <span class="font-semibold text-slate-900">{{ latest.suggestedAction?.title }}</span>
            <div class="mt-2 text-slate-600">{{ latest.suggestedAction?.whyRecommended }}</div>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div class="text-sm font-medium text-slate-500">Common signs</div>
            <ul class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li *ngFor="let signal of signals" class="rounded-2xl bg-slate-50 px-4 py-3">{{ signal }}</li>
            </ul>
          </div>
          <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div class="text-sm font-medium text-slate-500">Try next</div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let item of (latest.mentalState?.recommendations?.length ? latest.mentalState.recommendations : fallbackRecommendations)" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
          MindTrack gives wellness support only. Not a diagnosis.
        </div>
      </ng-container>
    </section>
  `
})
export class MentalStatePageComponent {
  latest$: Observable<LatestAssessmentState>;

  fallbackDescription =
    "Patterns shift with stress, sleep, and recovery. This page is a guide, not a diagnosis.";

  signals = [
    "Replaying conversations later",
    "Hard to switch off before sleep",
    "Needing to figure it all out first"
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


