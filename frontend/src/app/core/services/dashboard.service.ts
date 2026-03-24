import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../api/api.config";
import { Exercise } from "./exercises.service";

export interface TrendSeries {
  labels: string[];
  values: number[];
}

export interface ActivitySummary {
  moodCheckIns30d: number;
  journalEntries30d: number;
  exerciseCompleted30d: number;
  exerciseStreak: number;
  journalStreak: number;
}

export interface DashboardSummary {
  latestBaseline: any | null;
  recentMoodLogs: any[];
  recentJournalEntries: any[];
  mentalStates: any[];
  communityVisiblePosts: number;
  currentMentalState?: any | null;
  suggestedAction?: {
    title: string;
    purpose: string;
    expectedOutcome: string;
    whyRecommended: string;
    durationMinutes: number;
  } | null;
  recommendationCards?: Exercise[];
  analytics?: {
    scoreTrend: TrendSeries;
    moodTrend: TrendSeries;
    stressTrend: TrendSeries;
    exerciseMomentum: TrendSeries;
  };
  activitySummary?: ActivitySummary;
  user?: any | null;
  aiInsightsHistory?: any[];
  journalSignals?: {
    patterns: string[];
    sentiment: number;
  };
  exerciseHistory?: {
    totalCompleted: number;
  };
  error?: boolean;
}

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiBaseUrl}/dashboard/summary`);
  }
}
