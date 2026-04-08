import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FeedbackItem, FeedbackService } from "../../core/services/feedback.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-feedback-page",
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="glass-card page-hero bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(255,255,255,0.52),rgba(219,39,119,0.08))]">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Feedback</div>
        <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">Tell us what feels useful, missing, or rough.</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
          MindTrack is meant to feel calm, helpful, and safe. Use this space to suggest improvements, flag friction, or rate the overall experience.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form class="glass-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6" (ngSubmit)="submit()">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="text-sm font-semibold text-slate-900">Share product feedback</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Feature ideas, UX friction, performance notes, or community safety feedback.</div>
            </div>
            <span *ngIf="submitted" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
          </div>

          <div class="mt-5">
            <div class="text-sm font-semibold text-slate-800">How would you rate the experience?</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                *ngFor="let rating of [1,2,3,4,5]"
                type="button"
                (click)="form.rating = rating"
                class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                [class.border-slate-900]="form.rating === rating"
                [class.bg-slate-900]="form.rating === rating"
                [class.text-white]="form.rating === rating"
                [class.border-slate-200]="form.rating !== rating"
                [class.text-slate-600]="form.rating !== rating">
                {{ rating }}/5
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Category
              <select [(ngModel)]="form.category" name="category" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100">
                <option value="general">General</option>
                <option value="community">Community</option>
                <option value="ai">AI quality</option>
                <option value="performance">Performance</option>
                <option value="design">Design</option>
                <option value="safety">Safety</option>
              </select>
            </label>

            <label class="block text-sm font-medium text-slate-600">
              Page context
              <input [(ngModel)]="form.pageContext" name="pageContext" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100" placeholder="Example: community feed, chatbot, tests" />
            </label>
          </div>

          <label class="mt-5 block text-sm font-medium text-slate-600">
            What should we improve?
            <textarea [(ngModel)]="form.message" name="message" rows="6" class="mt-2 w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100" placeholder="Example: The community feed feels calm, but I'd like better messaging between users I follow."></textarea>
          </label>

          <div *ngIf="error" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <button type="submit" [disabled]="pending" class="btn-primary mt-6 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60 sm:w-auto">
            {{ pending ? 'Sending...' : 'Send feedback' }}
          </button>
        </form>

        <div class="space-y-6">
          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">What your feedback changes</div>
            <div class="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">
                Product friction gets translated into clearer UX tasks.
              </div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">
                Safety reports help tune moderation and community protections.
              </div>
              <div class="rounded-3xl bg-slate-50/80 px-4 py-4">
                AI quality notes help reduce repetitive or weak recommendations.
              </div>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-slate-900">Recent submissions</div>
              <button type="button" (click)="loadHistory()" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Refresh</button>
            </div>

            <div class="mt-4 space-y-3">
              <div *ngIf="!history.length" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                Your submitted feedback will appear here.
              </div>

              <div *ngFor="let item of history" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">{{ item.category | titlecase }}</div>
                    <div class="mt-1 text-xs text-slate-400">{{ item.createdAt | date: 'mediumDate' }}</div>
                  </div>
                  <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ item.rating }}/5</div>
                </div>
                <div *ngIf="item.pageContext" class="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  {{ item.pageContext }}
                </div>
                <div class="mt-3 text-sm leading-7 text-slate-600">{{ item.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class FeedbackPageComponent {
  pending = false;
  submitted = false;
  error = "";
  history: FeedbackItem[] = [];

  form = {
    rating: 4,
    category: "general",
    pageContext: "",
    message: ""
  };

  constructor(private readonly feedbackService: FeedbackService) {
    this.loadHistory();
  }

  submit(): void {
    if (this.pending) {
      return;
    }

    this.pending = true;
    this.submitted = false;
    this.error = "";

    this.feedbackService.submit(this.form).subscribe({
      next: (item) => {
        this.pending = false;
        this.submitted = true;
        this.history = [item, ...this.history].slice(0, 10);
        this.form.message = "";
        this.form.pageContext = "";
      },
      error: (err) => {
        this.pending = false;
        this.error = err?.error?.error || "Unable to send feedback right now.";
      }
    });
  }

  loadHistory(): void {
    this.feedbackService.mine().subscribe({
      next: (response) => {
        this.history = response.items || [];
      },
      error: () => {
        this.history = [];
      }
    });
  }
}
