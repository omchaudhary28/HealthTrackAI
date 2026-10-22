import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService, SignupPayload } from "../../core/services/auth.service";
import { IconComponent } from "../../shared/components/icon.component";

@Component({
  selector: "app-auth-page",
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="auth-page">
      <div class="auth-layout">
        <!-- Welcome Panel (Desktop: Left column; Mobile: Compact top branding) -->
        <aside class="auth-welcome">
          <!-- Brand Badge -->
          <div class="brand-row">
            <div class="brand-logo">MT</div>
            <div class="brand-text">
              <span class="brand-title">MindTrack AI</span>
              <span class="brand-subtitle">Wellness Tracking</span>
            </div>
          </div>

          <!-- Headline & Pitch -->
          <div class="welcome-copy">
            <div class="pill-badge">
              <app-icon name="shield" className="h-3.5 w-3.5 text-indigo-500"></app-icon>
              <span>Private &amp; Secure</span>
            </div>
            <h1 class="welcome-heading">
              Your space for calm, clear reflection.
            </h1>
            <p class="welcome-desc">
              Log daily moods, reflect with guided journals, complete science-informed assessments,
              and build emotional resilience at your own pace.
            </p>
          </div>

          <!-- Subtle Abstract Wellness Visual (Visible on desktop/tablet) -->
          <div class="wellness-visual" aria-hidden="true">
            <div class="visual-orb orb-1"></div>
            <div class="visual-orb orb-2"></div>
            <div class="visual-card-float">
              <div class="float-chip">
                <app-icon name="sparkles" className="h-4 w-4 text-amber-500"></app-icon>
                <span>AI-Assisted Guidance</span>
              </div>
              <div class="float-chip">
                <app-icon name="heart" className="h-4 w-4 text-rose-500"></app-icon>
                <span>Habit Building</span>
              </div>
              <div class="float-chip">
                <app-icon name="shield" className="h-4 w-4 text-emerald-500"></app-icon>
                <span>Encrypted &amp; Private</span>
              </div>
            </div>
          </div>

          <!-- Desktop Feature Cards -->
          <div class="welcome-features">
            <div class="feature-item">
              <div class="feature-label">Fast Access</div>
              <div class="feature-title">Smart Email Check</div>
              <div class="feature-desc">
                Type your email once. MindTrack detects your account and guides you automatically.
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-label">Private by Default</div>
              <div class="feature-title">Protected Data</div>
              <div class="feature-desc">
                Your check-ins, baseline tests, and exercise logs remain tied solely to your credentials.
              </div>
            </div>
          </div>

          <!-- Non-diagnostic disclaimer -->
          <div class="welcome-disclaimer">
            <p>
              MindTrack AI provides tools for self-reflection and habit tracking. It does not provide clinical diagnosis or medical treatment.
            </p>
          </div>
        </aside>

        <!-- Authentication Panel -->
        <main class="auth-panel">
          <div class="auth-card">
            <!-- Tabs Switcher -->
            <div class="tabs-header">
              <div class="tabs-titles">
                <div class="panel-kicker">
                  {{ mode === 'signup' ? 'Get Started' : 'Welcome Back' }}
                </div>
                <h2 class="panel-title">
                  {{ mode === 'signup' ? 'Create an account' : 'Sign in to MindTrack' }}
                </h2>
                <p class="panel-subtitle">
                  {{ mode === 'signup' ? 'Start your wellness tracking journey in seconds.' : 'Pick up right where you left your reflection.' }}
                </p>
              </div>

              <div class="tab-toggle" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="mode === 'login'"
                  (click)="setMode('login')"
                  [class.active]="mode === 'login'"
                  class="tab-btn">
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="mode === 'signup'"
                  (click)="setMode('signup')"
                  [class.active]="mode === 'signup'"
                  class="tab-btn">
                  Create
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div *ngIf="error" class="error-banner" role="alert">
              <app-icon name="sparkles" className="h-4 w-4 shrink-0 text-rose-500"></app-icon>
              <span>{{ error }}</span>
            </div>

            <!-- Form -->
            <form (ngSubmit)="submit()" novalidate class="auth-form">
              <!-- Email Input (Common) -->
              <div class="form-group">
                <label for="auth-email" class="form-label">
                  Email address
                </label>
                <div class="input-wrap">
                  <input
                    id="auth-email"
                    [(ngModel)]="form.email"
                    (blur)="lookupEmail()"
                    name="email"
                    type="email"
                    autocomplete="email"
                    class="app-input email-input"
                    placeholder="name@example.com"
                    required />
                  <span class="input-badge" [class.checking]="lookupPending">
                    {{ lookupPending ? 'Checking…' : 'Smart check' }}
                  </span>
                </div>
                <div
                  *ngIf="emailHint"
                  class="hint-box"
                  [class.hint-success]="emailHintKind === 'success'"
                  [class.hint-warning]="emailHintKind === 'warning'">
                  {{ emailHint }}
                </div>
              </div>

              <!-- Signup-Only: Full Name -->
              <div *ngIf="mode === 'signup'" class="form-group">
                <label for="auth-name" class="form-label">Full name</label>
                <div class="input-wrap">
                  <input
                    id="auth-name"
                    [(ngModel)]="form.name"
                    name="name"
                    type="text"
                    autocomplete="name"
                    class="app-input"
                    placeholder="e.g. Alex Morgan"
                    required />
                </div>
              </div>

              <!-- Password Input -->
              <div class="form-group">
                <div class="label-row">
                  <label for="auth-password" class="form-label">Password</label>
                  <span *ngIf="mode === 'signup' && form.password && form.password.length < 8" class="label-helper text-amber-600">
                    {{ 8 - form.password.length }} more characters
                  </span>
                </div>
                <div class="input-wrap">
                  <input
                    id="auth-password"
                    [(ngModel)]="form.password"
                    name="password"
                    [type]="showPassword ? 'text' : 'password'"
                    [autocomplete]="mode === 'signup' ? 'new-password' : 'current-password'"
                    class="app-input password-input"
                    [placeholder]="mode === 'signup' ? 'At least 8 characters' : 'Enter your password'"
                    required />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="toggle-eye"
                    [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                    <app-icon [name]="showPassword ? 'visibility_off' : 'visibility'" className="h-4 w-4"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Signup-Only: Confirm Password -->
              <div *ngIf="mode === 'signup'" class="form-group">
                <div class="label-row">
                  <label for="auth-confirm-password" class="form-label">Confirm password</label>
                  <span *ngIf="form.confirmPassword && form.password !== form.confirmPassword" class="label-helper text-rose-600">
                    Passwords do not match
                  </span>
                  <span *ngIf="form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8" class="label-helper text-emerald-600">
                    Match confirmed ✓
                  </span>
                </div>
                <div class="input-wrap">
                  <input
                    id="auth-confirm-password"
                    [(ngModel)]="form.confirmPassword"
                    name="confirmPassword"
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    class="app-input password-input"
                    placeholder="Repeat your password"
                    required />
                  <button
                    type="button"
                    (click)="showConfirmPassword = !showConfirmPassword"
                    class="toggle-eye"
                    [attr.aria-label]="showConfirmPassword ? 'Hide password' : 'Show password'">
                    <app-icon [name]="showConfirmPassword ? 'visibility_off' : 'visibility'" className="h-4 w-4"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Signup-Only: Optional Profile Details Accordion -->
              <div *ngIf="mode === 'signup'" class="profile-accordion">
                <button
                  type="button"
                  (click)="profileDetailsExpanded = !profileDetailsExpanded"
                  class="accordion-trigger">
                  <div class="trigger-meta">
                    <span class="trigger-title">Profile details</span>
                    <span class="trigger-subtitle">Optional lifestyle and baseline indicators</span>
                  </div>
                  <span class="optional-pill">
                    {{ profileDetailsExpanded ? 'Hide' : 'Optional' }}
                  </span>
                </button>

                <div *ngIf="profileDetailsExpanded" class="accordion-body">
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label for="auth-age" class="form-label-sub">Age</label>
                      <input
                        id="auth-age"
                        [(ngModel)]="form.age"
                        name="age"
                        type="number"
                        min="1"
                        max="120"
                        class="app-input-sub"
                        placeholder="e.g. 28" />
                    </div>
                    <div class="form-group">
                      <label for="auth-gender" class="form-label-sub">Gender</label>
                      <input
                        id="auth-gender"
                        [(ngModel)]="form.gender"
                        name="gender"
                        type="text"
                        class="app-input-sub"
                        placeholder="e.g. Female, Male, Non-binary" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="form-group">
                      <label for="auth-occupation" class="form-label-sub">Occupation</label>
                      <input
                        id="auth-occupation"
                        [(ngModel)]="form.occupation"
                        name="occupation"
                        type="text"
                        class="app-input-sub"
                        placeholder="e.g. Designer, Student" />
                    </div>
                    <div class="form-group">
                      <label for="auth-sleep" class="form-label-sub">Sleep habits</label>
                      <input
                        id="auth-sleep"
                        [(ngModel)]="form.sleepHabits"
                        name="sleepHabits"
                        type="text"
                        class="app-input-sub"
                        placeholder="e.g. 7 hours, irregular" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="auth-lifestyle" class="form-label-sub">Lifestyle indicators</label>
                    <input
                      id="auth-lifestyle"
                      [(ngModel)]="form.lifestyleIndicators"
                      name="lifestyleIndicators"
                      type="text"
                      class="app-input-sub"
                      placeholder="e.g. screen time, caffeine, yoga" />
                  </div>

                  <div class="form-group">
                    <label for="auth-stress" class="form-label-sub">Stress triggers</label>
                    <input
                      id="auth-stress"
                      [(ngModel)]="form.stressIndicators"
                      name="stressIndicators"
                      type="text"
                      class="app-input-sub"
                      placeholder="e.g. deadlines, exams, low rest" />
                  </div>
                </div>
              </div>

              <!-- Submit Action Button -->
              <button
                type="submit"
                [disabled]="pending || lookupPending"
                class="btn-primary auth-submit-btn">
                <span *ngIf="pending" class="submit-spinner" aria-hidden="true"></span>
                <span>
                  {{ pending ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In' }}
                </span>
              </button>

              <!-- Switch Mode Footer Link -->
              <div class="mode-switch-row">
                <span *ngIf="mode === 'signup'">Already have an account?</span>
                <span *ngIf="mode === 'login'">New to MindTrack?</span>
                <button
                  type="button"
                  (click)="setMode(mode === 'signup' ? 'login' : 'signup')"
                  class="mode-switch-link">
                  {{ mode === 'signup' ? 'Sign in instead' : 'Create an account' }}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* ======= Page Wrapper ======= */
    .auth-page {
      width: 100%;
      min-height: calc(100vh - 8rem);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 0 2.5rem;
      box-sizing: border-box;
    }

    .auth-layout {
      width: 100%;
      max-width: 68rem;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      align-items: center;
      box-sizing: border-box;
    }

    @media (min-width: 1024px) {
      .auth-layout {
        grid-template-columns: 1.05fr 0.95fr;
        gap: 2.25rem;
        padding: 1.5rem 0;
      }
    }

    /* ======= Welcome Column ======= */
    .auth-welcome {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.5rem;
      border-radius: 1.75rem;
      border: 1px solid rgba(255, 255, 255, 0.65);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(240, 247, 253, 0.62) 60%, rgba(224, 236, 246, 0.5));
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 48px -32px rgba(15, 23, 42, 0.22);
      box-sizing: border-box;
    }

    @media (min-width: 640px) {
      .auth-welcome {
        padding: 2rem;
        border-radius: 2rem;
      }
    }

    @media (min-width: 1024px) {
      .auth-welcome {
        padding: 2.5rem;
      }
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-logo {
      display: grid;
      place-items: center;
      height: 2.65rem;
      width: 2.65rem;
      border-radius: 0.85rem;
      background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      box-shadow: 0 12px 24px -10px rgba(129, 52, 175, 0.55);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-title {
      font-family: "Sora", sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
    }

    .brand-subtitle {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 2px;
    }

    .welcome-copy {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.9);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
      box-shadow: 0 4px 12px -6px rgba(15, 23, 42, 0.12);
    }

    .welcome-heading {
      font-family: "Sora", sans-serif;
      font-size: clamp(1.4rem, 2.8vw, 2.15rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.25;
      color: #0f172a;
      margin: 0;
    }

    .welcome-desc {
      font-size: 0.925rem;
      line-height: 1.68;
      color: #334155;
      margin: 0;
    }

    /* Abstract visual */
    .wellness-visual {
      position: relative;
      height: 7.5rem;
      border-radius: 1.35rem;
      background: linear-gradient(135deg, rgba(238, 245, 255, 0.85), rgba(253, 242, 248, 0.75));
      border: 1px solid rgba(255, 255, 255, 0.8);
      overflow: hidden;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    @media (min-width: 640px) {
      .wellness-visual {
        display: flex;
      }
    }

    .visual-orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(28px);
      pointer-events: none;
    }

    .orb-1 {
      width: 8rem;
      height: 8rem;
      background: rgba(221, 42, 123, 0.18);
      top: -2rem;
      left: 10%;
    }

    .orb-2 {
      width: 7rem;
      height: 7rem;
      background: rgba(14, 165, 233, 0.2);
      bottom: -2rem;
      right: 15%;
    }

    .visual-card-float {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      justify-content: center;
      z-index: 1;
    }

    .float-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.95);
      border-radius: 999px;
      padding: 0.4rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #1e293b;
      box-shadow: 0 8px 18px -8px rgba(15, 23, 42, 0.15);
    }

    .welcome-features {
      display: none;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    @media (min-width: 1024px) {
      .welcome-features {
        display: grid;
      }
    }

    .feature-item {
      padding: 0.9rem 1rem;
      border-radius: 1.15rem;
      background: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.7);
    }

    .feature-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
    }

    .feature-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.25rem 0 0.2rem;
    }

    .feature-desc {
      font-size: 0.78rem;
      line-height: 1.5;
      color: #475569;
    }

    .welcome-disclaimer {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      background: rgba(241, 245, 249, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      line-height: 1.55;
      color: #64748b;
    }

    .welcome-disclaimer p {
      margin: 0;
    }

    /* ======= Auth Form Column ======= */
    .auth-panel {
      width: 100%;
      box-sizing: border-box;
    }

    .auth-card {
      width: 100%;
      padding: 1.35rem;
      border-radius: 1.75rem;
      border: 1px solid rgba(255, 255, 255, 0.75);
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 255, 0.78) 55%, rgba(240, 247, 253, 0.72));
      backdrop-filter: blur(24px);
      box-shadow: 0 24px 60px -28px rgba(15, 23, 42, 0.26);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    @media (min-width: 640px) {
      .auth-card {
        padding: 2rem;
        border-radius: 2rem;
        gap: 1.25rem;
      }
    }

    /* Tabs Header */
    .tabs-header {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    @media (min-width: 440px) {
      .tabs-header {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    .tabs-titles {
      flex: 1;
      min-width: 0;
    }

    .panel-kicker {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #64748b;
    }

    .panel-title {
      font-family: "Sora", sans-serif;
      font-size: clamp(1.2rem, 2.4vw, 1.45rem);
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #0f172a;
      margin: 0.25rem 0 0.15rem;
    }

    .panel-subtitle {
      font-size: 0.82rem;
      line-height: 1.45;
      color: #64748b;
      margin: 0;
    }

    .tab-toggle {
      display: inline-flex;
      align-self: flex-start;
      border-radius: 999px;
      background: rgba(226, 232, 240, 0.75);
      padding: 3px;
      box-sizing: border-box;
    }

    .tab-btn {
      border: none;
      background: none;
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: all 180ms ease-out;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #1e293b;
    }

    .tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 4px 12px -3px rgba(15, 23, 42, 0.18);
    }

    /* Error alert */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      border-radius: 1rem;
      background: rgba(254, 242, 242, 0.95);
      border: 1px solid rgba(254, 202, 202, 0.9);
      padding: 0.75rem 1rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #b91c1c;
      box-sizing: border-box;
    }

    /* Form Fields */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
      width: 100%;
      box-sizing: border-box;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      width: 100%;
      box-sizing: border-box;
    }

    .form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #1e293b;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label-helper {
      font-size: 0.72rem;
      font-weight: 700;
    }

    .input-wrap {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    .app-input {
      width: 100%;
      height: 3rem;
      border-radius: 1.15rem;
      border: 1px solid rgba(148, 163, 184, 0.36);
      background: rgba(255, 255, 255, 0.88);
      padding: 0 1rem;
      font-size: 0.9rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
      transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .app-input:focus {
      background: #ffffff;
      border-color: rgba(221, 42, 123, 0.65);
      box-shadow: 0 0 0 3px rgba(221, 42, 123, 0.12);
    }

    .email-input {
      padding-right: 6.25rem;
    }

    .password-input {
      padding-right: 3rem;
    }

    .input-badge {
      position: absolute;
      right: 0.85rem;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
      pointer-events: none;
    }

    .input-badge.checking {
      color: #6366f1;
    }

    .toggle-eye {
      position: absolute;
      right: 0.35rem;
      height: 2.35rem;
      width: 2.35rem;
      display: grid;
      place-items: center;
      border: none;
      background: none;
      color: #64748b;
      cursor: pointer;
      border-radius: 0.75rem;
      transition: color 150ms ease, background-color 150ms ease;
    }

    .toggle-eye:hover {
      color: #0f172a;
      background-color: rgba(241, 245, 249, 0.7);
    }

    .hint-box {
      margin-top: 0.35rem;
      padding: 0.5rem 0.85rem;
      border-radius: 0.85rem;
      font-size: 0.78rem;
      line-height: 1.45;
    }

    .hint-success {
      background: rgba(236, 253, 245, 0.9);
      border: 1px solid rgba(167, 243, 208, 0.7);
      color: #065f46;
    }

    .hint-warning {
      background: rgba(254, 243, 199, 0.9);
      border: 1px solid rgba(253, 230, 138, 0.7);
      color: #92400e;
    }

    /* Accordion */
    .profile-accordion {
      border-radius: 1.25rem;
      border: 1px solid rgba(226, 232, 240, 0.9);
      background: rgba(248, 251, 255, 0.65);
      padding: 0.75rem 1rem;
      box-sizing: border-box;
    }

    .accordion-trigger {
      width: 100%;
      border: none;
      background: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.25rem 0;
      text-align: left;
    }

    .trigger-meta {
      display: flex;
      flex-direction: column;
    }

    .trigger-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0f172a;
    }

    .trigger-subtitle {
      font-size: 0.72rem;
      color: #64748b;
    }

    .optional-pill {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #475569;
      background: rgba(226, 232, 240, 0.85);
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .accordion-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.85rem;
      padding-top: 0.75rem;
      border-top: 1px dashed rgba(203, 213, 225, 0.8);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.65rem;
    }

    @media (min-width: 480px) {
      .form-grid-2 {
        grid-template-columns: 1fr 1fr;
      }
    }

    .form-label-sub {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
    }

    .app-input-sub {
      width: 100%;
      height: 2.5rem;
      border-radius: 0.85rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      background: rgba(255, 255, 255, 0.9);
      padding: 0 0.85rem;
      font-size: 0.82rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
      transition: border-color 150ms ease;
    }

    .app-input-sub:focus {
      border-color: rgba(221, 42, 123, 0.6);
      background: #ffffff;
    }

    /* Submit Button */
    .auth-submit-btn {
      width: 100%;
      height: 3.15rem;
      border-radius: 1.25rem;
      font-size: 0.925rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      cursor: pointer;
      border: none;
      margin-top: 0.35rem;
      box-sizing: border-box;
    }

    .auth-submit-btn:disabled {
      opacity: 0.62;
      cursor: not-allowed;
      filter: none;
      transform: none;
    }

    .submit-spinner {
      display: inline-block;
      width: 1.1rem;
      height: 1.1rem;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Footer switch */
    .mode-switch-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.25rem;
      flex-wrap: wrap;
    }

    .mode-switch-link {
      background: none;
      border: none;
      color: #8134af;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 150ms ease;
    }

    .mode-switch-link:hover {
      color: #dd2a7b;
    }

    /* Mobile fine-tuning */
    @media (max-width: 360px) {
      .auth-card {
        padding: 1.15rem 0.95rem;
      }
      .panel-title {
        font-size: 1.15rem;
      }
      .tab-btn {
        padding: 0.4rem 0.75rem;
        font-size: 0.72rem;
      }
    }
  `]
})
export class AuthPageComponent {
  mode: "signup" | "login" = "signup";
  pending = false;
  lookupPending = false;
  error = "";
  emailHint = "";
  emailHintKind: "success" | "warning" = "success";
  profileDetailsExpanded = false;
  showPassword = false;
  showConfirmPassword = false;

  form = {
    name: "",
    age: null as number | null,
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  setMode(mode: "signup" | "login"): void {
    this.mode = mode;
    this.error = "";
    this.showPassword = false;
    this.showConfirmPassword = false;

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
          this.emailHint = `Account recognized${result.name ? ` for ${result.name}` : ""}. Sign in to continue.`;
          this.profileDetailsExpanded = false;
        } else {
          this.emailHintKind = "warning";
          this.emailHint = "No account found for this email. Ready to create your account!";
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
          this.error = err?.error?.error || "Invalid email or password. Please try again.";
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
        gender: this.form.gender?.trim() || undefined,
        occupation: this.form.occupation?.trim() || undefined,
        sleepHabits: this.form.sleepHabits?.trim() || undefined,
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
      return "Please enter a valid email address.";
    }

    if (!this.form.password) {
      return "Please enter your password.";
    }

    if (this.mode === "signup") {
      if (!this.form.name.trim()) {
        return "Please enter your name.";
      }

      if (this.form.password.length < 8) {
        return "Password must be at least 8 characters long.";
      }

      if (this.form.confirmPassword && this.form.password !== this.form.confirmPassword) {
        return "Passwords do not match. Please verify both fields.";
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
