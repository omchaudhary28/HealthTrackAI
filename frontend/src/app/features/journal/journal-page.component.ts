import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { Observable, catchError, map, of } from "rxjs";
import { JournalEntry, JournalService, RecurringTheme } from "../../core/services/journal.service";
import { IconComponent } from "../../shared/components/icon.component";
import { JournalEditorComponent } from "../../shared/components/journal-editor.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-journal-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, IconComponent, JournalEditorComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <!-- Hero Banner -->
      <div class="theme-hero-card page-hero">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">MindTrack Wellness</div>
        <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Intelligent Journal & Read Vibe</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
          Express thoughts, unpick heavy cycles, and receive compassionate AI reflection with practical, low-friction next moves.
        </p>
      </div>

      <!-- Journal Editor & Read Vibe Workspace -->
      <app-journal-editor
        [entry]="selectedEntry()"
        (saved)="refresh()">
      </app-journal-editor>

      <!-- Recurring Themes Card (Cross-Entry History Analysis) -->
      <ng-container *ngIf="recurringThemes$ | async as themes">
        <div *ngIf="themes.length" class="mt-card mt-card-hover border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-sky-50/30 p-5 sm:p-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="mt-card-brand">
              <div class="mt-card-icon h-11 w-11 rounded-[0.95rem] bg-purple-600 text-white">
                <app-icon name="brain" className="text-base"></app-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-slate-900">Observed Reflection Patterns</span>
                  <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800">
                    Journal History
                  </span>
                </div>
                <div class="mt-1 text-xs leading-5 text-slate-500">
                  Recurring emotional themes identified across your private journal entries.
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              *ngFor="let theme of themes"
              class="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
              <div class="text-xs font-bold text-purple-950">{{ theme.theme }}</div>
              <div class="mt-1.5 text-xs text-slate-600 leading-relaxed">{{ theme.observation }}</div>
              <div class="mt-2 text-[11px] font-medium text-purple-700">
                {{ theme.datesOrParaphrase }}
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Recent Entries Card -->
      <div class="mt-card mt-card-hover p-5 sm:p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="mt-card-brand">
            <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
              <app-icon name="journal" className="text-base"></app-icon>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Your Journal History</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Past reflections, vibes, and action plans.</div>
            </div>
          </div>
          <button
            type="button"
            (click)="refresh()"
            class="btn-outline rounded-xl px-4 py-2 text-sm font-semibold">
            <app-icon name="refresh" className="mr-2 text-xs"></app-icon>
            Refresh
          </button>
        </div>

        <div class="mt-5 grid gap-4">
          <ng-container *ngIf="entries$ | async as entries; else loading">
            <div *ngIf="!entries.length" class="mt-card-soft px-4 py-8 text-center text-sm text-slate-600">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <app-icon name="journal" className="text-lg"></app-icon>
              </div>
              <div class="mt-3 font-semibold text-slate-700">No journal entries yet.</div>
              <div class="mt-1 text-xs text-slate-500">Write your first reflection above to activate Read Vibe Mode.</div>
            </div>

            <article
              *ngFor="let entry of entries; let i = index"
              appScrollReveal
              [revealDelay]="i * 50"
              class="mt-card mt-card-hover p-4 sm:p-5 transition">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="mt-card-brand min-w-0">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="journal" className="text-base"></app-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {{ entry.createdAt ? (entry.createdAt | date : "mediumDate") : "Saved" }}
                      </span>
                      <span
                        *ngIf="entry.vibeAnalysis"
                        class="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                        Read Vibe Active
                      </span>
                      <span
                        *ngIf="entry.followUpMessages?.length"
                        class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                        {{ entry.followUpMessages?.length }} Reflections
                      </span>
                    </div>
                    <div class="mt-2 text-sm leading-relaxed text-slate-800 font-medium">
                      {{ snippet(entry.content) }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <span
                    *ngFor="let tag of (entry.moodTags || []).slice(0, 4)"
                    class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                    {{ tag }}
                  </span>
                  <button
                    type="button"
                    (click)="selectEntry(entry)"
                    class="btn-outline rounded-xl px-3 py-1.5 text-xs font-semibold">
                    Open in Editor
                  </button>
                </div>
              </div>

              <!-- Read Vibe Summary Snippet if present -->
              <div *ngIf="entry.vibeAnalysis as vibe" class="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
                <div class="flex items-center justify-between">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-sky-700">What I Hear</div>
                  <span class="text-[10px] text-slate-400">Read Vibe Snapshot</span>
                </div>
                <div class="mt-1 text-xs font-semibold text-slate-900 leading-relaxed">
                  "{{ vibe.whatIHear }}"
                </div>

                <!-- Next Moves preview -->
                <div *ngIf="vibe.nextMoves?.length" class="mt-2.5 flex flex-wrap gap-2">
                  <div
                    *ngFor="let move of vibe.nextMoves"
                    class="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs border border-slate-200/60"
                    [class.text-emerald-700]="move.completed">
                    <span [class.text-emerald-600]="move.completed">
                      {{ move.completed ? '✓' : '•' }}
                    </span>
                    <span>{{ move.title }}</span>
                  </div>
                </div>
              </div>

              <!-- Fallback/Legacy AI Insights Snippet -->
              <div
                *ngIf="!entry.vibeAnalysis && (entry.aiInsights?.patterns?.length || entry.aiInsights?.suggestions?.length)"
                class="mt-card-soft mt-4 px-4 py-3">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI insights</div>
                <div class="mt-1 text-sm text-slate-700">
                  {{ (entry.aiInsights?.patterns || []).join(', ') || 'reflection' }}
                </div>
                <div *ngIf="entry.aiInsights?.suggestions?.length" class="mt-1 text-xs text-slate-600">
                  {{ entry.aiInsights?.suggestions?.[0] }}
                </div>
              </div>
            </article>
          </ng-container>

          <ng-template #loading>
            <div class="mt-card-soft px-4 py-8 text-center text-sm text-slate-600">
              <div class="comic-empty-state">
                <div class="comic-empty-illustration"></div>
                <div>Loading journal entries...</div>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </section>
  `
})
export class JournalPageComponent {
  entries$: Observable<JournalEntry[]>;
  recurringThemes$: Observable<RecurringTheme[]>;
  readonly selectedEntry = signal<JournalEntry | null>(null);

  constructor(private readonly journalService: JournalService) {
    this.entries$ = this.loadEntries();
    this.recurringThemes$ = this.loadThemes();
  }

  refresh(): void {
    this.entries$ = this.loadEntries();
    this.recurringThemes$ = this.loadThemes();
  }

  selectEntry(entry: JournalEntry): void {
    this.selectedEntry.set(entry);
    // Smooth scroll back to top of the page / editor
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  snippet(text: string): string {
    const trimmed = (text || "").trim();
    if (!trimmed) {
      return "";
    }
    return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
  }

  private loadEntries(): Observable<JournalEntry[]> {
    return this.journalService.list().pipe(catchError(() => of([])));
  }

  private loadThemes(): Observable<RecurringTheme[]> {
    return this.journalService.getRecurringThemes().pipe(
      map((res) => res.themes || []),
      catchError(() => of([]))
    );
  }
}
