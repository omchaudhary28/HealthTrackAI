import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { JournalEntry, JournalInsights, JournalService } from "../../core/services/journal.service";

const PROMPTS = [
  "What is something that made you proud today, even if it felt small?",
  "What emotion showed up the most today, and what might it be protecting?",
  "If today had a headline, what would it be?",
  "What is one gentle thing you can do for yourself in the next hour?",
  "What thought kept returning, and what would a kinder version of it sound like?"
];

const COMMON_TAGS = ["calm", "stressed", "tired", "grateful", "overthinking", "social", "focus", "sleep", "self-kindness"];

@Component({
  selector: "app-journal-editor",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Journal</div>
          <div class="mt-1 text-xs leading-5 text-slate-500">A private space to reflect. MindTrack AI supports wellbeing habits only, not diagnosis.</div>
        </div>
        <button
          type="button"
          (click)="cyclePrompt()"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
          New prompt
        </button>
      </div>

      <div class="mt-4 rounded-2xl bg-[var(--mist)] px-4 py-4 text-sm leading-7 text-slate-700">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prompt</div>
        <div class="mt-2">{{ prompt() }}</div>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <label class="block text-sm font-semibold text-slate-800">
            Your entry
            <textarea
              [ngModel]="content()"
              (ngModelChange)="content.set($event)"
              rows="12"
              placeholder="Write what happened, what you felt, and what you needed..."
              class="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"></textarea>
          </label>

          <div class="mt-4">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mood tags</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                *ngFor="let tag of tags"
                type="button"
                (click)="toggleTag(tag)"
                class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                [class.bg-sky-600]="hasTag(tag)"
                [class.text-white]="hasTag(tag)"
                [class.border-sky-600]="hasTag(tag)">
                {{ tag }}
              </button>
            </div>
          </div>

          <div *ngIf="error()" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error() }}
          </div>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              (click)="save()"
              [disabled]="!canSave()"
              class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
              {{ saving() ? "Saving..." : savedEntry() ? "Saved" : "Save entry" }}
            </button>
            <button
              type="button"
              (click)="analyze()"
              [disabled]="!savedEntry() || analyzing()"
              class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              {{ analyzing() ? "Analyzing..." : "Analyze patterns" }}
            </button>
            <div class="text-xs text-slate-500">Only you can see your writing.</div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-5">
          <div class="text-sm font-semibold text-slate-900">Reflection insights</div>
          <div class="mt-1 text-xs leading-5 text-slate-500">Supportive suggestions based on language patterns (not clinical).</div>

          <ng-container *ngIf="insights(); else empty">
            <div class="mt-4 flex flex-wrap gap-2">
              <span *ngFor="let pattern of insights()?.patterns || []" class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {{ pattern }}
              </span>
              <span *ngIf="insights()?.tone" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                tone: {{ insights()?.tone }}
              </span>
            </div>

            <div class="mt-4 space-y-3">
              <div *ngFor="let tip of insights()?.suggestions || []" class="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                {{ tip }}
              </div>
            </div>
          </ng-container>

          <ng-template #empty>
            <div class="mt-4 rounded-2xl bg-white px-4 py-4 text-sm leading-7 text-slate-600">
              Save an entry, then click "Analyze patterns" to get gentle reflection prompts and suggestions.
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class JournalEditorComponent {
  @Output() saved = new EventEmitter<JournalEntry>();

  readonly tags = COMMON_TAGS;
  readonly promptIndex = signal(0);
  readonly prompt = computed(() => PROMPTS[this.promptIndex() % PROMPTS.length]);

  readonly content = signal("");
  private readonly tagSet = signal<Set<string>>(new Set());

  readonly saving = signal(false);
  readonly analyzing = signal(false);
  readonly error = signal("");

  readonly savedEntry = signal<JournalEntry | null>(null);
  readonly insights = signal<JournalInsights | null>(null);

  readonly canSave = computed(() => {
    return !this.saving() && !!this.content().trim();
  });

  constructor(private readonly journalService: JournalService) {}

  cyclePrompt(): void {
    this.promptIndex.update((value) => value + 1);
  }

  hasTag(tag: string): boolean {
    return this.tagSet().has(tag);
  }

  toggleTag(tag: string): void {
    const next = new Set(this.tagSet());
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    this.tagSet.set(next);
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }

    this.error.set("");
    this.saving.set(true);
    this.insights.set(null);

    this.journalService
      .create({
        content: this.content().trim(),
        moodTags: Array.from(this.tagSet()),
        aiPrompt: this.prompt()
      })
      .subscribe({
        next: (entry) => {
          this.savedEntry.set(entry);
          this.saved.emit(entry);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error || "Unable to save right now. Please try again.");
          this.saving.set(false);
        }
      });
  }

  analyze(): void {
    const entry = this.savedEntry();
    if (!entry || this.analyzing()) {
      return;
    }

    this.error.set("");
    this.analyzing.set(true);

    this.journalService.analyze(entry._id).subscribe({
      next: (insights) => {
        this.insights.set(insights);
        this.analyzing.set(false);
      },
      error: () => {
        this.error.set("Unable to analyze this entry right now. Please try again later.");
        this.analyzing.set(false);
      }
    });
  }
}

