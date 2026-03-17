import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface JournalInsights {
  patterns?: string[];
  tone?: string;
  suggestions?: string[];
}

export interface JournalEntry {
  _id: string;
  content: string;
  moodTags?: string[];
  aiPrompt?: string;
  aiInsights?: JournalInsights;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJournalEntryPayload {
  content: string;
  moodTags?: string[];
  aiPrompt?: string;
}

interface ListJournalEntriesResponse {
  items: JournalEntry[];
}

@Injectable({ providedIn: "root" })
export class JournalService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<JournalEntry[]> {
    return this.http.get<ListJournalEntriesResponse>(`${this.apiBaseUrl}/journal`).pipe(map((res) => res.items || []));
  }

  create(payload: CreateJournalEntryPayload): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(`${this.apiBaseUrl}/journal`, payload);
  }

  analyze(entryId: string, recentMood?: number): Observable<JournalInsights> {
    return this.http.post<JournalInsights>(`${this.apiBaseUrl}/journal/${entryId}/analyze`, { recentMood });
  }
}

