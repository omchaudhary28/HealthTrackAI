import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, OnDestroy, computed, signal } from "@angular/core";
import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { AppRuntimeService } from "./core/services/app-runtime.service";
import { ROUTE_THEMES, RouteTheme } from "./core/theme/route-themes";
import { FloatingChatbotComponent } from "./shared/components/floating-chatbot.component";
import { IconComponent, MindtrackIconName } from "./shared/components/icon.component";
import { SideNavComponent } from "./shared/components/side-nav.component";
import { TopNavComponent } from "./shared/components/top-nav.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FloatingChatbotComponent, IconComponent, SideNavComponent, TopNavComponent],
  animations: [
    trigger("routeAnimations", [
      transition("* <=> *", [
        query(":enter, :leave", style({ position: "absolute", width: "100%" }), { optional: true }),
        query(":enter", style({ opacity: 0, transform: "translateY(12px)" }), { optional: true }),
        query(":leave", style({ opacity: 1, transform: "translateY(0)" }), { optional: true }),
        group([
          query(":leave", animate("220ms ease", style({ opacity: 0, transform: "translateY(-8px)" })), {
            optional: true
          }),
          query(":enter", animate("340ms 40ms ease", style({ opacity: 1, transform: "translateY(0)" })), {
            optional: true
          })
        ])
      ])
    ])
  ],
  template: `
    <div class="mindtrack-shell min-h-screen" [ngStyle]="themeStyles()">
      <div class="pointer-events-none fixed inset-0 -z-30 transition-opacity duration-700" [style.background]="activeTheme().shellGradient"></div>
      <div
        *ngIf="fadingTheme()"
        class="pointer-events-none fixed inset-0 -z-20 transition-opacity duration-700"
        [style.background]="fadingTheme()!.shellGradient"
        [class.opacity-100]="showFadingTheme()"
        [class.opacity-0]="!showFadingTheme()"></div>

      <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div class="mindtrack-ambient mindtrack-ambient-a" [style.background]="activeTheme().orbA"></div>
        <div class="mindtrack-ambient mindtrack-ambient-b" [style.background]="activeTheme().orbB"></div>
        <div class="mindtrack-grain"></div>
      </div>

      <app-top-nav [publicMode]="isPublicRoute()" (toggleNav)="navOpen = !navOpen"></app-top-nav>

      <div *ngIf="runtimeIssue() as issue" class="mx-auto max-w-[1340px] px-4 pt-4 sm:px-6 lg:px-8">
        <div
          class="rounded-[1.7rem] border border-amber-200 bg-amber-50/95 px-5 py-4 text-sm text-amber-900 shadow-[0_22px_40px_-30px_rgba(146,64,14,0.35)]"
          role="alert">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="font-semibold">{{ issue.title }}</div>
              <div class="mt-1 leading-6 text-amber-800">{{ issue.message }}</div>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                (click)="clearRuntimeIssue()"
                class="rounded-full border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 transition hover:bg-amber-100">
                Dismiss
              </button>
              <button
                type="button"
                (click)="reloadApp()"
                class="rounded-full bg-amber-900 px-4 py-2 font-semibold text-white transition hover:bg-amber-950">
                Reload
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isPublicRoute()" class="lg:hidden">
        <div
          class="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-200"
          [class.pointer-events-none]="!navOpen"
          [class.opacity-0]="!navOpen"
          (click)="closeNav()"></div>
        <div
          class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-white/60 bg-white/92 shadow-2xl backdrop-blur-xl transition-transform duration-300"
          [class.-translate-x-full]="!navOpen">
          <app-side-nav [inDrawer]="true" (requestClose)="closeNav()"></app-side-nav>
        </div>
      </div>

      <div class="mx-auto flex max-w-[1340px] gap-8 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <app-side-nav *ngIf="!isPublicRoute()"></app-side-nav>
        <main class="min-w-0 flex-1">
          <div [@routeAnimations]="prepareRoute(outlet)" class="relative">
            <router-outlet #outlet="outlet"></router-outlet>
          </div>
        </main>
      </div>

      <div *ngIf="!isPublicRoute()" class="mobile-tabbar lg:hidden">
        <nav class="mx-auto grid max-w-2xl grid-cols-5 gap-2 px-4 py-3">
          <a
            *ngFor="let item of mobileNavItems"
            [routerLink]="item.link"
            class="mobile-tab-link"
            [class.mobile-tab-link-active]="isActiveLink(item.link, item.exact)">
            <app-icon [name]="item.icon" className="h-5 w-5"></app-icon>
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </div>

      <app-floating-chatbot></app-floating-chatbot>
    </div>
  `,
  styles: [
    `
      .mindtrack-shell {
        position: relative;
        color: var(--mt-ink);
      }

      .mindtrack-ambient {
        position: absolute;
        border-radius: 999px;
        filter: blur(90px);
        transition: background 0.7s ease, transform 0.7s ease, opacity 0.7s ease;
      }

      .mindtrack-ambient-a {
        top: 2rem;
        left: -6rem;
        height: 26rem;
        width: 26rem;
        opacity: 0.72;
      }

      .mindtrack-ambient-b {
        right: -8rem;
        top: 14rem;
        height: 24rem;
        width: 24rem;
        opacity: 0.62;
      }

      .mindtrack-grain {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 30%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent 28%),
          linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
        background-size: auto, auto, 28px 28px, 28px 28px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.2));
        opacity: 0.55;
      }

      .mobile-tabbar {
        position: fixed;
        inset-inline: 0;
        bottom: 0;
        z-index: 35;
        border-top: 1px solid rgba(15, 23, 42, 0.08);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(24px);
      }

      .mobile-tab-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        border-radius: 1.25rem;
        padding: 0.65rem 0.35rem;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        color: rgba(71, 85, 105, 0.86);
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
      }

      .mobile-tab-link-active {
        background: rgba(255, 255, 255, 0.95);
        color: var(--mt-accent-strong);
        box-shadow: 0 18px 28px -24px rgba(15, 23, 42, 0.35);
      }

      .mobile-tab-link:active {
        transform: translateY(1px);
      }
    `
  ]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  navOpen = false;
  readonly mobileNavItems: Array<{ label: string; link: string; icon: MindtrackIconName; exact?: boolean }> = [
    { label: "Home", link: "/dashboard", icon: "dashboard", exact: true },
    { label: "Mood", link: "/mood", icon: "mood", exact: true },
    { label: "Journal", link: "/journal", icon: "journal", exact: true },
    { label: "Stats", link: "/progress", icon: "progress", exact: true },
    { label: "Community", link: "/community", icon: "community", exact: true }
  ];
  readonly runtimeIssue = this.runtimeService.runtimeIssue;

  readonly activeTheme = signal<RouteTheme>(ROUTE_THEMES.landing);
  readonly fadingTheme = signal<RouteTheme | null>(null);
  readonly showFadingTheme = signal(false);
  readonly themeStyles = computed(() => {
    const theme = this.activeTheme();
    return {
      "--mt-accent": theme.accent,
      "--mt-accent-strong": theme.accentStrong,
      "--mt-accent-soft": theme.accentSoft,
      "--mt-active-surface": theme.activeSurface,
      "--mt-tab-gradient": theme.tabGradient
    };
  });

  private readonly routerSub: Subscription;
  private fadeTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly router: Router,
    private readonly runtimeService: AppRuntimeService
  ) {
    this.applyTheme(this.resolveThemeKey());

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeNav();
        this.applyTheme(this.resolveThemeKey());
      });
  }

  ngAfterViewInit(): void {
    this.runtimeService.markReady();
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }
  }

  isPublicRoute(): boolean {
    return (
      this.router.url === "/" ||
      this.router.url.startsWith("/auth") ||
      this.router.url.startsWith("/landing") ||
      this.router.url.startsWith("/about")
    );
  }

  prepareRoute(outlet: RouterOutlet): string | null {
    return outlet?.activatedRouteData?.["animation"] || null;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  clearRuntimeIssue(): void {
    this.runtimeService.clearError();
  }

  reloadApp(): void {
    this.runtimeService.reload();
  }

  isActiveLink(link: string, exact = false): boolean {
    const currentUrl = this.router.url.split("?")[0];
    return exact ? currentUrl === link : currentUrl === link || currentUrl.startsWith(`${link}/`);
  }

  private resolveThemeKey(): string {
    let snapshot = this.router.routerState.snapshot.root;

    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }

    return snapshot.data?.["themeKey"] || "default";
  }

  private applyTheme(themeKey: string): void {
    const nextTheme = ROUTE_THEMES[themeKey] || ROUTE_THEMES.default;
    const currentTheme = this.activeTheme();

    if (currentTheme.key === nextTheme.key) {
      return;
    }

    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }

    this.fadingTheme.set(currentTheme);
    this.showFadingTheme.set(true);
    this.activeTheme.set(nextTheme);

    queueMicrotask(() => this.showFadingTheme.set(false));

    this.fadeTimer = setTimeout(() => {
      this.fadingTheme.set(null);
    }, 760);
  }
}

