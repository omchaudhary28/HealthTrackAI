import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IconComponent, MindtrackIconName } from "./icon.component";

@Component({
  selector: "app-side-nav",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <aside
      [class]="
        inDrawer
          ? 'h-full w-72 max-w-[85vw] bg-white/90 p-5 shadow-2xl backdrop-blur'
          : 'sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_24px_60px_-40px_rgba(32,50,71,0.45)] backdrop-blur lg:block'
      ">
      <div class="mb-6 flex items-center justify-between">
        <a routerLink="/" (click)="onNavigate()" class="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-50">
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">MT</div>
          <div>
            <div class="text-sm font-semibold text-slate-900">MindTrack AI</div>
            <div class="text-xs text-slate-500">Self-reflection, not diagnosis</div>
          </div>
        </a>
        <button
          *ngIf="inDrawer"
          type="button"
          (click)="requestClose.emit()"
          class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Close navigation">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <nav class="space-y-1">
        <a
          *ngFor="let item of items"
          [routerLink]="item.link"
          routerLinkActive="nav-link-active bg-slate-50 text-slate-900 shadow-sm"
          [routerLinkActiveOptions]="{ exact: item.exact }"
          (click)="onNavigate()"
          class="nav-link group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900">
          <app-icon [name]="item.icon" className="h-5 w-5 text-slate-400 transition group-hover:text-slate-600"></app-icon>
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">{{ item.shortcut }}</span>
        </a>
      </nav>

      <div class="mt-6 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4 text-xs leading-6 text-slate-600">
        Private by default. Your check-ins and journaling stay in your account. MindTrack AI is not a medical diagnostic system.
      </div>
    </aside>
  `
})
export class SideNavComponent {
  @Input() inDrawer = false;
  @Output() requestClose = new EventEmitter<void>();

  items = [
    { label: "Dashboard", link: "/dashboard", icon: "dashboard" as MindtrackIconName, shortcut: "01", exact: true },
    { label: "Mental State", link: "/mental-state", icon: "insights" as MindtrackIconName, shortcut: "02", exact: true },
    { label: "Test Center", link: "/tests", icon: "tests" as MindtrackIconName, shortcut: "03", exact: false },
    { label: "Mood Calendar", link: "/mood", icon: "mood" as MindtrackIconName, shortcut: "04", exact: true },
    { label: "Journal", link: "/journal", icon: "journal" as MindtrackIconName, shortcut: "05", exact: true },
    { label: "Exercises", link: "/exercises", icon: "exercises" as MindtrackIconName, shortcut: "06", exact: true },
    { label: "Community", link: "/community", icon: "community" as MindtrackIconName, shortcut: "07", exact: true },
    { label: "Create Post", link: "/community/create", icon: "compose" as MindtrackIconName, shortcut: "08", exact: true },
    { label: "Progress", link: "/progress", icon: "progress" as MindtrackIconName, shortcut: "09", exact: true },
    { label: "Profile", link: "/profile", icon: "profile" as MindtrackIconName, shortcut: "10", exact: true },
    { label: "Feedback", link: "/feedback", icon: "feedback" as MindtrackIconName, shortcut: "11", exact: true }
  ];

  onNavigate(): void {
    if (this.inDrawer) {
      this.requestClose.emit();
    }
  }
}
