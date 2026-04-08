import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { JournalEntry, JournalInsights, JournalService } from "../../core/services/journal.service";

const PROMPTS = [
  "What felt good today, even a little?",
  "What emotion ran the show today?",
  "If today had a title, what would it be?",
  "What's one kind thing you can do next?",
  "What thought kept looping?"
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
    <div class="theme-bento-card-soft rounded-[1.9rem] p-4 backdrop-blur sm:rounded-[2.25rem] sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Journal</div>
          <div class="mt-1 text-xs leading-5 text-slate-500">Private space. Real thoughts. No pressure.</div>
        </div>
        <button
          type="button"
          (click)="cyclePrompt()"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
          Swap prompt
        </button>
      </div>

      <div class="theme-bento-card rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700 sm:rounded-[1.75rem]">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prompt</div>
        <div class="mt-2">{{ prompt() }}</div>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <label class="block text-sm font-semibold text-slate-800">
            Your note
            <textarea
              [ngModel]="content()"
              (ngModelChange)="content.set($event)"
              rows="10"
              placeholder="What happened? What hit? What do you need?"
              class="app-textarea mt-2"></textarea>
          </label>

          <div class="mt-4">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mood tags</div>
            <div class="chip-scroll mt-2">
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

          <div class="cluster-actions mt-5">
            <button
              type="button"
              (click)="save()"
              [disabled]="!canSave()"
              class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
              {{ saving() ? "Saving..." : savedEntry() ? "Saved" : "Save note" }}
            </button>
            <button
              type="button"
              (click)="analyze()"
              [disabled]="!savedEntry() || analyzing()"
              class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              {{ analyzing() ? "Reading..." : "Read vibe" }}
            </button>
            <div class="text-xs text-slate-500 sm:ml-auto">Only you see this.</div>
          </div>
        </div>

        <div class="theme-bento-card-soft rounded-[1.75rem] px-4 py-4 sm:rounded-[2rem] sm:px-5 sm:py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-slate-900">Pattern read</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Quick read on loops, tone, and the next move.</div>
            </div>
            <span *ngIf="insights()?.tone" class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
              {{ toneLabel(insights()?.tone) }}
            </span>
          </div>

          <ng-container *ngIf="insights() as insightData; else empty">
            <div class="theme-bento-card mt-4 rounded-[1.75rem] px-4 py-5">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Standout</div>
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
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Next {{ i + 1 }}</div>
                <div class="mt-1">{{ tip }}</div>
              </div>
            </div>

            <div class="theme-bento-card mt-4 rounded-[1.5rem] px-4 py-4 text-sm leading-7 text-slate-700">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Use next time</div>
              <div class="mt-2 font-semibold text-slate-950">{{ followUpPrompt(insightData) }}</div>
            </div>
          </ng-container>

          <ng-template #empty>
            <div class="theme-bento-card mt-4 rounded-[1.6rem] px-4 py-4 text-sm leading-7 text-slate-600">
              Save a note, then hit "Read vibe." We'll keep it short.
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
        eyebrow: "Main loop",
        title: this.patternLabel(pattern),
        description: patternCopy.cardDetail
      },
      {
        eyebrow: "Tone",
        title: this.toneLabel(insights.tone),
        description: toneGuidance(insights.tone)
      },
      {
        eyebrow: "Next move",
        title: "Keep it small",
        description: this.insightSuggestions(insights)[0]
      },
      {
        eyebrow: "Next prompt",
        title: "Go one layer deeper",
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
          this.error.set(err?.error?.error || "Couldn't save that. Try again.");
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
        this.error.set("Couldn't read this note right now.");
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
      headline: "This note feels calm and aware.",
      summary: "You can see the situation without getting fully dragged by it.",
      cardDetail: "You already have enough clarity for one practical step.",
      prompt: "What needs action, and what just needs a little grace?"
    },
    rumination: {
      headline: "This note looks stuck in a loop.",
      summary: "The same worry may be replaying without giving you anything new.",
      cardDetail: "Less thinking, one boundary, one move.",
      prompt: "What still matters here, and what can you drop for now?"
    },
    overthinking: {
      headline: "You're trying to solve it all at once.",
      summary: "Big mental effort is making the next step feel bigger than it is.",
      cardDetail: "Shrink the choice. Don't add more spin.",
      prompt: "If this only needed 10 minutes, what would you do?"
    },
    "self-criticism": {
      headline: "You're being hard on yourself here.",
      summary: "The inner critic is louder than the facts.",
      cardDetail: "Softer words usually make the next move easier to see.",
      prompt: "How would this sound if you were fair to yourself?"
    },
    "social comparison": {
      headline: "Comparison is stealing the spotlight.",
      summary: "Looking sideways is making your own needs harder to hear.",
      cardDetail: "Values beat more scrolling here.",
      prompt: "What do you want, even if no one else was in frame?"
    },
    gratitude: {
      headline: "There are good signals here.",
      summary: "Something helped. That's worth repeating on purpose.",
      cardDetail: "Good moments matter most when they become a habit.",
      prompt: "What helped today, and how do you make it easier tomorrow?"
    }
  };

  return library[pattern] || library["reflection"];
}

function toneSummary(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  switch (normalized) {
    case "heavy":
      return "The tone feels heavy. Keep the next move small.";
    case "hopeful":
      return "The tone still has some lift. Good spot for one clean move.";
    case "mixed":
      return "The tone is mixed. Pressure and resilience are both in the room.";
    default:
      return "The tone is pretty neutral. That's useful for a clean read.";
  }
}

function toneGuidance(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  switch (normalized) {
    case "heavy":
      return "Use softer words with yourself and shrink the task.";
    case "hopeful":
      return "Ride the momentum with one move you can finish today.";
    case "mixed":
      return "Mixed tone means you need both validation and one clear step.";
    default:
      return "Neutral tone helps you sort facts from feelings.";
  }
}

function fallbackSuggestions(pattern: string): string[] {
  const library: Record<string, string[]> = {
    reflection: [
      "Turn the clearest line into one move for today.",
      "Highlight the truest sentence and say why it hits.",
      "Name what you needed, not just what happened."
    ],
    rumination: [
      "Set a short cap on thinking, then write one useful part down.",
      "Let one decision wait until tomorrow.",
      "Ground first, then revisit the story."
    ],
    overthinking: [
      "Shrink the problem to the next useful action.",
      "List what needs action and what just needs acceptance.",
      "Cut down the number of choices in front of you."
    ],
    "self-criticism": [
      "Rewrite one harsh line in a fairer way.",
      "Separate the mistake from who you are.",
      "Ask what support helps more than pressure today."
    ],
    "social comparison": [
      "Step away from the comparison trigger for a bit.",
      "Write what matters to you before checking anyone else.",
      "Pick one action that fits your values, not your FOMO."
    ],
    gratitude: [
      "Protect the person, place, or routine that helped.",
      "Write why that good moment mattered.",
      "Turn one good signal into a repeatable habit."
    ]
  };

  return library[pattern] || library["reflection"];
}

function toTitleCase(value: string): string {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
