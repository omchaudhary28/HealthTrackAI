import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Observable, catchError, of } from "rxjs";
import { AssessmentService, LatestAssessmentState } from "../../core/services/assessment.service";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-mental-state-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <ng-container *ngIf="latest$ | async as latest">
        <div class="mt-card mt-card-hover page-hero">
          <div class="mt-card-brand max-w-4xl">
            <div class="mt-card-icon">
              <app-icon name="brain" className="text-xl"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Know Your Mental State</div>
              <div class="mt-chip mt-4">
                <app-icon name="sparkles" className="text-xs"></app-icon>
                Mental state: {{ latest.mentalState?.mentalState || "Unknown" }}
              </div>
              <p class="mt-card-copy mt-5 text-base sm:text-lg">
                {{ latest.mentalState?.description || fallbackDescription }}
              </p>
            </div>
          </div>

          <div *ngIf="latest.suggestedAction" class="mt-card-soft mt-6 p-5">
            <div class="mt-card-brand">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                <app-icon name="target" className="text-base"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Next move</div>
                <div class="mt-2 text-lg font-semibold text-slate-900">{{ latest.suggestedAction?.title }}</div>
                <div class="mt-card-copy mt-2 text-sm">{{ latest.suggestedAction?.whyRecommended }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div class="mt-card mt-card-hover p-5 sm:p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="clipboard" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Common signs</div>
                <div class="mt-card-copy mt-2 text-sm">Pattern cues that often show up around this state.</div>
              </div>
            </div>
            <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li *ngFor="let signal of signals" class="mt-card-soft p-4">{{ signal }}</li>
            </ul>
          </div>

          <div class="mt-card mt-card-hover p-5 sm:p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="wand" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Try next</div>
                <div class="mt-card-copy mt-2 text-sm">Small moves that support the current read.</div>
              </div>
            </div>
            <div class="mt-5 space-y-3">
              <div *ngFor="let item of (latest.mentalState?.recommendations?.length ? latest.mentalState.recommendations : fallbackRecommendations)" class="mt-card-soft p-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-card-soft p-5 text-sm text-slate-600">
          <div class="mt-card-brand">
            <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
              <app-icon name="shield" className="text-base"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Support note</div>
              <div class="mt-card-copy mt-2">MindTrack gives wellness support only. Not a diagnosis.</div>
            </div>
          </div>
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
