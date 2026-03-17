import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { animate, group, query, style, transition, trigger } from "@angular/animations";
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
          query(":leave", animate("200ms ease", style({ opacity: 0, transform: "translateY(-8px)" })), {
            optional: true
          }),
          query(":enter", animate("320ms 40ms ease", style({ opacity: 1, transform: "translateY(0)" })), {
            optional: true
          })
        ])
      ])
    ])
  ],
  template: `
    <div class="min-h-screen">
      <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(142,184,215,0.12),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(159,215,201,0.12),transparent_25%)]"></div>
      <app-top-nav [publicMode]="isPublicRoute()" (toggleNav)="navOpen = !navOpen"></app-top-nav>

      <div *ngIf="!isPublicRoute()" class="lg:hidden">
        <div
          class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-200"
          [class.pointer-events-none]="!navOpen"
          [class.opacity-0]="!navOpen"
          (click)="closeNav()"></div>
        <div
          class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-slate-200 bg-white/90 shadow-2xl backdrop-blur transition-transform duration-200"
          [class.-translate-x-full]="!navOpen">
          <app-side-nav [inDrawer]="true" (requestClose)="closeNav()"></app-side-nav>
        </div>
      </div>

      <div class="mx-auto flex max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <app-side-nav *ngIf="!isPublicRoute()"></app-side-nav>
        <main class="min-w-0 flex-1">
          <div class="relative">
            <div class="pointer-events-none absolute inset-0 -z-10 rounded-[2.25rem] bg-[radial-gradient(circle_at_20%_20%,rgba(142,184,215,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(216,214,239,0.18),transparent_40%)] opacity-70"></div>
            <div [@routeAnimations]="prepareRoute(outlet)" class="relative">
              <router-outlet #outlet="outlet"></router-outlet>
            </div>
          </div>
        </main>
      </div>
      <app-floating-chatbot></app-floating-chatbot>
    </div>
  `
})
export class AppComponent {
  navOpen = false;

  constructor(private readonly router: Router) {}

  isPublicRoute(): boolean {
    return this.router.url === "/" || this.router.url.startsWith("/auth") || this.router.url.startsWith("/landing");
  }

  prepareRoute(outlet: RouterOutlet): string | null {
    return outlet?.activatedRouteData?.["animation"] || null;
  }

  closeNav(): void {
    this.navOpen = false;
  }
}
