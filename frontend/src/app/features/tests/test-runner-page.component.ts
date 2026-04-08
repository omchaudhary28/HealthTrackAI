import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { TestAnswer, TestDefinition, TestsService } from "../../core/services/tests.service";

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
  imports: [ScrollRevealDirective, CommonModule, RouterLink],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="glass-card theme-hero-card page-hero">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{{ test()?.category || 'Assessment' }}</div>
              <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{{ test()?.title || 'Loading test...' }}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {{ test()?.description || 'This questionnaire supports self-reflection only and is not a medical diagnosis.' }}
              </p>
            </div>
            <a routerLink="/tests" class="btn-outline rounded-full px-5 py-3 text-sm font-semibold">Back to tests</a>
          </div>
          <div *ngIf="test()" class="mt-6">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span>Progress</span>
              <span>{{ progressPercent() }}%</span>
            </div>
            <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200/70">
              <div class="h-full rounded-full bg-[linear-gradient(90deg,var(--mt-accent-strong),var(--mt-accent),#2dd4bf)] transition-all duration-300" [style.width.%]="progressPercent()"></div>
            </div>
          </div>
        </div>

      <div *ngIf="error()" class="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
        {{ error() }}
      </div>

      <div *ngIf="result(); else questionnaire" class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
          <div class="text-sm font-medium text-slate-500">Results</div>
          <div class="mt-4 flex flex-wrap gap-3">
            <div class="rounded-3xl bg-slate-50 px-5 py-4">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mental score</div>
              <div class="mt-2 text-3xl font-semibold text-slate-900">{{ displayedScore() }} / 100</div>
            </div>
            <div *ngIf="classification()" class="rounded-3xl bg-[var(--mist)] px-5 py-4">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Detected mental state</div>
              <div class="mt-2 text-2xl font-semibold text-slate-900">{{ classification()?.mental_state }}</div>
              <div class="mt-2 text-sm leading-7 text-slate-600">{{ classification()?.description }}</div>
            </div>
            <div *ngIf="testResult()" class="rounded-3xl bg-[var(--mist)] px-5 py-4">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Result type</div>
              <div class="mt-2 text-2xl font-semibold text-slate-900">{{ testResult()?.result_type }}</div>
              <div class="mt-2 text-sm leading-7 text-slate-600">{{ testResult()?.description }}</div>
            </div>
          </div>

          <div *ngIf="classification()?.recommendations?.length" class="mt-6">
            <div class="text-sm font-medium text-slate-500">Recommended improvements</div>
            <div class="mt-4 space-y-3">
              <div *ngFor="let item of classification()?.recommendations" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.strengths?.length" class="mt-6">
            <div class="text-sm font-medium text-slate-500">Strengths</div>
            <div class="mt-3 space-y-2">
              <div *ngFor="let item of testResult()?.strengths" class="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.suggestions?.length" class="mt-6">
            <div class="text-sm font-medium text-slate-500">Growth suggestions</div>
            <div class="mt-3 space-y-2">
              <div *ngFor="let item of testResult()?.suggestions" class="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="testResult()?.recommended_exercises?.length" class="mt-6">
            <div class="text-sm font-medium text-slate-500">Recommended exercises</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span *ngFor="let item of testResult()?.recommended_exercises" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {{ item.replaceAll('_', ' ') }}
              </span>
            </div>
          </div>

          <div class="mt-6 rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-sm text-slate-600">
            {{ result()?.disclaimer || 'MindTrack AI provides wellness support and self-reflection tools only.' }}
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
          <div class="text-sm font-medium text-slate-500">Next steps</div>
          <div class="mt-4 space-y-3">
            <a routerLink="/dashboard" class="btn-primary block rounded-2xl px-4 py-4 text-center text-sm font-semibold">Open dashboard</a>
            <button type="button" (click)="restart()" class="btn-outline w-full rounded-2xl px-4 py-4 text-sm font-semibold">
              Retake this test
            </button>
          </div>
        </div>
      </div>

      <ng-template #questionnaire>
        <div *ngIf="test()" class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span>Question {{ index() + 1 }} of {{ totalQuestions() }}</span>
              <span *ngIf="test()?.scoringScale">{{ test()?.scoringScale }}</span>
            </div>

            <div class="mt-4 text-lg font-semibold text-slate-900 sm:text-xl">{{ currentQuestion()?.text }}</div>
            <div class="mt-5 grid gap-3 sm:grid-cols-5">
              <button
                *ngFor="let choice of choices"
                type="button"
                (click)="select(choice.value)"
                [class]="choiceClass(choice.value)"
                class="rounded-2xl border px-4 py-3 text-left text-sm font-medium transition sm:text-center">
                {{ choice.label }}
              </button>
            </div>

            <div class="mt-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
              {{ answerHint() }}
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button type="button" (click)="back()" [disabled]="index() === 0 || pending()" class="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
                Back
              </button>
              <button
                *ngIf="index() < totalQuestions() - 1"
                type="button"
                (click)="next()"
                [disabled]="!hasAnswer() || pending()"
                class="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                Next
              </button>
              <button
                *ngIf="index() === totalQuestions() - 1"
                type="button"
                (click)="submit()"
                [disabled]="!canSubmit() || pending()"
                class="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {{ pending() ? 'Submitting...' : 'Submit' }}
              </button>
            </div>
          </div>

          <div class="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div class="text-sm font-medium text-slate-500">Why this matters</div>
            <p class="mt-4 text-sm leading-7 text-slate-600">
              This assessment is designed for self-reflection and habit support. It cannot diagnose or treat mental health conditions.
            </p>
            <div class="mt-5 rounded-3xl bg-[var(--mist)] px-5 py-4 text-sm text-slate-700">
              Tip: Answer based on the last 7 to 14 days rather than one unusually good or bad moment.
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
        this.error.set("Unable to load this test right now. Please try again.");
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
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";
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
        return "This answer signals that the statement rarely fits your recent experience.";
      case 2:
        return "This suggests the pattern shows up occasionally but not strongly.";
      case 3:
        return "Neutral answers are useful when the pattern feels mixed or unclear.";
      case 4:
        return "This suggests the pattern shows up fairly often in your recent experience.";
      case 5:
        return "This signals the pattern feels strong or frequent lately.";
      default:
        return "Answer based on the last 7 to 14 days rather than one unusually good or bad moment.";
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
        this.error.set(err?.error?.error || "Unable to submit this test right now.");
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


