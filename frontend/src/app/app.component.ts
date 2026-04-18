import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, NgZone, OnDestroy, computed, signal } from "@angular/core";
import { animate, group, query, style, transition, trigger } from "@angular/animations";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { AppRuntimeService } from "./core/services/app-runtime.service";
import { ROUTE_THEMES, RouteTheme } from "./core/theme/route-themes";
import { FloatingChatbotComponent } from "./shared/components/floating-chatbot.component";
import { IconComponent, MindtrackIconName } from "./shared/components/icon.component";
import { SideNavComponent } from "./shared/components/side-nav.component";
import { TopNavComponent } from "./shared/components/top-nav.component";

interface AmbientParticle {
  id: number;
  style: Record<string, string>;
}

const AMBIENT_PARTICLES: AmbientParticle[] = [
  buildParticle(1, 6, 16, 6, 16, -14, 13.8, -3, 0.2),
  buildParticle(2, 16, 30, 9, -18, -12, 17.2, -5, 0.24),
  buildParticle(3, 24, 12, 5, 14, 20, 11.6, -2, 0.17),
  buildParticle(4, 33, 42, 8, -10, 16, 15.9, -7, 0.19),
  buildParticle(5, 44, 24, 12, 19, -10, 18.5, -10, 0.22),
  buildParticle(6, 52, 64, 7, -15, -18, 12.4, -4, 0.18),
  buildParticle(7, 61, 34, 6, 12, 14, 14.8, -8, 0.21),
  buildParticle(8, 70, 50, 11, -22, 12, 19.3, -11, 0.16),
  buildParticle(9, 81, 22, 5, 10, -18, 10.9, -6, 0.2),
  buildParticle(10, 88, 44, 9, -16, 19, 16.7, -9, 0.18),
  buildParticle(11, 74, 74, 8, 14, -16, 13.6, -5, 0.17),
  buildParticle(12, 58, 84, 5, -12, 12, 11.2, -1, 0.16),
  buildParticle(13, 38, 78, 10, 21, -8, 17.8, -7, 0.2),
  buildParticle(14, 20, 70, 7, -12, 15, 14.4, -4, 0.19)
];

