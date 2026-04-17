import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FeedbackItem, FeedbackService } from "../../core/services/feedback.service";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-feedback-page",
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="mt-card-brand max-w-3xl">
          <div class="mt-card-icon">
            <app-icon name="feedback" className="text-xl"></app-icon>
          </div>
          <div>
            <div class="mt-card-kicker">Feedback</div>
            <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">Tell us what hits and what flops.</h1>
            <p class="mt-card-copy mt-3 text-sm sm:text-base">
              Drop a quick note on UX friction, weak replies, safety concerns, or ideas worth shipping.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form class="mt-card mt-card-hover p-5 sm:p-6" (ngSubmit)="submit()">
          <div class="mt-card-head">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="comments" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Drop feedback</div>
                <div class="mt-card-copy mt-2 text-sm">Ideas, bugs, friction, safety notes.</div>
              </div>
            </div>
            <span *ngIf="submitted" class="mt-chip">Saved</span>
          </div>

          <div class="mt-6">
            <div class="text-sm font-semibold text-slate-800">Rate the vibe</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                *ngFor="let rating of [1,2,3,4,5]"
                type="button"
                (click)="form.rating = rating"
                class="mt-chip transition"
                [class.bg-slate-900]="form.rating === rating"
                [class.border-slate-900]="form.rating === rating"
                [class.text-white]="form.rating === rating">
                {{ rating }}/5
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Category
              <select [(ngModel)]="form.category" name="category" class="app-field mt-2">
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
              <input [(ngModel)]="form.pageContext" name="pageContext" class="app-field mt-2" placeholder="Example: feed, chatbot, tests" />
            </label>
          </div>

          <label class="mt-5 block text-sm font-medium text-slate-600">
            What should we improve?
            <textarea [(ngModel)]="form.message" name="message" rows="6" class="app-textarea mt-2" placeholder="Example: Feed is clean, but messaging feels clunky."></textarea>
          </label>

          <div *ngIf="error" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <button type="submit" [disabled]="pending" class="btn-primary mt-6 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60 sm:w-auto">
            {{ pending ? "Sending..." : "Send it" }}
          </button>
        </form>

        <div class="space-y-6">
          <div class="mt-card mt-card-hover p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="wand" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Why it matters</div>
                <div class="mt-card-copy mt-2 text-sm">Each report feeds the product loop.</div>
              </div>
            </div>
            <div class="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <div class="mt-card-soft p-4">Rough UX turns into fixes.</div>
              <div class="mt-card-soft p-4">Safety notes help tune protections.</div>
              <div class="mt-card-soft p-4">AI notes help cut weak or repetitive replies.</div>
            </div>
          </div>

          <div class="mt-card mt-card-hover p-6">
            <div class="mt-card-head">
              <div class="mt-card-brand">
                <div class="mt-card-icon">
                  <app-icon name="clipboard" className="text-lg"></app-icon>
                </div>
                <div>
                  <div class="mt-card-kicker">Recent submissions</div>
                  <div class="mt-card-copy mt-2 text-sm">Your latest notes, in one place.</div>
                </div>
              </div>
              <button type="button" (click)="loadHistory()" class="btn-outline rounded-full px-4 py-2 text-xs font-semibold">Refresh</button>
            </div>

            <div class="mt-4 space-y-3">
              <div *ngIf="!history.length" class="mt-card-soft p-5 text-sm text-slate-500">
                Your feedback shows up here.
              </div>

              <div *ngFor="let item of history" class="mt-card-soft p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">{{ item.category | titlecase }}</div>
                    <div class="mt-1 text-xs text-slate-400">{{ item.createdAt | date: "mediumDate" }}</div>
                  </div>
                  <div class="mt-chip">{{ item.rating }}/5</div>
                </div>
                <div *ngIf="item.pageContext" class="mt-chip mt-3">{{ item.pageContext }}</div>
                <div class="mt-card-copy mt-3 text-sm">{{ item.message }}</div>
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
