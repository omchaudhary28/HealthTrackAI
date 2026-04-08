import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-about-page",
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  template: `
    <section appScrollReveal class="mx-auto max-w-6xl space-y-6">
      <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(255,255,255,0.48),rgba(234,88,12,0.08))] p-8 sm:p-10">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">About MindTrack AI</div>
        <h1 class="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">Built for clarity, not noise.</h1>
        <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
          MindTrack turns mood logs, notes, tests, and habits into short supportive guidance. Not medical advice.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div appScrollReveal [revealDelay]="60" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Purpose</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            Help people slow down, spot the pattern, and make one useful move.
          </p>
        </div>
        <div appScrollReveal [revealDelay]="120" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Mission</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            Make wellness tools feel private, human, and easy on low-energy days.
          </p>
        </div>
        <div appScrollReveal [revealDelay]="180" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">AI usage</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            AI summarizes patterns, suggests next moves, and supports chat. It does not diagnose or treat.
          </p>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div class="glass-card rounded-[2.25rem] p-8">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">What it reads</div>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div *ngFor="let item of signals" class="rounded-3xl bg-slate-50/80 p-5 text-sm leading-7 text-slate-700">
              <div class="font-semibold text-slate-900">{{ item.title }}</div>
              <div class="mt-2">{{ item.description }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-[2.25rem] p-8">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Guardrails</div>
          <div class="mt-5 space-y-3">
            <div *ngFor="let guardrail of guardrails" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4 text-sm leading-7 text-slate-700">
              {{ guardrail }}
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <a routerLink="/auth" class="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Create account</a>
            <a routerLink="/" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Back home</a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutPageComponent {
  signals = [
    {
      title: "Assessments",
      description: "Baseline and follow-up tests shape the score trend."
    },
    {
      title: "Mood logs",
      description: "Daily mood, stress, sleep, and energy keep the snapshot fresh."
    },
    {
      title: "Journals",
      description: "Entries are read for tone and repeat loops like rumination."
    },
    {
      title: "Exercise behavior",
      description: "Completion history and feedback teach the app what actually helps."
    }
  ];

  guardrails = [
    "MindTrack shows pattern snapshots, not diagnoses.",
    "Recommendations stay plain, supportive, and practical.",
    "Chat stays non-clinical and avoids fake authority.",
    "Protected routes keep personal history private."
  ];
}
