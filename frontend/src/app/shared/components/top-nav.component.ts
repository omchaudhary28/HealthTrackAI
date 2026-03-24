import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-top-nav",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-30 border-b border-white/50 bg-white/60 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <button
            *ngIf="!publicMode"
            type="button"
            (click)="toggleNav.emit()"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 17h16"></path>
            </svg>
          </button>

          <a routerLink="/" class="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-50">
            <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">MT</div>
            <div class="min-w-0">
              <div class="truncate text-lg font-semibold text-slate-900">MindTrack AI</div>
              <div class="truncate text-xs text-slate-500">Comfort-first wellness support, not diagnosis</div>
            </div>
          </a>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <a
            *ngIf="publicMode"
            routerLink="/about"
            class="btn-outline hidden rounded-full px-4 py-2 text-sm font-semibold md:inline-flex">
            About
          </a>

          <div class="hidden rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs text-slate-500 md:block">
            Private assessment, journaling, and progress tracking
          </div>

          <a
            *ngIf="publicMode && !isAuthenticated()"
            routerLink="/auth"
            class="btn-primary rounded-full px-5 py-2 text-sm font-semibold">
            Start gently
          </a>
          <a
            *ngIf="publicMode && isAuthenticated()"
            routerLink="/dashboard"
            class="btn-primary rounded-full px-5 py-2 text-sm font-semibold">
            Open dashboard
          </a>

          <ng-container *ngIf="!publicMode">
            <a
              routerLink="/profile"
              class="btn-outline hidden rounded-full px-4 py-2 text-sm font-semibold sm:inline-flex">
              {{ displayName() }}
            </a>
            <button
              type="button"
              (click)="logout()"
              class="btn-outline rounded-full px-5 py-2 text-sm font-semibold">
              Sign out
            </button>
          </ng-container>
        </div>
      </div>
    </header>
  `
})
export class TopNavComponent {
  @Input() publicMode = false;
  @Output() toggleNav = new EventEmitter<void>();

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  displayName(): string {
    return this.authService.currentUser()?.name || "Account";
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/");
  }
}
