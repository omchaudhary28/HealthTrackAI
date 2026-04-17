import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { TestAnswer, TestDefinition, TestsService } from "../../core/services/tests.service";
import { IconComponent } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

const CHOICES = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" }
];

@Component({
  selector: "app-test-runner-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, RouterLink, IconComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="mt-card mt-card-hover page-hero">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="mt-card-brand max-w-3xl">
            <div class="mt-card-icon">
              <app-icon name="tests" className="text-xl"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">{{ test()?.category || "Assessment" }}</div>
              <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{{ test()?.title || "Loading test..." }}</h1>
              <p class="mt-card-copy mt-3 text-sm sm:text-base">
                {{ test()?.description || "Quick self-check only. Not a diagnosis." }}
              </p>
            </div>
          </div>
          <a routerLink="/tests" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Back to tests</a>
        </div>

        <div *ngIf="test()" class="mt-6">
          <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span>Progress</span>
            <span>{{ progressPercent() }}%</span>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-white/70">
            <div class="h-full rounded-full bg-[linear-gradient(90deg,var(--mt-accent-strong),var(--mt-accent),#2dd4bf)] transition-all duration-300" [style.width.%]="progressPercent()"></div>
          </div>
        </div>
      </div>

      <div *ngIf="error()" class="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
        {{ error() }}
      </div>

      <div *ngIf="result(); else questionnaire" class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="mt-card mt-card-hover p-5 sm:p-6">
          <div class="mt-card-brand">
            <div class="mt-card-icon">
              <app-icon name="analytics" className="text-lg"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Results</div>
              <div class="mt-card-copy mt-2 text-sm">Your assessment snapshot and suggested direction.</div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <div class="mt-card-soft p-5">
              <div class="mt-card-kicker">Score</div>
              <div class="mt-card-stat mt-3 text-slate-900">{{ displayedScore() }} / 100</div>
            </div>
            <div *ngIf="classification()" class="mt-card-soft p-5">
              <div class="mt-card-kicker">State</div>
              <div class="mt-3 text-2xl font-semibold text-slate-900">{{ classification()?.mental_state }}</div>
              <div class="mt-card-copy mt-2 text-sm">{{ classification()?.description }}</div>
            </div>
            <div *ngIf="testResult()" class="mt-card-soft p-5">
              <div class="mt-card-kicker">Type</div>
              <div class="mt-3 text-2xl font-semibold text-slate-900">{{ testResult()?.result_type }}</div>
              <div class="mt-card-copy mt-2 text-sm">{{ testResult()?.description }}</div>
            </div>
          </div>

          <div *ngIf="classification()?.recommendations?.length" class="mt-6">
            <div class="mt-card-kicker">Try next</div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let item of classification()?.recommendations" class="mt-card-soft p-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.strengths?.length" class="mt-6">
            <div class="mt-card-kicker">Strengths</div>
            <div class="mt-3 space-y-2">
              <div *ngFor="let item of testResult()?.strengths" class="mt-card-soft p-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.suggestions?.length" class="mt-6">
            <div class="mt-card-kicker">Suggestions</div>
            <div class="mt-3 space-y-2">
              <div *ngFor="let item of testResult()?.suggestions" class="mt-card-soft p-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.recommended_exercises?.length" class="mt-6">
            <div class="mt-card-kicker">Exercises</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span *ngFor="let item of testResult()?.recommended_exercises" class="mt-chip">
                {{ item.replaceAll("_", " ") }}
              </span>
            </div>
          </div>

          <div class="mt-card-soft mt-6 p-5 text-sm text-slate-600">
            {{ result()?.disclaimer || "MindTrack gives wellness support only." }}
          </div>
        </div>

        <div class="mt-card mt-card-hover p-5 sm:p-6">
          <div class="mt-card-brand">
            <div class="mt-card-icon">
              <app-icon name="target" className="text-lg"></app-icon>
            </div>
            <div>
              <div class="mt-card-kicker">Next steps</div>
              <div class="mt-card-copy mt-2 text-sm">Keep the flow moving while the result is fresh.</div>
            </div>
          </div>
          <div class="mt-5 space-y-3">
            <a routerLink="/dashboard" class="btn-primary block rounded-2xl px-4 py-4 text-center text-sm font-semibold">Open dashboard</a>
            <button type="button" (click)="restart()" class="btn-outline w-full rounded-2xl px-4 py-4 text-sm font-semibold">
              Retake this test
            </button>
          </div>
        </div>
      </div>

      <ng-template #questionnaire>
        <div *ngIf="test()" class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div class="mt-card mt-card-hover p-5 sm:p-6">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span>Question {{ index() + 1 }} of {{ totalQuestions() }}</span>
              <span *ngIf="test()?.scoringScale">{{ test()?.scoringScale }}</span>
            </div>

            <div class="mt-5 text-lg font-semibold text-slate-900 sm:text-xl">{{ currentQuestion()?.text }}</div>
            <div class="mt-5 grid gap-3 min-[430px]:grid-cols-2 lg:grid-cols-5">
              <button
                *ngFor="let choice of choices"
                type="button"
                (click)="select(choice.value)"
                [class]="choiceClass(choice.value)"
                class="rounded-[1.35rem] border px-4 py-4 text-left text-sm font-medium transition">
                {{ choice.label }}
              </button>
            </div>

            <div class="mt-card-soft mt-4 p-4 text-sm leading-7 text-slate-600">
              {{ answerHint() }}
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button type="button" (click)="back()" [disabled]="index() === 0 || pending()" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
                Back
              </button>
              <button
                *ngIf="index() < totalQuestions() - 1"
                type="button"
                (click)="next()"
                [disabled]="!hasAnswer() || pending()"
                class="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">
                Next
              </button>
              <button
                *ngIf="index() === totalQuestions() - 1"
                type="button"
                (click)="submit()"
                [disabled]="!canSubmit() || pending()"
                class="btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">
                {{ pending() ? "Submitting..." : "Submit" }}
              </button>
            </div>
          </div>

          <div class="mt-card mt-card-hover p-5 sm:p-6">
            <div class="mt-card-brand">
              <div class="mt-card-icon">
                <app-icon name="shield" className="text-lg"></app-icon>
              </div>
              <div>
                <div class="mt-card-kicker">Keep in mind</div>
                <p class="mt-card-copy mt-3 text-sm">
                  This is for self-reflection and habit support. It is not treatment or diagnosis.
                </p>
              </div>
            </div>
            <div class="mt-card-soft mt-5 p-5 text-sm text-slate-700">
              Tip: answer from your usual week, not one weird day.
            </div>
          </div>
        </div>
      </ng-template>
    </section>
  `
})
export class TestRunnerPageComponent implements OnInit, OnDestroy {
  private readonly routeSub = new Subscription();

  choices = CHOICES;
  test = signal<TestDefinition | null>(null);
  index = signal(0);
  pending = signal(false);
  error = signal("");
  result = signal<any | null>(null);
  answers = signal<Record<string, number>>({});

  totalQuestions = computed(() => this.test()?.questions?.length || 0);
  currentQuestion = computed(() => this.test()?.questions?.[this.index()] || null);
  progressPercent = computed(() => {
    const total = this.totalQuestions();
    if (!total) {
      return 0;
    }

    return Math.round(((this.index() + (this.hasAnswer() ? 1 : 0)) / total) * 100);
  });
  displayedScore = computed(() => {
    const payload = this.result();
    if (!payload) {
      return 0;
    }

    return payload.mental_score ?? payload.mentalScore ?? 0;
  });
  classification = computed(() => {
    const payload = this.result();
    return payload?.classification || null;
  });
  testResult = computed(() => {
    const payload = this.result();
    return payload?.result || null;
  });

  constructor(
    private readonly testsService: TestsService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.routeSub.add(
      this.route.paramMap.subscribe((params) => {
        const key = params.get("testKey") || "baseline";
        this.loadTest(key);
      })
    );
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  private loadTest(testKey: string): void {
    this.error.set("");
    this.result.set(null);
    this.pending.set(false);
    this.index.set(0);
    this.answers.set({});

    this.testsService.getTest(testKey).subscribe({
      next: (test) => this.test.set(test),
      error: () => {
        this.test.set(null);
        this.error.set("Couldn't load this test right now.");
      }
    });
  }

  private currentAnswerValue(): number | undefined {
    const question = this.currentQuestion();
    if (!question) {
      return undefined;
    }

    return this.answers()[question.id];
  }

  hasAnswer(): boolean {
    return typeof this.currentAnswerValue() === "number";
  }

  canSubmit(): boolean {
    const test = this.test();
    if (!test) {
      return false;
    }

    const map = this.answers();
    return test.questions.every((question) => typeof map[question.id] === "number");
  }

  choiceClass(value: number): string {
    const selected = this.currentAnswerValue() === value;
    return selected
      ? "border-slate-900 bg-slate-900 text-white shadow-[0_20px_34px_-24px_rgba(15,23,42,0.45)]"
      : "border-white/70 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white";
  }

  select(value: number): void {
    const question = this.currentQuestion();
    if (!question || this.pending()) {
      return;
    }

    this.answers.set({ ...this.answers(), [question.id]: value });
  }

  answerHint(): string {
    switch (this.currentAnswerValue()) {
      case 1:
        return "This barely fits your recent experience.";
      case 2:
        return "This shows up sometimes, not a lot.";
      case 3:
        return "Mixed or unsure is valid.";
      case 4:
        return "This shows up fairly often lately.";
      case 5:
        return "This feels strong or frequent lately.";
      default:
        return "Go with your usual week, not one weird day.";
    }
  }

  next(): void {
    if (!this.hasAnswer()) {
      return;
    }

    this.index.set(Math.min(this.index() + 1, this.totalQuestions() - 1));
  }

  back(): void {
    this.index.set(Math.max(this.index() - 1, 0));
  }

  submit(): void {
    const testKey = this.test()?.key;
    if (!testKey || !this.canSubmit() || this.pending()) {
      return;
    }

    const answers: TestAnswer[] = this.test()!.questions.map((question) => ({
      questionId: question.id,
      value: this.answers()[question.id]
    }));

    this.pending.set(true);
    this.testsService.submitTest(testKey, answers).subscribe({
      next: (payload) => {
        this.result.set(payload);
        this.pending.set(false);

        if (testKey === "baseline") {
          this.authService.markBaselineComplete();
          this.authService.refreshMe().subscribe({ error: () => undefined });
        }
      },
      error: (err) => {
        this.error.set(err?.error?.error || "Couldn't submit this test right now.");
        this.pending.set(false);
      }
    });
  }

  restart(): void {
    const key = this.test()?.key;
    if (!key) {
      this.router.navigateByUrl("/tests");
      return;
    }

    this.loadTest(key);
  }
}