function buildParticle(
  id: number,
  left: number,
  top: number,
  size: number,
  driftX: number,
  driftY: number,
  duration: number,
  delay: number,
  opacity: number
): AmbientParticle {
  return {
    id,
    style: {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: `${opacity}`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      "--mt-particle-drift-x": `${driftX}px`,
      "--mt-particle-drift-y": `${driftY}px`
    }
  };
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FloatingChatbotComponent, IconComponent, SideNavComponent, TopNavComponent],
  animations: [
    trigger("routeAnimations", [
      transition("* <=> *", [
        query(":enter, :leave", style({ position: "absolute", inset: 0, width: "100%" }), { optional: true }),
        query(":enter", style({ opacity: 0, transform: "translateY(10px)" }), { optional: true }),
        query(":leave", style({ opacity: 1, transform: "translateY(0)" }), { optional: true }),
        group([
          query(":leave", animate("200ms ease-in", style({ opacity: 0, transform: "translateY(6px)" })), {
            optional: true
          }),
          query(":enter", animate("260ms 20ms ease-out", style({ opacity: 1, transform: "translateY(0)" })), {
            optional: true
          })
        ])
      ])
    ])
  ],
  template: `
    <div class="app-container mindtrack-shell min-h-screen w-full overflow-x-hidden" [ngStyle]="themeStyles()">
      <div class="pointer-events-none fixed inset-0 -z-30 transition-opacity duration-700" [style.background]="activeTheme().shellGradient"></div>
      <div
        *ngIf="fadingTheme()"
        class="pointer-events-none fixed inset-0 -z-20 transition-opacity duration-700"
        [style.background]="fadingTheme()!.shellGradient"
        [class.opacity-100]="showFadingTheme()"
        [class.opacity-0]="!showFadingTheme()"></div>
      <div class="mindtrack-liquid-gradient-layer"></div>

      <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div class="mindtrack-ambient mindtrack-ambient-a" [style.background]="activeTheme().orbA"></div>
        <div class="mindtrack-ambient mindtrack-ambient-b" [style.background]="activeTheme().orbB"></div>
        <div class="mindtrack-particle-field">
          <span *ngFor="let particle of backgroundParticles; trackBy: trackParticle" class="mindtrack-particle" [ngStyle]="particle.style"></span>
        </div>
        <div class="mindtrack-grain"></div>
      </div>

      <app-top-nav [publicMode]="isPublicRoute()" (toggleNav)="navOpen = !navOpen"></app-top-nav>

      <div *ngIf="runtimeIssue() as issue" class="mx-auto w-full max-w-[var(--mt-shell-max)] px-[var(--mt-shell-gutter)] pt-4">
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
          class="fixed inset-y-0 left-0 z-50 w-[min(18rem,84vw)] border-r border-white/55 bg-[rgba(237,244,251,0.94)] shadow-2xl backdrop-blur-xl transition-transform duration-300"
          [class.-translate-x-full]="!navOpen">
          <app-side-nav [inDrawer]="true" (requestClose)="closeNav()"></app-side-nav>
        </div>
      </div>

      <div class="mx-auto flex w-full max-w-[var(--mt-shell-max)] min-w-0 gap-3 px-[var(--mt-shell-gutter)] pb-[calc(var(--mt-safe-bottom)+1rem)] pt-3 sm:gap-4 sm:pt-4 lg:gap-8 lg:pb-10 lg:pt-8">
        <app-side-nav *ngIf="!isPublicRoute()"></app-side-nav>
        <main class="min-w-0 flex-1 overflow-x-hidden">
          <div [@routeAnimations]="prepareRoute(outlet)" class="route-stage relative w-full min-w-0 overflow-x-hidden">
            <router-outlet #outlet="outlet"></router-outlet>
          </div>
        </main>
      </div>

      <div *ngIf="!isPublicRoute()" class="mobile-tabbar lg:hidden">
        <nav class="mx-auto grid w-full max-w-xl grid-cols-5 gap-1.5 px-2.5 pb-[calc(0.7rem+env(safe-area-inset-bottom,0px))] pt-2 sm:gap-2 sm:px-4 sm:pt-3">
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
        width: 100%;
        overflow-x: hidden;
        color: var(--mt-ink);
        isolation: isolate;
      }

      .mindtrack-shell::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -16;
        pointer-events: none;
        background:
          radial-gradient(circle at 12% 18%, var(--mt-orb-a) 0, transparent 24%),
          radial-gradient(circle at 86% 14%, var(--mt-orb-b) 0, transparent 23%),
          radial-gradient(circle at 52% 88%, var(--mt-accent-soft) 0, transparent 28%);
        opacity: 0.92;
      }

      .mindtrack-liquid-gradient-layer {
        position: fixed;
        inset: -14%;
        z-index: -24;
        pointer-events: none;
        opacity: 0.45;
        background:
          radial-gradient(circle at 10% 18%, rgba(255, 255, 255, 0.62), transparent 42%),
          radial-gradient(circle at 86% 18%, var(--mt-accent-soft), transparent 54%),
          radial-gradient(circle at 46% 84%, rgba(129, 52, 175, 0.22), transparent 56%);
        filter: blur(18px) saturate(1.08);
        transform-origin: center;
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

      .mindtrack-particle-field {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      .mindtrack-particle {
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
        background:
          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.22) 44%, transparent 75%),
          radial-gradient(circle at center, var(--mt-accent-soft), transparent 70%);
        filter: blur(0.6px);
        transform: translate3d(0, 0, 0);
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
        padding-inline: max(0.4rem, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px));
        border-top: 1px solid rgba(15, 23, 42, 0.1);
        background: linear-gradient(180deg, rgba(236, 244, 251, 0.78), rgba(243, 248, 253, 0.94));
        backdrop-filter: blur(24px);
        box-shadow: 0 -20px 40px -34px rgba(15, 23, 42, 0.3);
      }

      .mobile-tab-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 3.8rem;
        gap: 0.22rem;
        border-radius: 1.1rem;
        padding: 0.55rem 0.2rem;
        font-size: 0.65rem;
        line-height: 1.1;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: rgba(71, 85, 105, 0.86);
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
      }

      .mobile-tab-link span {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mobile-tab-link-active {
        background: rgba(247, 250, 254, 0.98);
        color: var(--mt-accent-strong);
        box-shadow: 0 18px 28px -24px rgba(15, 23, 42, 0.35);
      }

      .mobile-tab-link:active {
        transform: translateY(1px);
      }

      .route-stage {
        min-width: 0;
      }

      .mindtrack-shell :where(main, section, article, form, aside) {
        min-width: 0;
      }

      @keyframes mtLiquidDrift {
        0%,
        100% {
          transform: translate3d(-2%, 0%, 0) scale(1.02);
        }
        50% {
          transform: translate3d(2.6%, -2.4%, 0) scale(1.08);
        }
      }

      @keyframes mtAmbientFloatA {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
          transform: translate3d(26px, -24px, 0) scale(1.05);
        }
      }

      @keyframes mtAmbientFloatB {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
          transform: translate3d(-30px, 18px, 0) scale(1.06);
        }
      }

      @keyframes mtParticleFloat {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(0.96);
        }
        45% {
          transform: translate3d(var(--mt-particle-drift-x), var(--mt-particle-drift-y), 0) scale(1.06);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .mindtrack-liquid-gradient-layer,
        .mindtrack-ambient-a,
        .mindtrack-ambient-b,
        .mindtrack-particle {
          animation: none;
        }
      }

      @media (max-width: 420px) {
        .mobile-tab-link {
          min-height: 3.65rem;
          border-radius: 1rem;
          padding-inline: 0.12rem;
          font-size: 0.61rem;
        }
      }

      @media (min-width: 640px) {
        .mobile-tab-link {
          min-height: 3.8rem;
          border-radius: 1.25rem;
          padding: 0.65rem 0.35rem;
          font-size: 0.68rem;
        }
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
    { label: "Feed", link: "/community", icon: "community", exact: true }
  ];
  readonly backgroundParticles = AMBIENT_PARTICLES;
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
      "--mt-tab-gradient": theme.tabGradient,
      "--mt-orb-a": theme.orbA,
      "--mt-orb-b": theme.orbB
    };
  });

  private readonly routerSub: Subscription;
  private readonly motionCleanupFns: Array<() => void> = [];
  private readonly tiltSelector =
    ".mt-card-hover, .glass-card, .theme-hero-card, .theme-bento-card, .theme-bento-card-soft, .theme-bento-card-strong";
  private readonly rippleSelector = ".btn-primary, .btn-outline, .mobile-tab-link, .social-nav-item, [data-ripple]";
  private tiltTarget: HTMLElement | null = null;
  private tiltPointerX = 0;
  private tiltPointerY = 0;
  private tiltFrameId: number | null = null;
  private prefersReducedMotion = false;
  private fadeTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly router: Router,
    private readonly runtimeService: AppRuntimeService,
    private readonly ngZone: NgZone
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

  trackParticle(_index: number, particle: AmbientParticle): number {
    return particle.id;
  }

  private setupInteractiveMotion(): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    this.teardownInteractiveMotion();

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange: EventListener = (event): void => {
      const motionEvent = event as MediaQueryListEvent;
      this.prefersReducedMotion = motionEvent.matches;
      if (motionEvent.matches) {
        this.resetTiltTarget(this.tiltTarget);
      }
    };

    this.registerMotionListener(reducedMotionQuery, "change", onReducedMotionChange);

    this.ngZone.runOutsideAngular(() => {
      const passiveOptions: AddEventListenerOptions = { passive: true };

      const onPointerMove: EventListener = (event): void => {
        const pointerEvent = event as PointerEvent;
        if (this.prefersReducedMotion || pointerEvent.pointerType === "touch") {
          return;
        }

        const surface = (pointerEvent.target as HTMLElement | null)?.closest<HTMLElement>(this.tiltSelector);
        if (!surface) {
          this.resetTiltTarget(this.tiltTarget);
          return;
        }

        this.tiltPointerX = pointerEvent.clientX;
        this.tiltPointerY = pointerEvent.clientY;

        if (this.tiltTarget !== surface) {
          this.resetTiltTarget(this.tiltTarget);
          this.tiltTarget = surface;
          this.tiltTarget.classList.add("mt-tilt-active");
        }

        if (this.tiltFrameId === null) {
          this.tiltFrameId = window.requestAnimationFrame(() => this.renderTiltFrame());
        }
      };

      const onPointerOut: EventListener = (event): void => {
        const pointerEvent = event as PointerEvent;
        const current = (pointerEvent.target as HTMLElement | null)?.closest<HTMLElement>(this.tiltSelector);
        if (!current || current !== this.tiltTarget) {
          return;
        }

        const next = pointerEvent.relatedTarget as Node | null;
        if (next && current.contains(next)) {
          return;
        }

        this.resetTiltTarget(current);
      };

      const onPointerDown: EventListener = (event): void => {
        const pointerEvent = event as PointerEvent;
        if (this.prefersReducedMotion) {
          return;
        }

        const target = (pointerEvent.target as HTMLElement | null)?.closest<HTMLElement>(this.rippleSelector);
        if (!target) {
          return;
        }

        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mt-ripple-x", `${pointerEvent.clientX - rect.left}px`);
        target.style.setProperty("--mt-ripple-y", `${pointerEvent.clientY - rect.top}px`);
        target.classList.remove("mt-ripple-active");
        void target.offsetWidth;
        target.classList.add("mt-ripple-active");
        window.setTimeout(() => target.classList.remove("mt-ripple-active"), 760);
      };

      const onAnimationEnd: EventListener = (event): void => {
        const animationEvent = event as AnimationEvent;
        if (animationEvent.animationName !== "mtRippleWave") {
          return;
        }

        const target = animationEvent.target as HTMLElement | null;
        target?.classList.remove("mt-ripple-active");
      };

      const onWindowBlur = (): void => this.resetTiltTarget(this.tiltTarget);

      this.registerMotionListener(document, "pointermove", onPointerMove, passiveOptions);
      this.registerMotionListener(document, "pointerout", onPointerOut, true);
      this.registerMotionListener(document, "pointerdown", onPointerDown, passiveOptions);
      this.registerMotionListener(document, "animationend", onAnimationEnd, true);
      this.registerMotionListener(window, "blur", onWindowBlur);
      this.registerMotionListener(window, "scroll", onWindowBlur, passiveOptions);
    });
  }

  private teardownInteractiveMotion(): void {
    while (this.motionCleanupFns.length) {
      const cleanup = this.motionCleanupFns.pop();
      cleanup?.();
    }

    if (typeof window !== "undefined" && this.tiltFrameId !== null) {
      window.cancelAnimationFrame(this.tiltFrameId);
    }

    this.tiltFrameId = null;
    this.resetTiltTarget(this.tiltTarget);
  }

  private renderTiltFrame(): void {
    this.tiltFrameId = null;

    if (!this.tiltTarget) {
      return;
    }

    const rect = this.tiltTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const pointerX = this.clamp((this.tiltPointerX - rect.left) / rect.width, 0, 1);
    const pointerY = this.clamp((this.tiltPointerY - rect.top) / rect.height, 0, 1);
    const normalizedX = pointerX * 2 - 1;
    const normalizedY = pointerY * 2 - 1;

    this.tiltTarget.style.setProperty("--mt-tilt-x", `${(-normalizedY * 4.2).toFixed(2)}deg`);
    this.tiltTarget.style.setProperty("--mt-tilt-y", `${(normalizedX * 5.6).toFixed(2)}deg`);
    this.tiltTarget.style.setProperty("--mt-shadow-x", `${(normalizedX * 11).toFixed(2)}px`);
    this.tiltTarget.style.setProperty("--mt-shadow-y", `${(normalizedY * 10).toFixed(2)}px`);
    this.tiltTarget.style.setProperty("--mt-reflect-x", `${(pointerX * 100).toFixed(2)}%`);
    this.tiltTarget.style.setProperty("--mt-reflect-y", `${(pointerY * 100).toFixed(2)}%`);
    this.tiltTarget.style.setProperty("--mt-glint-shift-x", `${(-normalizedX * 10).toFixed(2)}px`);
    this.tiltTarget.style.setProperty("--mt-glint-shift-y", `${(-normalizedY * 12).toFixed(2)}px`);
  }

  private resetTiltTarget(target: HTMLElement | null): void {
    if (!target) {
      return;
    }

    target.classList.remove("mt-tilt-active");
    target.style.removeProperty("--mt-tilt-x");
    target.style.removeProperty("--mt-tilt-y");
    target.style.removeProperty("--mt-shadow-x");
    target.style.removeProperty("--mt-shadow-y");
    target.style.removeProperty("--mt-reflect-x");
    target.style.removeProperty("--mt-reflect-y");
    target.style.removeProperty("--mt-glint-shift-x");
    target.style.removeProperty("--mt-glint-shift-y");

    if (this.tiltTarget === target) {
      this.tiltTarget = null;
    }
  }

  private registerMotionListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    target.addEventListener(type, listener, options);
    this.motionCleanupFns.push(() => target.removeEventListener(type, listener, options));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
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

