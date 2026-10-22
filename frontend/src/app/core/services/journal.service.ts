import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface JournalInsights {
  patterns?: string[];
  tone?: string | number;
  suggestions?: string[];
}

export interface RootConcern {
  concern: string;
  explanation: string;
}

export interface EmotionalTheme {
  emotion: string;
  context: string;
}

export interface MaintainingCycle {
  steps: string[];
  summary: string;
}

export interface NextMoveAction {
  title: string;
  whyItHelps: string;
  smallStart: string;
  timeEstimate?: string;
  completed?: boolean;
}

export interface RecurringTheme {
  theme: string;
  observation: string;
  datesOrParaphrase: string;
}

export interface HistoricalContext {
  recurringThemes: RecurringTheme[];
  note?: string;
}

export interface SafetyNotice {
  isCrisis: boolean;
  message: string;
  resources: string[];
}

export interface VibeAnalysis {
  whatIHear: string;
  rootConcerns: RootConcern[];
  emotionalThemes: EmotionalTheme[];
  maintainingCycle?: MaintainingCycle | null;
  nextMoves: NextMoveAction[];
  reflectionQuestion: string;
  gentleClosing: string;
  historicalContext?: HistoricalContext;
  safetyNotice?: SafetyNotice;
  provider?: string;
  analyzedAt?: string;
}

export interface FollowUpMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface JournalEntry {
  _id: string;
  content: string;
  moodTags?: string[];
  aiPrompt?: string;
  aiInsights?: JournalInsights;
  vibeAnalysis?: VibeAnalysis;
  followUpMessages?: FollowUpMessage[];
  allowHistoricalAnalysis?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJournalEntryPayload {
  content: string;
  moodTags?: string[];
  aiPrompt?: string;
}

export interface ReadVibeResponse {
  entryId: string;
  vibeAnalysis: VibeAnalysis;
  followUpMessages: FollowUpMessage[];
}

export interface FollowUpResponse {
  reply: string;
  provider?: string;
  followUpMessages: FollowUpMessage[];
}

export interface ToggleNextMoveResponse {
  actionIndex: number;
  completed: boolean;
  nextMoves: NextMoveAction[];
}

export interface RecurringThemesResponse {
  themes: RecurringTheme[];
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

  readVibe(entryId: string, payload: { content?: string; moodTags?: string[]; recentMood?: string; allowHistorical?: boolean } = {}): Observable<ReadVibeResponse> {
    return this.http.post<ReadVibeResponse>(`${this.apiBaseUrl}/journal/${entryId}/read-vibe`, payload);
  }

  sendFollowUp(entryId: string, message: string): Observable<FollowUpResponse> {
    return this.http.post<FollowUpResponse>(`${this.apiBaseUrl}/journal/${entryId}/follow-up`, { message });
  }

  toggleNextMove(entryId: string, actionIndex: number, completed?: boolean): Observable<ToggleNextMoveResponse> {
    return this.http.patch<ToggleNextMoveResponse>(`${this.apiBaseUrl}/journal/${entryId}/next-moves/${actionIndex}`, { completed });
  }

  getRecurringThemes(): Observable<RecurringThemesResponse> {
    return this.http.get<RecurringThemesResponse>(`${this.apiBaseUrl}/journal/recurring-themes`);
  }
}
