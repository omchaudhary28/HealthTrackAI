import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { IconComponent, MindtrackIconName } from "./icon.component";

@Component({
  selector: "app-side-nav",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <aside
      [class]="
        inDrawer
          ? 'flex h-full w-[min(18rem,84vw)] max-w-[84vw] flex-col bg-[rgba(238,245,251,0.94)] p-5 backdrop-blur-2xl'
          : 'sticky top-24 hidden h-[calc(100vh-7rem)] w-[17.5rem] shrink-0 flex-col rounded-[2rem] border border-black/6 bg-[rgba(238,245,251,0.82)] p-4 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-2xl lg:flex'
      ">
      <div class="mb-6 flex items-center justify-between gap-3 px-2">
        <a routerLink="/dashboard" (click)="onNavigate()" class="flex min-w-0 items-center gap-3 rounded-full transition hover:opacity-90">
          <div class="grid h-12 w-12 place-items-center rounded-[1.35rem] bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] text-sm font-black text-white shadow-[0_24px_44px_-28px_rgba(129,52,175,0.7)]">
            MT
          </div>
          <div class="min-w-0">
            <div class="truncate text-lg font-extrabold tracking-[-0.04em] text-slate-950">MindTrack</div>
            <div class="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">track first</div>
          </div>
        </a>

        <button
          *ngIf="inDrawer"
          type="button"
          (click)="requestClose.emit()"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-[rgba(247,250,254,0.94)] text-slate-700 shadow-sm transition hover:bg-white"
          aria-label="Close navigation">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-1 pb-4">
        <div class="space-y-1">
          <div class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Track first</div>
          <a
            *ngFor="let item of primaryItems"
            [routerLink]="item.link"
            routerLinkActive="social-nav-active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="onNavigate()"
            class="social-nav-item group flex items-center gap-3 rounded-[1.4rem] px-3 py-3 text-sm font-semibold text-slate-700">
            <span class="grid h-11 w-11 place-items-center rounded-[1rem] border border-black/5 bg-[rgba(247,250,254,0.92)] text-slate-600 transition group-hover:border-transparent group-hover:bg-slate-950 group-hover:text-white">
              <app-icon [name]="item.icon" className="h-5 w-5"></app-icon>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            <span *ngIf="item.badge" class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {{ item.badge }}
            </span>
          </a>
        </div>

        <div class="mt-6 space-y-1">
          <div class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Connect</div>
          <a
            *ngFor="let item of secondaryItems"
            [routerLink]="item.link"
            routerLinkActive="social-nav-active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="onNavigate()"
            class="social-nav-item group flex items-center gap-3 rounded-[1.4rem] px-3 py-3 text-sm font-semibold text-slate-700">
            <span class="grid h-11 w-11 place-items-center rounded-[1rem] border border-black/5 bg-[rgba(247,250,254,0.92)] text-slate-600 transition group-hover:border-transparent group-hover:bg-slate-950 group-hover:text-white">
              <app-icon [name]="item.icon" className="h-5 w-5"></app-icon>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          </a>
        </div>
      </div>

      <div *ngIf="isAuthenticated()" class="mt-4 rounded-[1.75rem] border border-black/5 bg-[rgba(246,250,254,0.84)] px-4 py-4 shadow-[0_24px_44px_-36px_rgba(15,23,42,0.2)]">
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">{{ initials() }}</span>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-950">{{ displayName() }}</div>
            <div class="truncate text-xs text-slate-500">{{ email() }}</div>
          </div>
        </div>

        <div class="mt-4 grid gap-2">
          <a routerLink="/profile" (click)="onNavigate()" class="btn-outline rounded-full px-4 py-2.5 text-center text-xs font-semibold">
            Profile
          </a>
          <button type="button" (click)="logout()" class="btn-outline rounded-full px-4 py-2.5 text-xs font-semibold">
            Sign out
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SideNavComponent {
  @Input() inDrawer = false;
  @Output() requestClose = new EventEmitter<void>();

  readonly primaryItems: Array<{ label: string; link: string; icon: MindtrackIconName; badge?: string; exact: boolean }> = [
    { label: "Dashboard", link: "/dashboard", icon: "dashboard", exact: true },
    { label: "Mood Check-In", link: "/mood", icon: "mood", exact: true },
    { label: "Journal", link: "/journal", icon: "journal", exact: true },
    { label: "Progress", link: "/progress", icon: "progress", exact: true }
  ];

  readonly secondaryItems: Array<{ label: string; link: string; icon: MindtrackIconName; exact: boolean }> = [
    { label: "Exercises", link: "/exercises", icon: "exercises", exact: true },
    { label: "Test Center", link: "/tests", icon: "tests", exact: false },
    { label: "Mental State", link: "/mental-state", icon: "insights", exact: true },
    { label: "Profile", link: "/profile", icon: "profile", exact: false },
    { label: "Community", link: "/community", icon: "community", exact: true },
    { label: "Create Post", link: "/community/create", icon: "compose", exact: true },
    { label: "Feedback", link: "/feedback", icon: "feedback", exact: true }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  displayName(): string {
    return this.authService.currentUser()?.name || "Account";
  }

  email(): string {
    return this.authService.currentUser()?.email || "Signed in";
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

  onNavigate(): void {
    if (this.inDrawer) {
      this.requestClose.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.onNavigate();
    this.router.navigateByUrl("/");
  }
}
