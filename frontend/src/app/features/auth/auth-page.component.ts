import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService, SignupPayload } from "../../core/services/auth.service";

@Component({
  selector: "app-auth-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule],
  template: `
    <section appScrollReveal class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(160deg,rgba(142,184,215,0.26),rgba(159,215,201,0.22),rgba(255,255,255,0.88))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)]">
        <div class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Welcome in</div>
        <h1 class="mt-4 text-3xl font-semibold text-slate-900">Build a private wellness record that evolves with you.</h1>
        <p class="mt-4 text-base leading-8 text-slate-600">
          Use a baseline assessment, daily check-ins, progress charts, and journaling prompts to reflect more clearly over time.
        </p>
        <div class="mt-8 rounded-3xl border border-white/70 bg-white/80 p-5 text-sm text-slate-600">
          Important: MindTrack AI supports self-reflection and wellbeing habits only. It does not diagnose mental health conditions.
        </div>
      </div>
      <form class="rounded-[2.5rem] border border-white/70 bg-white/80 p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)] backdrop-blur" (ngSubmit)="submit()">
        <div class="mb-6 flex rounded-full bg-slate-50 p-1 text-sm font-semibold text-slate-600">
          <button type="button" (click)="mode = 'signup'" [class]="tabClass(mode === 'signup')" class="flex-1 rounded-full px-4 py-2">Create account</button>
          <button type="button" (click)="mode = 'login'" [class]="tabClass(mode === 'login')" class="flex-1 rounded-full px-4 py-2">Sign in</button>
        </div>

        <div *ngIf="error" class="mb-5 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {{ error }}
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Name
            <input [(ngModel)]="form.name" name="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Age
            <input [(ngModel)]="form.age" name="age" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600 sm:col-span-2">
            Email
            <input [(ngModel)]="form.email" name="email" type="email" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600 sm:col-span-2">
            Password
            <input [(ngModel)]="form.password" name="password" type="password" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Occupation
            <input [(ngModel)]="form.occupation" name="occupation" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Sleep habits
            <input [(ngModel)]="form.sleepHabits" name="sleepHabits" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
        </div>
        <button type="submit" [disabled]="pending" class="btn-primary mt-8 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
          {{ pending ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in' }}
        </button>
      </form>
    </section>
  `
})
export class AuthPageComponent {
  mode: "signup" | "login" = "signup";
  pending = false;
  error = "";
  form = {
    name: "Avery",
    age: 27,
    gender: "Female",
    email: "avery@example.com",
    password: "password123",
    occupation: "Product designer",
    sleepHabits: "Inconsistent bedtime",
    lifestyleIndicators: "Remote work, low movement during weekdays",
    stressIndicators: "Deadline pressure, overthinking, shallow sleep"
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  tabClass(active: boolean): string {
    return active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700";
  }

  submit(): void {
    this.error = "";
    this.pending = true;

    const nextUrl = this.route.snapshot.queryParamMap.get("next") || "/dashboard";

    if (this.mode === "login") {
      this.authService.login(this.form.email, this.form.password).subscribe({
        next: (user) => {
          const destination = user.baselineComplete ? nextUrl : "/tests/baseline";
          this.router.navigateByUrl(destination);
          this.pending = false;
        },
        error: (err) => {
          this.error = err?.error?.error || "Unable to sign in. Please try again.";
          this.pending = false;
        }
      });
      return;
    }

    const payload: SignupPayload = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      profile: {
        age: Number(this.form.age) || undefined,
        gender: this.form.gender || undefined,
        occupation: this.form.occupation || undefined,
        sleepHabits: this.form.sleepHabits || undefined,
        lifestyleIndicators: splitList(this.form.lifestyleIndicators),
        stressIndicators: splitList(this.form.stressIndicators)
      }
    };

    this.authService.signup(payload).subscribe({
      next: (user) => {
        const destination = user.baselineComplete ? nextUrl : "/tests/baseline";
        this.router.navigateByUrl(destination);
        this.pending = false;
      },
      error: (err) => {
        this.error = err?.error?.error || "Unable to create account. Please try again.";
        this.pending = false;
      }
    });
  }
}

function splitList(value: string): string[] {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}


