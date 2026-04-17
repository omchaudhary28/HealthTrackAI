import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService, SignupPayload } from "../../core/services/auth.service";
import { IconComponent } from "../../shared/components/icon.component";

@Component({
  selector: "app-auth-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule, IconComponent],
  template: `
    <section appScrollReveal class="mx-auto grid max-w-6xl gap-4 sm:gap-6 lg:grid-cols-[0.98fr_1.02fr]">
      <form class="order-1 mt-card mt-card-hover rounded-[1.75rem] p-4 backdrop-blur sm:rounded-[2.25rem] sm:p-6 lg:order-2 lg:p-8" (ngSubmit)="submit()">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {{ mode === "signup" ? "Create account" : "Welcome back" }}
              </div>
              <div class="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                {{ mode === "signup" ? "Start with the basics." : "Jump back in." }}
              </div>
              <div class="mt-1 text-sm leading-6 text-slate-500">
                {{ mode === "signup" ? "Just name, email, and password." : "Use the email tied to your account." }}
              </div>
            </div>

            <div class="flex rounded-full bg-slate-100/85 p-1 text-sm font-semibold text-slate-600">
              <button type="button" (click)="setMode('signup')" [class]="tabClass(mode === 'signup')" class="flex-1 rounded-full px-4 py-2">
                Create
              </button>
              <button type="button" (click)="setMode('login')" [class]="tabClass(mode === 'login')" class="flex-1 rounded-full px-4 py-2">
                Sign in
              </button>
            </div>
          </div>

          <div class="mt-card-soft border border-slate-200/70 p-4">
            <label class="block text-sm font-medium text-slate-700">
              Email
              <div class="relative mt-2">
                <input
                  [(ngModel)]="form.email"
                  (blur)="lookupEmail()"
                  name="email"
                  type="email"
                  autocomplete="email"
                  class="app-field app-field-white pr-24"
                  placeholder="name@example.com" />
                <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {{ lookupPending ? 'Checking' : 'Smart check' }}
                </div>
              </div>
            </label>

            <div
              *ngIf="emailHint"
              class="mt-3 rounded-[1.1rem] px-4 py-3 text-sm leading-6"
              [class.bg-emerald-50]="emailHintKind === 'success'"
              [class.text-emerald-700]="emailHintKind === 'success'"
              [class.bg-amber-50]="emailHintKind === 'warning'"
              [class.text-amber-700]="emailHintKind === 'warning'">
              {{ emailHint }}
            </div>
          </div>

          <div *ngIf="error" class="rounded-[1.4rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <div *ngIf="mode === 'signup'" class="grid gap-4 min-[520px]:grid-cols-2">
            <label class="block text-sm font-medium text-slate-600">
              Name
              <input [(ngModel)]="form.name" name="name" autocomplete="name" class="app-field mt-2" placeholder="Your name" />
            </label>

            <label class="block text-sm font-medium text-slate-600 min-[520px]:col-span-2">
              Password
              <input
                [(ngModel)]="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                class="app-field mt-2"
                placeholder="At least 8 characters" />
            </label>
          </div>

          <label *ngIf="mode === 'login'" class="block text-sm font-medium text-slate-600">
            Password
            <input
              [(ngModel)]="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="app-field mt-2"
              placeholder="Enter your password" />
          </label>

          <div *ngIf="mode === 'signup'" class="mt-card-soft border border-slate-200/80 bg-white/78 p-4">
            <button
              type="button"
              (click)="profileDetailsExpanded = !profileDetailsExpanded"
              class="flex w-full items-center justify-between gap-3 text-left">
              <div>
                <div class="text-sm font-semibold text-slate-900">Profile details</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">
                  Optional stuff. Add now or later.
                </div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {{ profileDetailsExpanded ? "Hide" : "Optional" }}
              </span>
            </button>

            <div *ngIf="profileDetailsExpanded" class="mt-4 grid gap-4">
              <div class="grid gap-4 min-[520px]:grid-cols-2">
                <label class="block text-sm font-medium text-slate-600">
                  Age
                  <input [(ngModel)]="form.age" name="age" type="number" class="app-field mt-2" />
                </label>
                <label class="block text-sm font-medium text-slate-600">
                  Gender
                  <input [(ngModel)]="form.gender" name="gender" class="app-field mt-2" />
                </label>
              </div>

              <div class="grid gap-4 min-[520px]:grid-cols-2">
                <label class="block text-sm font-medium text-slate-600">
                  Occupation
                  <input [(ngModel)]="form.occupation" name="occupation" autocomplete="organization-title" class="app-field mt-2" />
                </label>
                <label class="block text-sm font-medium text-slate-600">
                  Sleep habits
                  <input [(ngModel)]="form.sleepHabits" name="sleepHabits" class="app-field mt-2" placeholder="Example: 7 hours, irregular" />
                </label>
              </div>

              <label class="block text-sm font-medium text-slate-600">
                Lifestyle indicators
                <input
                  [(ngModel)]="form.lifestyleIndicators"
                  name="lifestyleIndicators"
                  class="app-field mt-2"
                  placeholder="Example: screen time, exercise, caffeine" />
              </label>

              <label class="block text-sm font-medium text-slate-600">
                Stress indicators
                <input
                  [(ngModel)]="form.stressIndicators"
                  name="stressIndicators"
                  class="app-field mt-2"
                  placeholder="Example: deadlines, overthinking, low sleep" />
              </label>
            </div>
          </div>

          <button type="submit" [disabled]="pending || lookupPending" class="btn-primary flex w-full items-center justify-center gap-3 rounded-[1.35rem] px-5 py-4 text-sm font-semibold disabled:opacity-60">
            <span *ngIf="pending" class="inline-flex h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
            {{ pending ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in' }}
          </button>
        </div>
      </form>

      <div class="order-2 mt-card mt-card-hover page-hero bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(255,255,255,0.48),rgba(14,165,233,0.08))] lg:order-1">
        <div class="mt-card-brand max-w-xl">
          <div class="mt-card-icon">
            <app-icon name="shield" className="text-xl"></app-icon>
          </div>
          <div>
            <div class="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Secure access
            </div>
            <h1 class="mt-4 text-xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
              Private tracking, low friction.
            </h1>
            <p class="mt-card-copy mt-3 max-w-xl text-sm sm:text-base">
              Check-ins, notes, tests, and exercises in one place. "No long setup" is the vibe.
            </p>
          </div>
        </div>

        <div class="mt-card-soft mt-5 border border-white/70 px-4 py-4 text-sm leading-7 text-slate-600 lg:hidden">
          Start fast now. Add the extra profile stuff later.
        </div>

        <div class="mt-6 hidden gap-4 sm:grid-cols-2 lg:grid">
          <div class="mt-card-soft border border-white/70 p-5">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Fast access</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">Smart email check</div>
            <div class="mt-2 text-sm leading-7 text-slate-600">Type your email once. MindTrack points you to sign in or create.</div>
          </div>
          <div class="mt-card-soft border border-white/70 p-5">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Private by default</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">Protected data</div>
            <div class="mt-2 text-sm leading-7 text-slate-600">Your journal, tests, and recommendations stay tied to your account.</div>
          </div>
        </div>

        <div class="mt-card-soft mt-6 border border-white/70 p-5 text-sm leading-7 text-slate-600">
          MindTrack supports reflection and habits. It is not medical advice.
        </div>
      </div>
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
  profileDetailsExpanded = false;
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

    if (mode === "login") {
      this.profileDetailsExpanded = false;
    }
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
          this.emailHint = `Account found${result.name ? ` for ${result.name}` : ""}. Sign in to keep going.`;
          this.profileDetailsExpanded = false;
        } else {
          this.emailHintKind = "warning";
          this.emailHint = "No account yet. Create one and jump in.";
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
