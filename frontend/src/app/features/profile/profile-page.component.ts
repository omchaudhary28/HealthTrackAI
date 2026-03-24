import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { AuthService, UserProfile } from "../../core/services/auth.service";
import { DashboardService, DashboardSummary } from "../../core/services/dashboard.service";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="glass-card rounded-[2.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(255,255,255,0.52),rgba(37,99,235,0.08))] p-8">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Profile</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Your account context, activity summary, and AI insight history.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          Update the context that shapes personalized recommendations and review how your recent activity is trending.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form class="glass-card rounded-[2rem] p-6" (ngSubmit)="save()">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-slate-900">Account details</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">These fields help the AI system contextualize trends and next-step suggestions.</div>
            </div>
            <span *ngIf="saved" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Saved</span>
          </div>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">Name
              <input [(ngModel)]="profile.name" name="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">Email
              <input [ngModel]="email" name="email" disabled class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none" />
            </label>
            <label class="block text-sm font-medium text-slate-600">Age
              <input [(ngModel)]="profile.age" name="age" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">Gender
              <input [(ngModel)]="profile.gender" name="gender" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">Occupation
              <input [(ngModel)]="profile.occupation" name="occupation" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600">Sleep habits
              <input [(ngModel)]="profile.sleepHabits" name="sleepHabits" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600 md:col-span-2">Lifestyle indicators
              <input [(ngModel)]="lifestyleIndicators" name="lifestyleIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label class="block text-sm font-medium text-slate-600 md:col-span-2">Stress indicators
              <input [(ngModel)]="stressIndicators" name="stressIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
            </label>
          </div>

          <div *ngIf="error" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <button type="submit" [disabled]="pending" class="btn-primary mt-6 rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
            {{ pending ? 'Saving...' : 'Save changes' }}
          </button>
        </form>

        <div class="space-y-6">
          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">Activity summary</div>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-slate-50/80 p-5">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood logs</div>
                <div class="mt-3 text-2xl font-semibold text-slate-900">{{ summary?.activitySummary?.moodCheckIns30d || 0 }}</div>
                <div class="mt-2 text-sm text-slate-600">Last 30 days</div>
              </div>
              <div class="rounded-3xl bg-slate-50/80 p-5">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercises completed</div>
                <div class="mt-3 text-2xl font-semibold text-slate-900">{{ summary?.activitySummary?.exerciseCompleted30d || 0 }}</div>
                <div class="mt-2 text-sm text-slate-600">Last 30 days</div>
              </div>
              <div class="rounded-3xl bg-slate-50/80 p-5">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Exercise streak</div>
                <div class="mt-3 text-2xl font-semibold text-slate-900">{{ summary?.activitySummary?.exerciseStreak || 0 }}d</div>
                <div class="mt-2 text-sm text-slate-600">Current streak</div>
              </div>
              <div class="rounded-3xl bg-slate-50/80 p-5">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current state</div>
                <div class="mt-3 text-2xl font-semibold text-slate-900">{{ summary?.currentMentalState?.mentalState || summary?.currentMentalState?.mental_state || 'Balanced' }}</div>
                <div class="mt-2 text-sm text-slate-600">Latest AI snapshot</div>
              </div>
            </div>
          </div>

          <div class="glass-card rounded-[2rem] p-6">
            <div class="text-sm font-semibold text-slate-900">AI insights history</div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let insight of (summary?.aiInsightsHistory || []).slice(0, 4)" class="rounded-3xl border border-slate-100 bg-white/80 px-4 py-4">
                <div class="text-sm font-semibold text-slate-900">{{ insight.title }}</div>
                <div class="mt-2 text-sm leading-7 text-slate-600">{{ insight.description }}</div>
                <div *ngIf="insight.suggestedAction" class="mt-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  Suggested action: {{ insight.suggestedAction }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProfilePageComponent {
  pending = false;
  saved = false;
  error = "";

  email = "";
  profile: {
    name: string;
    age?: number;
    gender?: string;
    occupation?: string;
    sleepHabits?: string;
  } = {
    name: ""
  };
  lifestyleIndicators = "";
  stressIndicators = "";
  summary: DashboardSummary | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardService: DashboardService
  ) {
    this.prefill(this.authService.currentUser());
    this.dashboardService.getSummary().subscribe({
      next: (summary) => (this.summary = summary),
      error: () => (this.summary = null)
    });
  }

  save(): void {
    this.pending = true;
    this.saved = false;
    this.error = "";

    this.authService
      .updateProfile({
        name: this.profile.name,
        profile: {
          age: this.profile.age,
          gender: this.profile.gender,
          occupation: this.profile.occupation,
          sleepHabits: this.profile.sleepHabits,
          lifestyleIndicators: splitList(this.lifestyleIndicators),
          stressIndicators: splitList(this.stressIndicators)
        }
      })
      .subscribe({
        next: (user) => {
          this.prefill(user);
          this.saved = true;
          this.pending = false;
        },
        error: (err) => {
          this.error = err?.error?.error || "Unable to save profile right now.";
          this.pending = false;
        }
      });
  }

  private prefill(user: UserProfile | null): void {
    this.email = user?.email || "";
    this.profile = {
      name: user?.name || "",
      age: user?.profile?.age,
      gender: user?.profile?.gender,
      occupation: user?.profile?.occupation,
      sleepHabits: user?.profile?.sleepHabits
    };
    this.lifestyleIndicators = (user?.profile?.lifestyleIndicators || []).join(", ");
    this.stressIndicators = (user?.profile?.stressIndicators || []).join(", ");
  }
}

function splitList(value: string): string[] {
  return String(value || "")
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
