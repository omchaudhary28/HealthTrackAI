import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  FollowUpMessage,
  JournalEntry,
  JournalInsights,
  JournalService,
  NextMoveAction,
  VibeAnalysis
} from "../../core/services/journal.service";
import { IconComponent, MindtrackIconName } from "./icon.component";

const PROMPTS = [
  "What felt good today, even a little?",
  "What emotion ran the show today?",
  "If today had a title, what would it be?",
  "What's one kind thing you can do next?",
  "What thought kept looping?",
  "What drained your energy most, and what gave you a spark?",
  "What is one expectation you can gently release right now?"
];

const COMMON_TAGS = [
  "calm",
  "stressed",
  "tired",
  "grateful",
  "overthinking",
  "social",
  "focus",
  "sleep",
  "self-kindness",
  "uncertain",
  "proud"
];

interface JournalInsightCard {
  icon: MindtrackIconName;
  eyebrow: string;
  title: string;
  description: string;
}

@Component({
  selector: "app-journal-editor",
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-card mt-card-hover p-4 sm:p-6">
      <!-- Header -->
      <div class="mt-card-head flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="mt-card-brand min-w-0">
          <div class="mt-card-icon">
            <app-icon name="journal" className="text-lg"></app-icon>
          </div>
          <div class="min-w-0">
            <div class="mt-card-kicker">MindTrack Journal</div>
            <div class="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
              Private space. Real thoughts. Contextual AI reflection.
            </div>
            <div class="mt-card-copy mt-2 text-sm">
              Write freely. Activate <strong>Read Vibe Mode</strong> to unpack underlying themes, break looping cycles, and map your next move.
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="cyclePrompt()"
            class="btn-outline rounded-2xl px-4 py-2.5 text-sm font-semibold">
            <app-icon name="refresh" className="mr-2 text-sm"></app-icon>
            Swap prompt
          </button>
        </div>
      </div>

      <!-- Prompt Pill -->
      <div class="mt-card-soft mt-5 p-4 sm:p-5">
        <div class="mt-card-brand">
          <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
            <app-icon name="wand" className="text-base"></app-icon>
          </div>
          <div class="min-w-0">
            <div class="mt-card-kicker">Reflection Prompt</div>
            <div class="mt-1.5 text-sm font-medium leading-relaxed text-slate-800">{{ prompt() }}</div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Editor & Read Vibe Panel -->
      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
        <!-- Left: Note Writing Column -->
        <div class="min-w-0 flex flex-col justify-between">
          <div>
            <label class="block min-w-0 text-sm font-semibold text-slate-800">
              <div class="mt-card-brand mb-2">
                <div class="mt-card-icon h-10 w-10 rounded-[0.85rem]">
                  <app-icon name="pen" className="text-sm"></app-icon>
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">Your Reflection</div>
                  <div class="text-xs font-normal text-slate-500">What happened? How did it feel? What thoughts are lingering?</div>
                </div>
              </div>
              <textarea
                [ngModel]="content()"
                (ngModelChange)="content.set($event)"
                rows="11"
                placeholder="Write whatever is on your mind. You don't have to filter or structure your thoughts—the reflection companion will understand your context..."
                class="app-textarea mt-2 block min-h-[15rem] w-full max-w-full text-sm leading-relaxed"></textarea>
            </label>

            <!-- Mood Tags -->
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mood tags</div>
                <div class="text-xs text-slate-400">Optional vibe markers</div>
              </div>
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

            <!-- Historical Pattern Toggle -->
            <div class="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="allowHistorical()"
                  (change)="toggleAllowHistorical()"
                  class="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                <div class="min-w-0 text-xs">
                  <span class="font-semibold text-slate-800">Track recurring themes across past notes</span>
                  <p class="mt-0.5 text-slate-500 leading-normal">
                    AI connects patterns with your earlier entries (e.g. self-comparison during deadlines). Your entries remain 100% private.
                  </p>
                </div>
              </label>
            </div>

            <!-- Error Banner -->
            <div *ngIf="error()" class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <div class="flex items-center gap-2">
                <app-icon name="sparkles" className="text-rose-500 text-sm"></app-icon>
                <span>{{ error() }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="cluster-actions mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="save()"
              [disabled]="!canSave()"
              class="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
              <app-icon name="journal" className="mr-2 text-sm"></app-icon>
              {{ saving() ? "Saving..." : savedEntry() ? "Saved" : "Save note" }}
            </button>

            <button
              type="button"
              (click)="activateReadVibe()"
              [disabled]="(!savedEntry() && !canSave()) || analyzing()"
              class="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-sky-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
              <app-icon name="sparkles" className="mr-2 text-sm"></app-icon>
              <span>{{ analyzing() ? "Reading vibe..." : "Read Vibe Mode" }}</span>
            </button>

            <div class="text-xs text-slate-500 sm:ml-auto flex items-center gap-1.5">
              <app-icon name="shield" className="text-slate-400 text-xs"></app-icon>
              <span>Encrypted & private</span>
            </div>
          </div>
        </div>

        <!-- Right: Intelligent Read Vibe & Analysis View -->
        <div class="mt-card-soft min-w-0 p-4 sm:p-5 flex flex-col justify-start">
          <!-- Card Header & Status -->
          <div class="mt-card-head border-b border-slate-200/60 pb-3">
            <div class="mt-card-brand min-w-0">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem] bg-gradient-to-tr from-sky-500 to-indigo-500 text-white">
                <app-icon name="brain" className="text-base"></app-icon>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span>Read Vibe Analysis</span>
                  <span
                    *ngIf="vibeAnalysis()"
                    class="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                    Active
                  </span>
                </div>
                <div class="mt-0.5 text-xs text-slate-500">Contextual reflection & practical problem solving.</div>
              </div>
            </div>

            <!-- Provider Badge / Quick Mode Toggle -->
            <div *ngIf="vibeAnalysis() || insights()" class="flex items-center gap-1">
              <button
                type="button"
                (click)="activeTab.set('vibe')"
                [class.bg-white]="activeTab() === 'vibe'"
                [class.shadow-xs]="activeTab() === 'vibe'"
                [class.text-slate-900]="activeTab() === 'vibe'"
                class="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition">
                Deep Vibe
              </button>
              <button
                type="button"
                (click)="activeTab.set('quick')"
                [class.bg-white]="activeTab() === 'quick'"
                [class.shadow-xs]="activeTab() === 'quick'"
                [class.text-slate-900]="activeTab() === 'quick'"
                class="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition">
                Quick Summary
              </button>
            </div>
          </div>

          <!-- Progressive Loading State -->
          <div *ngIf="analyzing()" class="mt-6 rounded-2xl border border-sky-100 bg-sky-50/60 p-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-sky-600">
              <app-icon name="wand" className="text-lg animate-spin"></app-icon>
            </div>
            <div class="mt-4 text-sm font-semibold text-slate-900">{{ analysisStep() }}</div>
            <div class="mt-1 text-xs text-slate-500">Connecting emotional nuances, cycles, and actionable next steps...</div>
            <div class="mt-4 mx-auto max-w-xs h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
              <div class="h-full w-2/3 animate-pulse rounded-full bg-sky-600"></div>
            </div>
          </div>

          <!-- Deep Read Vibe Mode Container -->
          <div *ngIf="!analyzing() && activeTab() === 'vibe' && vibeAnalysis() as vibe" class="mt-4 space-y-4">
            <!-- Crisis / Safety Alert Banner if triggered -->
            <div
              *ngIf="vibe.safetyNotice?.isCrisis"
              class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
              <div class="flex items-start gap-3">
                <app-icon name="shield" className="text-rose-600 text-lg mt-0.5"></app-icon>
                <div class="text-xs leading-relaxed">
                  <div class="font-bold text-sm text-rose-950">You Are Not Alone</div>
                  <p class="mt-1">{{ vibe.safetyNotice?.message }}</p>
                  <div class="mt-3 space-y-1.5 font-semibold text-rose-900">
                    <div *ngFor="let res of vibe.safetyNotice?.resources" class="rounded-xl bg-white/80 px-3 py-1.5 border border-rose-200/60">
                      {{ res }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- A. What I Hear -->
            <div class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-600">A. What I Hear</div>
                <span class="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">Reflective Hearing</span>
              </div>
              <div class="mt-2.5 text-base font-semibold leading-relaxed text-slate-900">
                "{{ vibe.whatIHear }}"
              </div>
              <div class="mt-2 text-xs text-slate-500 italic">
                Does this sound right? You can clarify or adjust below in the reflection box.
              </div>
            </div>

            <!-- B. Possible Root Concerns -->
            <div *ngIf="vibe.rootConcerns?.length" class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">B. Possible Root Concerns</div>
              <div class="mt-3 space-y-3">
                <div
                  *ngFor="let root of vibe.rootConcerns"
                  class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span class="text-xs font-semibold text-slate-900">{{ root.concern }}</span>
                  </div>
                  <div class="mt-1 text-xs leading-relaxed text-slate-600">{{ root.explanation }}</div>
                </div>
              </div>
            </div>

            <!-- C. Emotional Themes -->
            <div *ngIf="vibe.emotionalThemes?.length" class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">C. Emotional Themes</div>
              <div class="mt-3 flex flex-wrap gap-2">
                <div
                  *ngFor="let theme of vibe.emotionalThemes"
                  class="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs">
                  <div class="font-semibold text-indigo-950">{{ theme.emotion }}</div>
                  <div class="mt-0.5 text-[11px] text-indigo-800/80">{{ theme.context }}</div>
                </div>
              </div>
            </div>

            <!-- D. Maintaining Cycle (What might be keeping this going) -->
            <div *ngIf="vibe.maintainingCycle as cycle" class="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">D. What Might Be Keeping This Going?</div>
                <app-icon name="refresh" className="text-amber-600 text-xs"></app-icon>
              </div>

              <!-- Cycle Steps Chain -->
              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
                <ng-container *ngFor="let step of cycle.steps; let last = last; let idx = index">
                  <span class="rounded-lg bg-white px-2.5 py-1.5 shadow-2xs border border-amber-200/60">
                    {{ step }}
                  </span>
                  <span *ngIf="!last" class="text-amber-500 font-bold">→</span>
                </ng-container>
              </div>
              <p class="mt-2.5 text-xs leading-relaxed text-amber-900/90">{{ cycle.summary }}</p>
            </div>

            <!-- E. Practical Next Steps (Checklist with time estimates) -->
            <div *ngIf="vibe.nextMoves?.length" class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">E. Your Next Move</div>
                <span class="text-xs text-slate-400">Click to check off</span>
              </div>

              <div class="mt-3 space-y-3">
                <div
                  *ngFor="let move of vibe.nextMoves; let i = index"
                  (click)="toggleAction(i)"
                  class="group flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:border-sky-300"
                  [class.border-emerald-200]="move.completed"
                  [class.bg-emerald-50/40]="move.completed"
                  [class.border-slate-100]="!move.completed"
                  [class.bg-slate-50/60]="!move.completed">
                  <input
                    type="checkbox"
                    [checked]="move.completed"
                    class="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 pointer-events-none" />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center justify-between gap-1">
                      <span
                        class="text-xs font-semibold text-slate-900 transition"
                        [class.line-through]="move.completed"
                        [class.text-slate-400]="move.completed">
                        {{ move.title }}
                      </span>
                      <span
                        *ngIf="move.timeEstimate"
                        class="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/60">
                        {{ move.timeEstimate }}
                      </span>
                    </div>
                    <div class="mt-1 text-xs text-slate-600 leading-relaxed">{{ move.whyItHelps }}</div>
                    <div class="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-sky-700">
                      <app-icon name="target" className="text-xs"></app-icon>
                      <span>Small start: {{ move.smallStart }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- F. Question Worth Reflecting On & Follow-Up Conversation -->
            <div class="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5 shadow-xs">
              <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700">F. A Question Worth Reflecting On</div>
              <div class="mt-2 rounded-xl bg-indigo-50/70 p-3.5 text-sm font-medium leading-relaxed text-indigo-950 border border-indigo-100/60">
                "{{ vibe.reflectionQuestion }}"
              </div>

              <!-- Interactive Multi-Turn Dialogue -->
              <div *ngIf="followUpMessages().length" class="mt-4 space-y-3 border-t border-slate-100 pt-3">
                <div
                  *ngFor="let msg of followUpMessages()"
                  class="rounded-xl p-3 text-xs leading-relaxed"
                  [class.bg-sky-50]="msg.role === 'user'"
                  [class.text-sky-950]="msg.role === 'user'"
                  [class.ml-6]="msg.role === 'user'"
                  [class.bg-slate-50]="msg.role === 'assistant'"
                  [class.text-slate-800]="msg.role === 'assistant'"
                  [class.mr-6]="msg.role === 'assistant'"
                  [class.border]="true"
                  [class.border-sky-100]="msg.role === 'user'"
                  [class.border-slate-200/60]="msg.role === 'assistant'">
                  <div class="text-[10px] font-bold uppercase tracking-wider mb-1" [class.text-sky-600]="msg.role === 'user'" [class.text-slate-400]="msg.role === 'assistant'">
                    {{ msg.role === 'user' ? 'Your reflection' : 'MindTrack Companion' }}
                  </div>
                  <div>{{ msg.content }}</div>
                </div>
              </div>

              <!-- Follow-Up Chat Box -->
              <div class="mt-3 flex flex-col gap-2">
                <div class="flex gap-2">
                  <input
                    type="text"
                    [ngModel]="followUpInput()"
                    (ngModelChange)="followUpInput.set($event)"
                    (keyup.enter)="sendFollowUp()"
                    placeholder="Answer the question, give more context, or correct the AI..."
                    class="app-textarea flex-1 rounded-xl px-3 py-2 text-xs" />
                  <button
                    type="button"
                    (click)="sendFollowUp()"
                    [disabled]="!followUpInput().trim() || sendingFollowUp()"
                    class="btn-primary rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap disabled:opacity-50">
                    {{ sendingFollowUp() ? "Sending..." : "Reflect" }}
                  </button>
                </div>
                <div class="text-[11px] text-slate-400">
                  Type your reply to clarify your situation or adjust your next step.
                </div>
              </div>
            </div>

            <!-- G. A Gentle Closing -->
            <div class="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-sky-50/40 p-4 text-center">
              <div class="text-xs font-semibold text-slate-700 italic">
                "{{ vibe.gentleClosing }}"
              </div>
            </div>

            <!-- H. Recurring Themes (Over Time) -->
            <div
              *ngIf="vibe.historicalContext?.recurringThemes?.length"
              class="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-800">
                  Recurring Patterns Over Time
                </div>
                <span class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                  Journal History
                </span>
              </div>
              <div class="mt-2 text-xs text-slate-600">{{ vibe.historicalContext?.note }}</div>
              <div class="mt-3 space-y-2.5">
                <div
                  *ngFor="let item of vibe.historicalContext?.recurringThemes"
                  class="rounded-xl border border-purple-200/60 bg-white p-3 text-xs">
                  <div class="font-semibold text-purple-950">{{ item.theme }}</div>
                  <div class="mt-1 text-slate-700">{{ item.observation }}</div>
                  <div class="mt-1.5 text-[11px] font-medium text-purple-700">
                    Evidence: {{ item.datesOrParaphrase }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Non-Diagnosis Disclaimer -->
            <div class="text-[11px] text-slate-400 text-center leading-normal px-2">
              MindTrack AI provides reflective prompts and wellness guidance. It does not diagnose, treat, or provide psychiatric medical advice.
            </div>
          </div>

          <!-- Quick Summary View (Legacy/Fast Mode) -->
          <div *ngIf="!analyzing() && activeTab() === 'quick' && insights() as insightData" class="mt-4 space-y-3">
            <div class="mt-card p-4">
              <div class="mt-card-brand">
                <div class="mt-card-icon h-10 w-10 rounded-[0.85rem]">
                  <app-icon name="brain" className="text-sm"></app-icon>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Main Focus</div>
                  <div class="mt-1 text-base font-semibold text-slate-950">{{ analysisHeadline(insightData) }}</div>
                </div>
              </div>
              <div class="mt-2 text-xs leading-relaxed text-slate-600">{{ analysisSummary(insightData) }}</div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span *ngFor="let pattern of insightPatterns(insightData)" class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                {{ patternLabel(pattern) }}
              </span>
              <span *ngIf="insightData.tone" class="theme-chip rounded-full px-3 py-1 text-xs font-semibold">
                tone: {{ toneLabel(insightData.tone) }}
              </span>
            </div>

            <div class="space-y-2">
              <div *ngFor="let tip of insightSuggestions(insightData); let i = index" class="mt-card-soft px-3 py-2.5 text-xs leading-relaxed text-slate-700">
                <strong>Next {{ i + 1 }}:</strong> {{ tip }}
              </div>
            </div>
          </div>

          <!-- Empty State (When neither analysis has run yet) -->
          <div *ngIf="!analyzing() && !vibeAnalysis() && !insights()" class="mt-6 flex flex-col items-center justify-center py-10 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <app-icon name="sparkles" className="text-lg"></app-icon>
            </div>
            <div class="mt-3 text-sm font-semibold text-slate-700">Ready for reflection</div>
            <p class="mt-1 max-w-xs text-xs text-slate-500 leading-normal">
              Type your thoughts, then click <strong>Read Vibe Mode</strong> to get a compassionate breakdown of what's happening and where to go next.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JournalEditorComponent {
  @Input() set entry(val: JournalEntry | null | undefined) {
    if (val) {
      this.savedEntry.set(val);
      this.content.set(val.content || "");
      if (val.moodTags) {
        this.tagSet.set(new Set(val.moodTags));
      }
      if (val.aiInsights) {
        this.insights.set(val.aiInsights);
      }
      if (val.vibeAnalysis) {
        this.vibeAnalysis.set(val.vibeAnalysis);
      }
      if (val.followUpMessages) {
        this.followUpMessages.set(val.followUpMessages);
      }
    }
  }

  @Output() saved = new EventEmitter<JournalEntry>();

  readonly tags = COMMON_TAGS;
  readonly promptIndex = signal(0);
  readonly prompt = computed(() => PROMPTS[this.promptIndex() % PROMPTS.length]);

  readonly content = signal("");
  private readonly tagSet = signal<Set<string>>(new Set());

  readonly saving = signal(false);
  readonly analyzing = signal(false);
  readonly analysisStep = signal("Reading reflection...");
  readonly error = signal("");

  readonly savedEntry = signal<JournalEntry | null>(null);
  readonly insights = signal<JournalInsights | null>(null);
  readonly vibeAnalysis = signal<VibeAnalysis | null>(null);
  readonly followUpMessages = signal<FollowUpMessage[]>([]);
  readonly allowHistorical = signal<boolean>(true);
  readonly activeTab = signal<"vibe" | "quick">("vibe");

  readonly followUpInput = signal<string>("");
  readonly sendingFollowUp = signal<boolean>(false);

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
        icon: "brain",
        eyebrow: "Main loop",
        title: this.patternLabel(pattern),
        description: patternCopy.cardDetail
      },
      {
        icon: "pulse",
        eyebrow: "Tone",
        title: this.toneLabel(insights.tone),
        description: toneGuidance(insights.tone)
      },
      {
        icon: "target",
        eyebrow: "Next move",
        title: "Keep it small",
        description: this.insightSuggestions(insights)[0]
      },
      {
        icon: "wand",
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

  toggleAllowHistorical(): void {
    this.allowHistorical.update((val) => !val);
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }

    this.error.set("");
    this.saving.set(true);

    this.journalService
      .create({
        content: this.content().trim(),
        moodTags: Array.from(this.tagSet()),
        aiPrompt: this.prompt()
      })
      .subscribe({
        next: (entry) => {
          this.savedEntry.set(entry);
          if (entry.aiInsights) {
            this.insights.set(entry.aiInsights);
          }
          if (entry.vibeAnalysis) {
            this.vibeAnalysis.set(entry.vibeAnalysis);
          }
          this.saved.emit(entry);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error || "Couldn't save that note. Try again.");
          this.saving.set(false);
        }
      });
  }

  activateReadVibe(): void {
    const currentText = this.content().trim();
    if (!currentText) {
      this.error.set("Please write a reflection before activating Read Vibe Mode.");
      return;
    }

    const saved = this.savedEntry();
    // If not saved yet OR the user modified the note text since last save
    if (!saved || (saved.content || "").trim() !== currentText) {
      this.error.set("");
      this.saving.set(true);
      this.journalService
        .create({
          content: currentText,
          moodTags: Array.from(this.tagSet()),
          aiPrompt: this.prompt()
        })
        .subscribe({
          next: (entry) => {
            this.savedEntry.set(entry);
            this.saved.emit(entry);
            this.saving.set(false);
            this.executeReadVibe(entry._id, currentText);
          },
          error: (err) => {
            this.error.set(err?.error?.error || "Couldn't save note before reading vibe.");
            this.saving.set(false);
          }
        });
      return;
    }

    this.executeReadVibe(saved._id, currentText);
  }

  private executeReadVibe(entryId: string, contentText: string): void {
    if (this.analyzing()) {
      return;
    }

    this.error.set("");
    this.analyzing.set(true);
    this.activeTab.set("vibe");
    this.analysisStep.set("Reading reflection...");

    // Progressive step indicator
    const stepTimer1 = setTimeout(() => {
      this.analysisStep.set("Identifying core concerns & emotional themes...");
    }, 1000);

    const stepTimer2 = setTimeout(() => {
      this.analysisStep.set("Synthesizing practical next steps...");
    }, 2200);

    const tagsArray = Array.from(this.tagSet());
    const isHappy = /\b(happy|joy|grateful|proud|peaceful|good day|feeling good)\b/i.test(contentText);
    const recentMood = tagsArray[0] || (isHappy ? "happy" : "neutral");

    this.journalService
      .readVibe(entryId, {
        content: contentText,
        moodTags: tagsArray,
        recentMood,
        allowHistorical: this.allowHistorical()
      })
      .subscribe({
        next: (res) => {
          clearTimeout(stepTimer1);
          clearTimeout(stepTimer2);
          this.vibeAnalysis.set(res.vibeAnalysis);
          this.followUpMessages.set(res.followUpMessages || []);
          this.analyzing.set(false);
        },
        error: (err) => {
          clearTimeout(stepTimer1);
          clearTimeout(stepTimer2);
          this.error.set(err?.error?.error || "Couldn't read vibe right now. Please try again.");
          this.analyzing.set(false);
        }
      });
  }

  toggleAction(index: number): void {
    const entry = this.savedEntry();
    const currentAnalysis = this.vibeAnalysis();
    if (!entry || !currentAnalysis?.nextMoves?.[index]) {
      return;
    }

    const currentCompleted = Boolean(currentAnalysis.nextMoves[index].completed);
    const newCompleted = !currentCompleted;

    // Optimistic local update
    const updatedMoves = [...currentAnalysis.nextMoves];
    updatedMoves[index] = { ...updatedMoves[index], completed: newCompleted };
    this.vibeAnalysis.set({ ...currentAnalysis, nextMoves: updatedMoves });

    this.journalService.toggleNextMove(entry._id, index, newCompleted).subscribe({
      next: (res) => {
        if (res?.nextMoves) {
          this.vibeAnalysis.set({ ...currentAnalysis, nextMoves: res.nextMoves });
        }
      },
      error: () => {
        // Revert on error
        const revertedMoves = [...currentAnalysis.nextMoves];
        revertedMoves[index] = { ...revertedMoves[index], completed: currentCompleted };
        this.vibeAnalysis.set({ ...currentAnalysis, nextMoves: revertedMoves });
      }
    });
  }

  sendFollowUp(): void {
    const text = this.followUpInput().trim();
    const entry = this.savedEntry();
    if (!text || !entry || this.sendingFollowUp()) {
      return;
    }

    this.sendingFollowUp.set(true);
    this.followUpInput.set("");

    // Optimistic user bubble
    const optimisticTurn: FollowUpMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    this.followUpMessages.update((prev) => [...prev, optimisticTurn]);

    this.journalService.sendFollowUp(entry._id, text).subscribe({
      next: (res) => {
        this.followUpMessages.set(res.followUpMessages || []);
        this.sendingFollowUp.set(false);
      },
      error: () => {
        this.followUpMessages.update((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't process your reflection right now, but your thoughts have been saved. Take things one step at a time.",
            timestamp: new Date().toISOString()
          }
        ]);
        this.sendingFollowUp.set(false);
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
    if (value <= 2) return "heavy";
    if (value >= 4) return "hopeful";
    return "mixed";
  }

  const normalized = String(value || "neutral").trim().toLowerCase();
  if (!normalized) return "neutral";
  if (["1", "2"].includes(normalized)) return "heavy";
  if (["4", "5"].includes(normalized)) return "hopeful";
  if (normalized === "3") return "mixed";
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
    }
  };

  return library[pattern] || library["reflection"];
}

function fallbackSuggestions(pattern: string): string[] {
  const suggestions: Record<string, string[]> = {
    reflection: ["Write down one tangible thing to finish today.", "Take a gentle pause before jumping to the next task."],
    rumination: ["Change your physical environment for 5 minutes.", "Write down the loop once and put the notebook away."],
    overthinking: ["Pick the smallest viable version of the decision.", "Set a timer for 10 minutes and stop researching."],
    "self-criticism": ["Speak to yourself as you would to a close friend.", "Acknowledge the effort you put in."],
    "social comparison": ["Close competitive tabs and social feeds.", "Define what a win looks like for you today."]
  };

  return suggestions[pattern] || ["Take a deep breath and take one small step."];
}

function toneSummary(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  if (normalized === "heavy") return "The energy here is carrying a lot of weight.";
  if (normalized === "hopeful") return "There is a clear sense of forward movement.";
  return "Emotions are mixed and nuanced right now.";
}

function toneGuidance(tone: JournalInsights["tone"]): string {
  const normalized = normalizeToneKey(tone);
  if (normalized === "heavy") return "Prioritize rest and kindness over self-pressure.";
  if (normalized === "hopeful") return "Ride this wave of clarity to take an inspiring step.";
  return "Allow conflicting emotions to coexist without rush.";
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
