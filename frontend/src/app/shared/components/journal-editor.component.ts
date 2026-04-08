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

interface JournalInsightCard {
  eyebrow: string;
  title: string;
  description: string;
}

@Component({
  selector: "app-journal-editor",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="theme-bento-card-soft rounded-[2.25rem] p-6 backdrop-blur">
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

      <div class="theme-bento-card rounded-[1.75rem] px-4 py-4 text-sm leading-7 text-slate-700">
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

        <div class="theme-bento-card-soft rounded-[2rem] px-5 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-slate-900">Pattern analysis</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">A clearer read on recurring loops, tone, and the kindest next step.</div>
            </div>
            <span *ngIf="insights()?.tone" class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
              {{ toneLabel(insights()?.tone) }}
            </span>
          </div>

          <ng-container *ngIf="insights() as insightData; else empty">
            <div class="theme-bento-card mt-4 rounded-[1.75rem] px-4 py-5">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">What stands out</div>
              <div class="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{{ analysisHeadline(insightData) }}</div>
              <div class="mt-3 text-sm leading-7 text-slate-600">{{ analysisSummary(insightData) }}</div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span *ngFor="let pattern of insightPatterns(insightData)" class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                {{ patternLabel(pattern) }}
              </span>
              <span *ngIf="insightData.tone" class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                tone: {{ toneLabel(insightData.tone) }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div *ngFor="let card of insightCards(insightData)" class="theme-bento-card rounded-[1.5rem] px-4 py-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ card.eyebrow }}</div>
                <div class="mt-2 text-base font-semibold text-slate-950">{{ card.title }}</div>
                <div class="mt-2 text-sm leading-7 text-slate-600">{{ card.description }}</div>
              </div>
            </div>

            <div class="mt-4 space-y-3">
              <div *ngFor="let tip of insightSuggestions(insightData); let i = index" class="theme-bento-card-soft rounded-[1.4rem] px-4 py-4 text-sm leading-7 text-slate-700">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Try next {{ i + 1 }}</div>
                <div class="mt-1">{{ tip }}</div>
              </div>
            </div>

            <div class="theme-bento-card mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Use in the next entry</div>
              <div class="mt-2 font-semibold text-slate-950">{{ followUpPrompt(insightData) }}</div>
            </div>
          </ng-container>

          <ng-template #empty>
            <div class="theme-bento-card mt-4 rounded-[1.6rem] px-4 py-4 text-sm leading-7 text-slate-600">
              Save an entry, then click "Analyze patterns" to get a simpler read on what your writing may be pointing to and what to try next.
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

  toneLabel(tone: JournalInsights["tone"]): string {
    const normalized = normalizeToneKey(tone);
    return normalized === "mixed" ? "Mixed" : toTitleCase(normalized);
  }

  patternLabel(pattern: string): string {
    return toTitleCase(pattern);
  }

  insightPatterns(insights: JournalInsights): string[] {
    return (insights.patterns || []).slice(0, 4);
  }

  analysisHeadline(insights: JournalInsights): string {
    return describePattern(primaryPattern(insights)).headline;
  }

  analysisSummary(insights: JournalInsights): string {
    const patternCopy = describePattern(primaryPattern(insights)).summary;
    return `${patternCopy} ${toneSummary(insights.tone)}`.trim();
  }

  insightCards(insights: JournalInsights): JournalInsightCard[] {
    const pattern = primaryPattern(insights);
    const patternCopy = describePattern(pattern);

    return [
      {
        eyebrow: "Primary pattern",
        title: this.patternLabel(pattern),
        description: patternCopy.cardDetail
      },
      {
        eyebrow: "Emotional tone",
        title: this.toneLabel(insights.tone),
        description: toneGuidance(insights.tone)
      },
      {
        eyebrow: "Best next move",
        title: "Keep it smaller and clearer",
        description: this.insightSuggestions(insights)[0]
      },
      {
        eyebrow: "Reflection lens",
        title: "Write one layer deeper",
        description: patternCopy.prompt
      }
    ];
  }

  insightSuggestions(insights: JournalInsights): string[] {
    const suggestions = (insights.suggestions || []).filter(Boolean);
    if (suggestions.length) {
      return suggestions.slice(0, 3);
    }

    return fallbackSuggestions(primaryPattern(insights));
  }

  followUpPrompt(insights: JournalInsights): string {
    return describePattern(primaryPattern(insights)).prompt;
  }

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

function primaryPattern(insights: JournalInsights): string {
  return normalizePatternKey(insights.patterns?.[0] || "reflection");
}

function normalizePatternKey(value: string): string {
  return String(value || "reflection")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeToneKey(value: JournalInsights["tone"]): string {
  if (typeof value === "number") {
    if (value <= 2) {
      return "heavy";
    }

    if (value >= 4) {
      return "hopeful";
    }

    return "mixed";
  }

  const normalized = String(value || "neutral").trim().toLowerCase();
  if (!normalized) {
    return "neutral";
  }

  if (["1", "2"].includes(normalized)) {
    return "heavy";
  }

  if (["4", "5"].includes(normalized)) {
    return "hopeful";
  }

  if (normalized === "3") {
    return "mixed";
  }

  return normalized;
}

function describePattern(pattern: string): { headline: string; summary: string; cardDetail: string; prompt: string } {
  const library: Record<string, { headline: string; summary: string; cardDetail: string; prompt: string }> = {
    reflection: {
      headline: "This entry reads as reflective and self-aware.",
      summary: "You are noticing the situation with some distance, which is a good base for clearer decisions.",
      cardDetail: "The writing looks thoughtful rather than reactive. That usually means you can turn insight into one practical action.",
      prompt: "What part of this situation is asking for action, and what part only needs acknowledgment?"
    },
    rumination: {
      headline: "This entry looks stuck in a thinking loop.",
      summary: "The same concern may be replaying without giving you a cleaner answer yet.",
      cardDetail: "Rumination often feels productive, but it usually needs a boundary or one action to loosen its grip.",
      prompt: "What is the one question here that still matters, and what can you let stay unanswered for now?"
    },
    overthinking: {
      headline: "A lot of mental effort is going into figuring everything out at once.",
      summary: "This reads like heavy analysis, which can make the next step feel bigger than it really is.",
      cardDetail: "When overthinking is high, the kindest move is usually to shrink the choice, not to think harder.",
      prompt: "If this only needed a 10-minute next step, what would that step be?"
    },
    "self-criticism": {
      headline: "The writing sounds harder on you than it needs to.",
      summary: "There may be a strong inner-critic tone underneath the facts of what happened.",
      cardDetail: "Self-criticism can hide the actual need. Softer language often makes the next action easier to see.",
      prompt: "What would this entry sound like if you described yourself with fairness instead of pressure?"
    },
    "social comparison": {
      headline: "Comparison seems to be pulling attention away from your own needs.",
      summary: "This pattern often raises urgency and lowers clarity about what matters for you personally.",
      cardDetail: "When comparison takes over, values and boundaries usually matter more than more information.",
      prompt: "What do you want for yourself here, even if no one else were being measured?"
    },
    gratitude: {
      headline: "There are steadying signals in this entry you can build on.",
      summary: "The writing includes supportive or grounding moments that are worth repeating on purpose.",
      cardDetail: "Gratitude works best when it points to a habit or person you can stay close to, not just a nice thought.",
      prompt: "What helped even a little today, and how can you make that easier to repeat tomorrow?"
    }
  };

  return library[pattern] || library["reflection"];
}

function toneSummary(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  switch (normalized) {
    case "heavy":
      return "The tone feels heavier, so staying with one gentle next move matters more than solving everything right now.";
    case "hopeful":
      return "The tone still carries some lift, which gives you room to turn insight into momentum.";
    case "mixed":
      return "The tone feels mixed, which usually means both pressure and resilience are present at the same time.";
    default:
      return "The tone looks fairly neutral, which can be useful for noticing details without adding extra pressure.";
  }
}

function toneGuidance(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  switch (normalized) {
    case "heavy":
      return "Use shorter, more supportive sentences with yourself and reduce the size of the next task.";
    case "hopeful":
      return "Keep the momentum practical by choosing one action you can finish today.";
    case "mixed":
      return "Mixed tone usually means you need both validation and one clear step.";
    default:
      return "A neutral tone can help you sort facts, needs, and next actions more clearly.";
  }
}

function fallbackSuggestions(pattern: string): string[] {
  const library: Record<string, string[]> = {
    reflection: [
      "Turn the clearest observation from this entry into one action for the next 24 hours.",
      "Underline one sentence that feels most true, then write why it matters.",
      "Name what you needed in that moment, not just what happened."
    ],
    rumination: [
      "Set a short boundary for thinking, then move one part of the problem onto paper.",
      "Pick one decision that can stay unresolved until tomorrow.",
      "Choose one grounding action before returning to the story in your head."
    ],
    overthinking: [
      "Shrink the problem to the next smallest useful action.",
      "List what needs action and what only needs acceptance.",
      "Reduce the number of choices you are trying to solve right now."
    ],
    "self-criticism": [
      "Rewrite one harsh sentence from this entry in a more fair and supportive way.",
      "Separate the mistake from your identity before planning the next step.",
      "Ask what support would help more than pressure today."
    ],
    "social comparison": [
      "Step back from the comparison trigger for a short window today.",
      "Write what matters to you in this situation before checking anyone else's pace.",
      "Choose one action that fits your values, not your fear of missing out."
    ],
    gratitude: [
      "Protect the routine, person, or place that helped you feel steadier.",
      "Write why that positive moment mattered instead of listing it quickly.",
      "Turn one good signal from today into a repeatable habit."
    ]
  };

  return library[pattern] || library["reflection"];
}

function toTitleCase(value: string): string {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
