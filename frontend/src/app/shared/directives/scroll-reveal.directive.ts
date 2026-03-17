import { AfterViewInit, Directive, ElementRef, Inject, Input, OnDestroy, Renderer2 } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";

@Directive({
  selector: "[appScrollReveal]",
  standalone: true
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.2;

  private observer?: IntersectionObserver;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.elementRef.nativeElement;
    this.renderer.addClass(el, "reveal");

    if (this.revealDelay > 0) {
      this.renderer.setStyle(el, "transition-delay", `${this.revealDelay}ms`);
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          this.renderer.addClass(el, "reveal-visible");
          this.observer?.unobserve(el);
        });
      },
      { threshold: this.revealThreshold }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

