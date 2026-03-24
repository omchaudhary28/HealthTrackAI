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
        <h1 class="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">A mental wellness product built around clarity, not noise.</h1>
        <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
          MindTrack AI helps users reflect on patterns in mood, journaling, assessments, and exercise habits, then turns that signal into supportive, non-medical guidance.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div appScrollReveal [revealDelay]="60" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Purpose</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            Help users slow down, notice recurring mental patterns, and act on one practical next step instead of feeling buried in generic advice.
          </p>
        </div>
        <div appScrollReveal [revealDelay]="120" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Mission</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            Make mental wellness tools feel private, humane, and usable every day, especially when someone only has energy for a very small action.
          </p>
        </div>
        <div appScrollReveal [revealDelay]="180" class="glass-card rounded-[2rem] p-6">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">AI usage</div>
          <p class="mt-4 text-sm leading-8 text-slate-600">
            AI is used to summarize patterns, explain likely states, personalize recommendations, and support reflective chat. It does not provide diagnosis or treatment.
          </p>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div class="glass-card rounded-[2.25rem] p-8">
          <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">What the platform considers</div>
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
      description: "Baseline and follow-up tests contribute mental score trends and dimension-level signals."
    },
    {
      title: "Mood logs",
      description: "Daily stress, sleep, mood, and energy inputs help update the current support snapshot."
    },
    {
      title: "Journals",
      description: "Entries are analyzed for tone and recurring reflective patterns like rumination or self-criticism."
    },
    {
      title: "Exercise behavior",
      description: "Completion history and feedback help the recommendation engine learn what is genuinely useful."
    }
  ];

  guardrails = [
    "MindTrack AI presents pattern snapshots, not medical diagnoses.",
    "Recommendations are supportive exercises with expected outcomes and plain-language reasoning.",
    "Chat responses stay non-clinical and avoid claiming treatment or authority.",
    "Protected routes and authenticated sessions keep user-specific history private."
  ];
}
