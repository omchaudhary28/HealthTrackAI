import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { Observable, catchError, of } from "rxjs";
import { JournalEntry, JournalService } from "../../core/services/journal.service";
import { JournalEditorComponent } from "../../shared/components/journal-editor.component";

@Component({
  selector: "app-journal-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, JournalEditorComponent],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-3xl border border-white/70 bg-[linear-gradient(145deg,rgba(142,184,215,0.18),rgba(216,214,239,0.22),rgba(255,255,255,0.86))] p-8 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.45)]">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Journaling</div>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">Write with calmer prompts, mood tags, and gentle pattern hints.</h1>
        <p class="mt-3 max-w-3xl text-base leading-8 text-slate-700">
          Your journal is for reflection and habit support. MindTrack AI is not a clinical or diagnostic system.
        </p>
      </div>

      <app-journal-editor (saved)="refresh()"></app-journal-editor>

      <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-slate-900">Recent entries</div>
            <div class="mt-1 text-xs leading-5 text-slate-500">A quick list to revisit what you wrote earlier.</div>
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
            <div *ngIf="!entries.length" class="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              No entries yet. Your first one can be short, even one sentence.
            </div>

            <article *ngFor="let entry of entries; let i = index" appScrollReveal [revealDelay]="i * 60" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {{ entry.createdAt ? (entry.createdAt | date : "mediumDate") : "Saved" }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of (entry.moodTags || []).slice(0, 4)" class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="mt-2 text-sm leading-7 text-slate-700">{{ snippet(entry.content) }}</div>
              <div *ngIf="entry.aiInsights?.patterns?.length || entry.aiInsights?.suggestions?.length" class="mt-4 rounded-2xl bg-white px-4 py-4">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI insights</div>
                <div class="mt-2 text-sm text-slate-700">
                  {{ (entry.aiInsights?.patterns || []).join(', ') || 'reflection' }}
                </div>
                <div *ngIf="entry.aiInsights?.suggestions?.length" class="mt-2 text-sm leading-7 text-slate-600">
                  {{ entry.aiInsights?.suggestions?.[0] }}
                </div>
              </div>
            </article>
          </ng-container>

          <ng-template #loading>
            <div class="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">Loading entries...</div>
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


