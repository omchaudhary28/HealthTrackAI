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
    if (!el.closest(".motion-zone")) {
      this.renderer.addClass(el, "reveal-visible");
      return;
    }

    this.renderer.addClass(el, "reveal");

    if (this.revealDelay > 0) {
      this.renderer.setStyle(el, "transition-delay", `${this.revealDelay}ms`);
    }

    if (shouldRevealImmediately(el)) {
      this.renderer.addClass(el, "reveal-visible");
      return;
    }

    const threshold = resolveThreshold(el, this.revealThreshold);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.intersectionRatio < threshold) {
            return;
          }
          this.renderer.addClass(el, "reveal-visible");
          this.observer?.unobserve(el);
        });
      },
      {
        threshold: [0, threshold],
        rootMargin: "0px 0px -8% 0px"
      }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

function shouldRevealImmediately(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  if (!viewportHeight) {
    return true;
  }

  return rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08;
}

function resolveThreshold(element: HTMLElement, requestedThreshold: number): number {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const elementHeight = element.getBoundingClientRect().height;
  const normalizedThreshold = clamp(requestedThreshold, 0.02, 0.35);

  if (!viewportHeight || !elementHeight) {
    return normalizedThreshold;
  }

  if (elementHeight >= viewportHeight * 0.9) {
    return Math.min(normalizedThreshold, 0.06);
  }

  return normalizedThreshold;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
