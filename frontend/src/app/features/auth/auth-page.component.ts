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
    <section appScrollReveal class="mx-auto grid max-w-6xl gap-4 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div class="glass-card page-hero bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(255,255,255,0.48),rgba(14,165,233,0.08))]">
        <div class="inline-flex rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Secure access
        </div>
        <h1 class="mt-5 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
          Start with a private account that adapts as your patterns change.
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
          MindTrack AI combines check-ins, journals, assessments, and activity patterns into a supportive wellness experience. It does not diagnose mental health conditions.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div class="rounded-3xl border border-white/70 bg-white/72 p-5">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Fast access</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">Smart email routing</div>
            <div class="mt-2 text-sm leading-7 text-slate-600">Enter your email once and MindTrack nudges you toward sign in or account creation automatically.</div>
          </div>
          <div class="rounded-3xl border border-white/70 bg-white/72 p-5">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Private by default</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">Protected wellness data</div>
            <div class="mt-2 text-sm leading-7 text-slate-600">Assessment history, journals, and recommendations stay tied to your account session and protected routes.</div>
          </div>
        </div>

        <div class="mt-8 rounded-3xl border border-white/70 bg-white/72 p-5 text-sm leading-7 text-slate-600">
          Important: MindTrack AI supports reflection and habit-building only. It never acts as a clinical or medical authority.
        </div>
      </div>

      <form class="glass-card rounded-[2rem] p-5 backdrop-blur sm:rounded-[2.5rem] sm:p-8" (ngSubmit)="submit()">
        <div class="mb-6 flex rounded-full bg-slate-100/80 p-1 text-sm font-semibold text-slate-600">
          <button type="button" (click)="setMode('signup')" [class]="tabClass(mode === 'signup')" class="flex-1 rounded-full px-4 py-2">
            Create account
          </button>
          <button type="button" (click)="setMode('login')" [class]="tabClass(mode === 'login')" class="flex-1 rounded-full px-4 py-2">
            Sign in
          </button>
        </div>

        <div class="mb-6 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4">
          <label class="block text-sm font-medium text-slate-700">
            Email
            <div class="relative mt-2">
              <input
                [(ngModel)]="form.email"
                (blur)="lookupEmail()"
                name="email"
                type="email"
                autocomplete="email"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-28 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
              <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-400">
                {{ lookupPending ? 'Checking...' : 'Email-first' }}
              </div>
            </div>
          </label>

          <div *ngIf="emailHint" class="mt-3 rounded-2xl px-4 py-3 text-sm"
            [class.bg-emerald-50]="emailHintKind === 'success'"
            [class.text-emerald-700]="emailHintKind === 'success'"
            [class.bg-amber-50]="emailHintKind === 'warning'"
            [class.text-amber-700]="emailHintKind === 'warning'">
            {{ emailHint }}
          </div>
        </div>

        <div *ngIf="error" class="mb-5 rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {{ error }}
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Name
            <input [(ngModel)]="form.name" name="name" autocomplete="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Age
            <input [(ngModel)]="form.age" name="age" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Gender
            <input [(ngModel)]="form.gender" name="gender" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Occupation
            <input [(ngModel)]="form.occupation" name="occupation" autocomplete="organization-title" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label class="block text-sm font-medium text-slate-600 sm:col-span-2">
            Password
            <input [(ngModel)]="form.password" name="password" type="password" [attr.autocomplete]="mode === 'signup' ? 'new-password' : 'current-password'" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Sleep habits
            <input [(ngModel)]="form.sleepHabits" name="sleepHabits" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600">
            Lifestyle indicators
            <input [(ngModel)]="form.lifestyleIndicators" name="lifestyleIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label *ngIf="mode === 'signup'" class="block text-sm font-medium text-slate-600 sm:col-span-2">
            Stress indicators
            <input [(ngModel)]="form.stressIndicators" name="stressIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
          </label>
        </div>

        <button type="submit" [disabled]="pending || lookupPending" class="btn-primary mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
          <span *ngIf="pending" class="inline-flex h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
          {{ pending ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in' }}
        </button>
      </form>
    </section>
  `
})
export class AuthPageComponent {
  mode: "signup" | "login" = "signup";
  pending = false;
  lookupPending = false;
  error = "";
  emailHint = "";
  emailHintKind: "success" | "warning" = "success";
  form = {
    name: "",
    age: null as number | null,
    gender: "",
    email: "",
    password: "",
    occupation: "",
    sleepHabits: "",
    lifestyleIndicators: "",
    stressIndicators: ""
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  tabClass(active: boolean): string {
    return active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700";
  }

  setMode(mode: "signup" | "login"): void {
    this.mode = mode;
    this.error = "";
  }

  lookupEmail(): void {
    const email = this.form.email.trim();
    if (!email || !email.includes("@")) {
      this.emailHint = "";
      return;
    }

    this.lookupPending = true;
    this.authService.lookup(email).subscribe({
      next: (result) => {
        this.lookupPending = false;
        this.mode = result.recommendedMode;
        if (result.exists) {
          this.emailHintKind = "success";
          this.emailHint = `We found an account${result.name ? ` for ${result.name}` : ""}. Sign in to continue.`;
        } else {
          this.emailHintKind = "warning";
          this.emailHint = "No account found for this email yet. Create one to get started.";
        }
      },
      error: () => {
        this.lookupPending = false;
      }
    });
  }

  submit(): void {
    this.error = "";

    const validationError = this.validateForm();
    if (validationError) {
      this.error = validationError;
      return;
    }

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
      name: this.form.name.trim(),
      email: this.form.email.trim(),
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

  private validateForm(): string {
    const email = this.form.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return "Enter a valid email address.";
    }

    if (!this.form.password) {
      return "Enter your password.";
    }

    if (this.mode === "signup") {
      if (!this.form.name.trim()) {
        return "Enter your name to create an account.";
      }

      if (this.form.password.length < 8) {
        return "Use at least 8 characters for your password.";
      }
    }

    return "";
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
