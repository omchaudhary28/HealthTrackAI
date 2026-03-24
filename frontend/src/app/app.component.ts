import { CommonModule } from "@angular/common";
import { Component, OnDestroy, computed, signal } from "@angular/core";
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { filter, Subscription } from "rxjs";
import { ROUTE_THEMES, RouteTheme } from "./core/theme/route-themes";
import { FloatingChatbotComponent } from "./shared/components/floating-chatbot.component";
import { SideNavComponent } from "./shared/components/side-nav.component";
import { TopNavComponent } from "./shared/components/top-nav.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, FloatingChatbotComponent, SideNavComponent, TopNavComponent],
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
        <div class="mindtrack-orb mindtrack-orb-a" [style.background]="activeTheme().orbA"></div>
        <div class="mindtrack-orb mindtrack-orb-b" [style.background]="activeTheme().orbB"></div>
        <div class="mindtrack-grid"></div>
      </div>

      <app-top-nav [publicMode]="isPublicRoute()" (toggleNav)="navOpen = !navOpen"></app-top-nav>

      <div *ngIf="!isPublicRoute()" class="lg:hidden">
        <div
          class="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-200"
          [class.pointer-events-none]="!navOpen"
          [class.opacity-0]="!navOpen"
          (click)="closeNav()"></div>
        <div
          class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-white/60 bg-white/88 shadow-2xl backdrop-blur-xl transition-transform duration-300"
          [class.-translate-x-full]="!navOpen">
          <app-side-nav [inDrawer]="true" (requestClose)="closeNav()"></app-side-nav>
        </div>
      </div>

      <div class="mx-auto flex max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <app-side-nav *ngIf="!isPublicRoute()"></app-side-nav>
        <main class="min-w-0 flex-1">
          <div class="relative">
            <div class="mindtrack-panel-glow"></div>
            <div [@routeAnimations]="prepareRoute(outlet)" class="relative">
              <router-outlet #outlet="outlet"></router-outlet>
            </div>
          </div>
        </main>
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

      .mindtrack-orb {
        position: absolute;
        border-radius: 999px;
        filter: blur(70px);
        transition: background 0.7s ease, transform 0.7s ease, opacity 0.7s ease;
      }

      .mindtrack-orb-a {
        top: 4rem;
        left: -8rem;
        height: 22rem;
        width: 22rem;
        opacity: 0.95;
      }

      .mindtrack-orb-b {
        right: -6rem;
        top: 18rem;
        height: 20rem;
        width: 20rem;
        opacity: 0.9;
      }

      .mindtrack-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
        background-size: 80px 80px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent 75%);
        opacity: 0.28;
      }

      .mindtrack-panel-glow {
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 2.2rem;
        background:
          radial-gradient(circle at 15% 12%, var(--mt-accent-soft), transparent 26%),
          radial-gradient(circle at 82% 8%, rgba(255, 255, 255, 0.48), transparent 30%);
        opacity: 0.9;
        z-index: -1;
      }
    `
  ]
})
export class AppComponent implements OnDestroy {
  navOpen = false;

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

  constructor(private readonly router: Router) {
    this.applyTheme(this.resolveThemeKey());

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeNav();
        this.applyTheme(this.resolveThemeKey());
      });
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
