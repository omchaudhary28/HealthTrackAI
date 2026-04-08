import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { RouterLink } from "@angular/router";
import { Observable } from "rxjs";
import { TestSummary, TestsService } from "../../core/services/tests.service";

@Component({
  selector: "app-test-center-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, RouterLink],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="glass-card theme-hero-card page-hero">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Test Center</div>
        <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Quick tests. Clear read.</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          Take a quick self-check, get a short read, and keep moving. Not a diagnosis.
        </p>
      </div>
      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <a
          *ngFor="let test of (tests$ | async); let i = index"
          [routerLink]="['/tests', test.key]"
          appScrollReveal
          [revealDelay]="i * 60"
          class="group rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_30px_70px_-45px_rgba(32,50,71,0.6)]">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{{ test.category }}</div>
          <div class="mt-3 text-xl font-semibold text-slate-900 group-hover:text-slate-950">{{ test.title }}</div>
          <div class="mt-3 text-sm leading-7 text-slate-600">{{ test.description }}</div>
          <div *ngIf="test.scoringScale" class="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{{ test.scoringScale }}</div>
        </a>
      </div>
      <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
        <div class="text-sm font-medium text-slate-500">Question preview</div>
        <div class="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Question 4 of 12</div>
          <div class="mt-3 text-lg font-semibold text-slate-900">Small uncertainties make me feel restless.</div>
          <div class="mt-4 grid gap-3 min-[430px]:grid-cols-2 sm:grid-cols-5">
            <button *ngFor="let choice of choices" type="button" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">{{ choice }}</button>
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


