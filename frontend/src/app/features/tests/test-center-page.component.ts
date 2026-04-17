import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Observable } from "rxjs";
import { TestSummary, TestsService } from "../../core/services/tests.service";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-test-center-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, RouterLink, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="mt-card-brand max-w-3xl">
          <div class="mt-card-icon">
            <app-icon name="tests" className="text-xl"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">Test Center</div>
            <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Quick tests. Clear read.</h1>
            <p class="mt-card-copy mt-3 text-sm sm:text-base">
              Take a fast self-check, get a short interpretation, and keep moving. This is for reflection, not diagnosis.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <a
          *ngFor="let test of (tests$ | async); let i = index"
          [routerLink]="['/tests', test.key]"
          appScrollReveal
          [revealDelay]="i * 70"
          class="mt-card mt-card-hover p-6">
          <div class="mt-card-head">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="checklist" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">{{ test.category }}</div>
                <div class="mt-3 text-xl font-semibold text-slate-900">{{ test.title }}</div>
              </div>
            </div>
          </div>
          <div class="mt-card-copy mt-4 text-sm">{{ test.description }}</div>
          <div *ngIf="test.scoringScale" class="mt-card-soft mt-5 p-4 text-sm text-slate-600">{{ test.scoringScale }}</div>
        </a>
      </div>

      <div class="mt-card mt-card-hover p-6">
        <div class="mt-card-brand">
          <div class="mt-card-icon">
            <app-icon name="clipboard" className="text-lg"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">Question preview</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">Small uncertainties make me feel restless.</div>
          </div>
        </div>

        <div class="mt-card-soft mt-5 p-5">
          <div class="mt-card-kicker">Question 4 of 12</div>
          <div class="mt-4 grid gap-3 min-[430px]:grid-cols-2 sm:grid-cols-5">
            <button *ngFor="let choice of choices" type="button" class="mt-chip justify-center px-4 py-3 text-center text-sm">{{ choice }}</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TestCenterPageComponent {
  tests$: Observable<TestSummary[]>;
  choices = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

  constructor(private readonly testsService: TestsService) {
    this.tests$ = this.testsService.listTests();
  }
}
