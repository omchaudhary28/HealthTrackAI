import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-community-forum-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-3xl border border-white/70 bg-[linear-gradient(145deg,rgba(142,184,215,0.18),rgba(255,255,255,0.88))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.45)]">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Community</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">Anonymous support, gently moderated.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          Share experiences and small coping steps without exposing identity. MindTrack AI is not a medical service.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <article
          *ngFor="let post of posts; let i = index"
          appScrollReveal
          [revealDelay]="i * 80"
          class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="rounded-full bg-slate-50 px-3 py-1">{{ post.category }}</span>
              <span aria-hidden="true" class="text-slate-300">&middot;</span>
              <span class="rounded-full bg-slate-50 px-3 py-1">{{ post.alias }}</span>
            </div>
            <span class="text-xs text-slate-400">Anonymous</span>
          </div>

          <h2 class="mt-4 text-xl font-semibold text-slate-900">{{ post.title }}</h2>
          <p class="mt-3 text-sm leading-8 text-slate-600">{{ post.content }}</p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span *ngFor="let tag of post.tags" class="rounded-full bg-[var(--mist)] px-3 py-1 text-xs font-semibold text-slate-600">{{ tag }}</span>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Support {{ post.support }}</span>
            <span class="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">Grounded {{ post.grounded }}</span>
            <span class="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{{ post.comments }} comments</span>
          </div>

          <div class="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            Reminder: Be kind, avoid medical claims, and keep details anonymous.
          </div>
        </article>
      </div>
    </section>
  `
})
export class CommunityForumPageComponent {
  posts = [
    {
      alias: "Quiet Lantern",
      category: "Overwhelm",
      title: "How do you slow your mind down after work?",
      content:
        "My thoughts keep running after the day ends. I want to rest, but my brain keeps replaying loose ends.",
      tags: ["overthinking", "sleep"],
      support: 18,
      grounded: 9,
      comments: 6
    },
    {
      alias: "Soft Echo",
      category: "Connection",
      title: "Low-pressure ways to stop isolating",
      content:
        "I want more connection, but direct social plans feel heavy lately. Curious what gentler steps have worked for others.",
      tags: ["social comfort", "introversion"],
      support: 24,
      grounded: 11,
      comments: 8
    }
  ];
}


