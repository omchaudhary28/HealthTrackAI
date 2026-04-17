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
    <header class="sticky top-0 z-30 border-b-2 border-slate-900/80 bg-[rgba(241,248,255,0.88)] backdrop-blur-2xl">
      <div class="mx-auto flex w-full max-w-[var(--mt-shell-max)] items-center justify-between gap-2 px-[var(--mt-shell-gutter)] py-2.5 sm:gap-3 sm:py-3">
        <div class="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <button
            *ngIf="!publicMode"
            type="button"
            (click)="toggleNav.emit()"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-slate-900/80 bg-[rgba(247,250,254,0.96)] text-slate-700 shadow-[0_5px_0_rgba(15,23,42,0.72)] transition hover:bg-white lg:hidden"
            aria-label="Open navigation">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 17h16"></path>
            </svg>
          </button>

          <a routerLink="/" class="flex min-w-0 items-center gap-2 rounded-full px-1 py-1 transition hover:bg-white/55 sm:gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-[1.1rem] border-2 border-slate-900/80 bg-[linear-gradient(135deg,#ff5f00,#ec4899,#0ea5e9)] text-sm font-black text-white shadow-[0_6px_0_rgba(15,23,42,0.75)] sm:h-11 sm:w-11 sm:rounded-[1.25rem]">
              MT
            </div>
            <div class="min-w-0">
              <div class="truncate text-[0.98rem] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-lg">MindTrack AI</div>
              <div class="hidden truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 min-[390px]:block sm:text-[11px] sm:tracking-[0.22em]">
                {{ publicMode ? "comic mode wellness" : "mission control" }}
              </div>
            </div>
          </a>
        </div>

        <div *ngIf="!publicMode" class="hidden flex-1 lg:flex">
          <div class="mx-auto flex w-full max-w-xl items-center gap-3 rounded-full border-2 border-slate-900/70 bg-[rgba(248,252,255,0.94)] px-4 py-3 text-sm text-slate-500 shadow-[0_6px_0_rgba(15,23,42,0.65)]">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
            <span>Jump into your next mission: mood, dump, calm, or scan</span>
            <span class="ml-auto rounded-full border border-slate-900/70 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Quick action</span>
          </div>
        </div>

        <div class="ml-2 flex shrink-0 items-center gap-2 sm:gap-3">
          <ng-container *ngIf="publicMode; else signedInActions">
            <a routerLink="/about" class="btn-outline nav-tablet-up rounded-full px-4 py-2.5 text-sm font-semibold">About</a>
            <a
              *ngIf="!isAuthenticated()"
              routerLink="/auth"
              class="btn-primary shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              Play
            </a>
            <a
              *ngIf="isAuthenticated()"
              routerLink="/dashboard"
              class="btn-primary shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              Enter hub
            </a>
          </ng-container>

          <ng-template #signedInActions>
            <a routerLink="/mood" class="btn-outline nav-tablet-up rounded-full px-4 py-2.5 text-sm font-semibold">
              Mood ping
            </a>
            <a routerLink="/community/create" class="btn-outline nav-desktop-wide rounded-full px-4 py-2.5 text-sm font-semibold">
              Send update
            </a>
            <a
              routerLink="/profile"
              [attr.aria-label]="'Open profile for ' + displayName()"
              class="inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full border-2 border-slate-900/75 bg-[rgba(247,250,254,0.95)] px-2 py-2 text-sm font-semibold text-slate-800 shadow-[0_5px_0_rgba(15,23,42,0.68)] transition hover:border-slate-900 sm:min-w-0 sm:justify-start sm:pr-4">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-[11px] font-bold text-white">{{ initials() }}</span>
              <span class="nav-name">{{ displayName() }}</span>
            </a>
            <button type="button" (click)="logout()" class="btn-outline nav-tablet-up rounded-full px-3 py-2.5 text-sm font-semibold sm:px-4">
              Exit
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
