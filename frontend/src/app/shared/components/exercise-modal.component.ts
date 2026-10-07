import { CommonModule, isPlatformBrowser } from "@angular/common";
import { animate, style, transition, trigger } from "@angular/animations";
import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID, effect } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ExerciseModalService } from "../../core/services/exercise-modal.service";
import { ExercisesService } from "../../core/services/exercises.service";
import { BoxBreathingComponent } from "./box-breathing.component";
import { IconComponent } from "./icon.component";

@Component({
  selector: "app-exercise-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, BoxBreathingComponent, IconComponent],
  animations: [
    trigger("exerciseOverlay", [
      transition(":enter", [style({ opacity: 0 }), animate("220ms ease-out", style({ opacity: 1 }))]),
      transition(":leave", [animate("180ms ease-in", style({ opacity: 0 }))])
    ]),
    trigger("exercisePanel", [
      transition(":enter", [style({ opacity: 0 }), animate("220ms ease-out", style({ opacity: 1 }))]),
      transition(":leave", [animate("180ms ease-in", style({ opacity: 0 }))])
    ])
  ],
  template: `
    <ng-container *ngIf="exerciseModal.isOpen() && exerciseModal.selectedExercise() as activeExercise">
      <div class="overlay" @exerciseOverlay (click)="closeModal()"></div>

      <div
        class="modal rounded-[1.75rem] border border-white/60 bg-white/96 shadow-2xl backdrop-blur sm:rounded-[2.25rem]"
        @exercisePanel
        [style.view-transition-name]="exerciseModal.transitionName()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="activeExercise.title">
        <div class="sticky top-0 z-10 border-b border-white/60 bg-white/88 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div class="flex items-start justify-between gap-3">
            <div class="mt-card-brand">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                <app-icon [name]="activeExercise.category === 'breathing' ? 'spa' : activeExercise.category === 'stress-release' ? 'activity' : 'heartbeat'" className="text-base"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">{{ label(activeExercise.category) }} | {{ activeExercise.durationMinutes }} min</div>
                <div class="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{{ activeExercise.title }}</div>
              </div>
            </div>
            <button
              type="button"
              (click)="closeModal()"
              class="btn-outline inline-flex h-10 w-10 items-center justify-center rounded-2xl"
              aria-label="Close">
              <app-icon name="arrow" className="text-sm rotate-45"></app-icon>
            </button>
          </div>
        </div>

        <div class="px-4 py-4 sm:px-6 sm:py-6">
          <div class="exercise-layout">
            <div class="space-y-5">
              <div class="exercise-note p-5">
                <div class="mt-card-kicker">Why</div>
                <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.purpose || activeExercise.description }}</p>
              </div>

              <div class="exercise-note p-5">
                <div class="mt-card-kicker">What you get</div>
                <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.expectedOutcome || "A calmer next step and a little more room to breathe." }}</p>
              </div>

              <div *ngIf="activeExercise.benefits?.length" class="exercise-note p-5">
                <div class="mt-card-kicker">Benefits</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span *ngFor="let benefit of activeExercise.benefits" class="mt-chip">
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <div *ngIf="activeExercise.instructions?.length" class="exercise-note p-5">
                <div class="mt-card-kicker">Steps</div>
                <ol class="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <li *ngFor="let step of activeExercise.instructions; let i = index" class="flex gap-3">
                    <div class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">{{ i + 1 }}</div>
                    <div>{{ step }}</div>
                  </li>
                </ol>
              </div>
            </div>

            <div class="space-y-5">
              <div *ngIf="activeExercise.whyRecommended" class="exercise-note p-5">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="sparkles" className="text-base"></app-icon>
                  </div>
                  <div>
                    <div class="mt-card-kicker">AI note</div>
                    <p class="mt-card-copy mt-2 text-sm">{{ activeExercise.whyRecommended }}</p>
                  </div>
                </div>
              </div>

              <div *ngIf="activeExercise.category === 'breathing'" class="breathing-card-shell">
                <app-box-breathing></app-box-breathing>
              </div>

              <div class="mt-card p-5">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="feedback" className="text-base"></app-icon>
                  </div>
                  <div>
                    <div class="mt-card-kicker">Quick feedback</div>
                    <div class="mt-card-copy mt-2 text-sm">Tell the recommender how this felt.</div>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="mt-card-kicker">How'd it feel?</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      *ngFor="let rating of [1,2,3,4,5]"
                      type="button"
                      (click)="feedbackRating = rating"
                      class="mt-chip transition"
                      [class.bg-slate-900]="feedbackRating === rating"
                      [class.border-slate-900]="feedbackRating === rating"
                      [class.text-white]="feedbackRating === rating">
                      {{ rating }}/5
                    </button>
                  </div>
                </div>

                <label class="mt-4 block text-sm font-medium text-slate-600">
                  What changed after this?
                  <textarea [(ngModel)]="resultAfter" rows="3" class="app-textarea mt-2" placeholder="Example: Less tense. More clear."></textarea>
                </label>

                <label class="mt-4 block text-sm font-medium text-slate-600">
                  Optional note
                  <textarea [(ngModel)]="feedbackText" rows="3" class="app-textarea mt-2" placeholder="Anything worth remembering?"></textarea>
                </label>

                <div *ngIf="completionSuccess" class="mt-success-pop mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Saved. Future picks will learn from this.
                </div>

                <button type="button" (click)="completeActiveExercise()" [disabled]="completionPending" class="btn-primary mt-5 w-full rounded-2xl px-5 py-4 text-sm font-semibold disabled:opacity-60">
                  {{ completionPending ? "Saving..." : "Mark complete" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(20, 30, 40, 0.22);
        backdrop-filter: blur(3px);
        z-index: 1000;
      }

      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(92vw, 900px);
        max-height: 88vh;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1001;
        /* Mobile safe padding if needed */
        box-sizing: border-box;
      }
    `
  ]
})
export class ExerciseModalComponent implements AfterViewInit, OnDestroy {
  feedbackRating = 4;
  feedbackText = "";
  resultAfter = "";
  completionPending = false;
  completionSuccess = false;
  private hostPlaceholder: Comment | null = null;
  private hostOriginalParent: Node | null = null;
  private hostOriginalNextSibling: Node | null = null;

