import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-top-nav",
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [
    `
      .nav-tablet-up {
        display: none;
      }

      .nav-desktop-wide {
        display: none;
      }

      .nav-name {
        display: none;
        max-width: 10rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (min-width: 640px) {
        .nav-name {
          display: inline;
        }
      }

      @media (min-width: 768px) {
        .nav-tablet-up {
          display: inline-flex;
        }
      }

      @media (min-width: 1280px) {
        .nav-desktop-wide {
          display: inline-flex;
        }
      }
    `
  ],
  template: `
    <header class="sticky top-0 z-30 border-b border-black/5 bg-white/84 backdrop-blur-2xl">
      <div class="mx-auto flex w-full max-w-[var(--mt-shell-max)] items-center justify-between gap-2 px-[var(--mt-shell-gutter)] py-2.5 sm:gap-3 sm:py-3">
        <div class="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <button
            *ngIf="!publicMode"
            type="button"
            (click)="toggleNav.emit()"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 17h16"></path>
            </svg>
          </button>

          <a routerLink="/" class="flex min-w-0 items-center gap-2 rounded-full px-1 py-1 transition hover:bg-white/70 sm:gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-[1.1rem] bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] text-sm font-black text-white shadow-[0_20px_40px_-24px_rgba(129,52,175,0.6)] sm:h-11 sm:w-11 sm:rounded-[1.25rem]">
              MT
            </div>
            <div class="min-w-0">
              <div class="truncate text-[0.98rem] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-lg">MindTrack</div>
              <div class="hidden truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 min-[390px]:block sm:text-[11px] sm:tracking-[0.22em]">
                {{ publicMode ? "wellness tracking" : "tracking first workspace" }}
              </div>
            </div>
          </a>
        </div>

        <div *ngIf="!publicMode" class="hidden flex-1 lg:flex">
          <div class="mx-auto flex w-full max-w-xl items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-400 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
            <span>Jump back into mood, journal, progress, or exercises</span>
            <span class="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Quick focus</span>
          </div>
        </div>

        <div class="ml-2 flex shrink-0 items-center gap-2 sm:gap-3">
          <ng-container *ngIf="publicMode; else signedInActions">
            <a routerLink="/about" class="btn-outline nav-tablet-up rounded-full px-4 py-2.5 text-sm font-semibold">About</a>
            <a
              *ngIf="!isAuthenticated()"
              routerLink="/auth"
              class="btn-primary shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              Start
            </a>
            <a
              *ngIf="isAuthenticated()"
              routerLink="/dashboard"
              class="btn-primary shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              Open app
            </a>
          </ng-container>

          <ng-template #signedInActions>
            <a routerLink="/mood" class="btn-outline nav-tablet-up rounded-full px-4 py-2.5 text-sm font-semibold">
              Log mood
            </a>
            <a routerLink="/community/create" class="btn-outline nav-desktop-wide rounded-full px-4 py-2.5 text-sm font-semibold">
              Create post
            </a>
            <a
              routerLink="/profile"
              [attr.aria-label]="'Open profile for ' + displayName()"
              class="inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-800 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)] transition hover:border-slate-300 sm:min-w-0 sm:justify-start sm:pr-4">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-[11px] font-bold text-white">{{ initials() }}</span>
              <span class="nav-name">{{ displayName() }}</span>
            </a>
            <button type="button" (click)="logout()" class="btn-outline nav-tablet-up rounded-full px-3 py-2.5 text-sm font-semibold sm:px-4">
              Sign out
            </button>
          </ng-template>
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

  initials(): string {
    const name = this.displayName();
    return name
      .split(/\s+/g)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "AC";
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/");
  }
}
