import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Observable, catchError, of } from "rxjs";
import { JournalEntry, JournalService } from "../../core/services/journal.service";
import { IconComponent } from "../../shared/components/icon.component";
import { JournalEditorComponent } from "../../shared/components/journal-editor.component";

@Component({
  selector: "app-journal-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, IconComponent, JournalEditorComponent],
  template: `
    <section appScrollReveal class="page-stack">
      <div class="theme-hero-card page-hero">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Journaling</div>
        <h1 class="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Write it out. Keep it light.</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
          No essay needed. Just enough to catch the vibe and your next move.
        </p>
      </div>

      <app-journal-editor (saved)="refresh()"></app-journal-editor>

      <div class="mt-card mt-card-hover p-5 sm:p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="mt-card-brand">
            <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
              <app-icon name="journal" className="text-base"></app-icon>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Recent entries</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Short reads from your earlier notes.</div>
            </div>
          </div>
          <button
            type="button"
            (click)="refresh()"
            class="btn-outline rounded-xl px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div class="mt-5 grid gap-3">
          <ng-container *ngIf="entries$ | async as entries; else loading">
            <div *ngIf="!entries.length" class="mt-card-soft px-4 py-4 text-sm text-slate-600">
              No entries yet. "One line is enough."
            </div>

            <article *ngFor="let entry of entries; let i = index" appScrollReveal [revealDelay]="i * 60" class="mt-card mt-card-hover p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="mt-card-brand min-w-0">
                  <div class="mt-card-icon h-11 w-11 rounded-[0.95rem]">
                    <app-icon name="journal" className="text-base"></app-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {{ entry.createdAt ? (entry.createdAt | date : "mediumDate") : "Saved" }}
                    </div>
                    <div class="mt-2 text-sm leading-7 text-slate-700">{{ snippet(entry.content) }}</div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of (entry.moodTags || []).slice(0, 4)" class="theme-chip-outline rounded-full px-3 py-1 text-xs font-semibold">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div *ngIf="entry.aiInsights?.patterns?.length || entry.aiInsights?.suggestions?.length" class="mt-card-soft mt-4 px-4 py-4">
                <div class="mt-card-brand">
                  <div class="mt-card-icon h-10 w-10 rounded-[0.85rem]">
                    <app-icon name="insights" className="text-sm"></app-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI insights</div>
                    <div class="mt-2 text-sm text-slate-700">
                      {{ (entry.aiInsights?.patterns || []).join(', ') || 'reflection' }}
                    </div>
                    <div *ngIf="entry.aiInsights?.suggestions?.length" class="mt-2 text-sm leading-7 text-slate-600">
                      {{ entry.aiInsights?.suggestions?.[0] }}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </ng-container>

          <ng-template #loading>
            <div class="mt-card-soft px-4 py-4 text-sm text-slate-600">Loading entries...</div>
          </ng-template>
        </div>
      </div>
    </section>
  `
})
export class JournalPageComponent {
  entries$: Observable<JournalEntry[]>;

  constructor(private readonly journalService: JournalService) {
    this.entries$ = this.load();
  }

  refresh(): void {
    this.entries$ = this.load();
  }

  snippet(text: string): string {
    const trimmed = (text || "").trim();
    if (!trimmed) {
      return "";
    }

    return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
  }

  private load(): Observable<JournalEntry[]> {
    return this.journalService.list().pipe(catchError(() => of([])));
  }
}