  constructor(
    public readonly exerciseModal: ExerciseModalService,
    private readonly exercisesService: ExercisesService,
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    effect(() => {
      const isOpen = this.exerciseModal.isOpen();
      const selectedExercise = this.exerciseModal.selectedExercise();
      if (isOpen && selectedExercise) {
        this.resetFormState();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.elementRef.nativeElement;
    const parent = host.parentNode;

    if (!parent) {
      return;
    }

    this.hostOriginalParent = parent;
    this.hostOriginalNextSibling = host.nextSibling;
    this.hostPlaceholder = document.createComment("exercise-modal-host");
    parent.insertBefore(this.hostPlaceholder, host);
    document.body.appendChild(host);
  }

  ngOnDestroy(): void {
    this.exerciseModal.close();

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.elementRef.nativeElement;

    if (this.hostOriginalParent && host.parentNode === document.body) {
      if (this.hostOriginalNextSibling && this.hostOriginalNextSibling.parentNode === this.hostOriginalParent) {
        this.hostOriginalParent.insertBefore(host, this.hostOriginalNextSibling);
      } else if (this.hostPlaceholder && this.hostPlaceholder.parentNode === this.hostOriginalParent) {
        this.hostOriginalParent.insertBefore(host, this.hostPlaceholder);
      } else {
        this.hostOriginalParent.appendChild(host);
      }
    }

    if (this.hostPlaceholder?.parentNode) {
      this.hostPlaceholder.parentNode.removeChild(this.hostPlaceholder);
    }

    this.hostPlaceholder = null;
    this.hostOriginalParent = null;
    this.hostOriginalNextSibling = null;
  }

  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: KeyboardEvent): void {
    if (!this.exerciseModal.isOpen()) {
      return;
    }

    event.preventDefault();
    this.closeModal();
  }

  closeModal(): void {
    this.resetFormState();
    this.exerciseModal.close();
  }

  completeActiveExercise(): void {
    const exercise = this.exerciseModal.selectedExercise();
    if (!exercise || this.completionPending) {
      return;
    }

    this.completionPending = true;

    this.exercisesService
      .complete({
        exerciseKey: exercise.key,
        exerciseTitle: exercise.title,
        category: exercise.category,
        durationMinutes: exercise.durationMinutes,
        source: exercise.whyRecommended ? "recommended" : "library",
        feedbackRating: this.feedbackRating,
        feedbackText: this.feedbackText.trim() || undefined,
        resultAfter: this.resultAfter.trim() || undefined,
        whyRecommended: exercise.whyRecommended,
        expectedOutcome: exercise.expectedOutcome
      })
      .subscribe({
        next: () => {
          this.completionPending = false;
          this.completionSuccess = true;
          this.exerciseModal.notifyCompleted();
        },
        error: () => {
          this.completionPending = false;
          this.closeModal();
        }
      });
  }

  label(value: string): string {
    return (value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private resetFormState(): void {
    this.feedbackRating = 4;
    this.feedbackText = "";
    this.resultAfter = "";
    this.completionPending = false;
    this.completionSuccess = false;
  }
}
