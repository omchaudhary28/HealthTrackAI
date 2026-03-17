import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface DashboardSummary {
  latestBaseline: any | null;
  recentMoodLogs: any[];
  recentJournalEntries: any[];
  mentalStates: any[];
  communityVisiblePosts: number;
  error?: boolean;
}

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  scoreLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  scoreValues = [58, 61, 64, 69, 72];
  recommendations = [
    { title: "5 minute breathing reset", detail: "Strong fit for elevated stress and recurring mental loops." },
    { title: "Thought reframing loop", detail: "Useful when anxiety and rumination both trend upward." },
    { title: "Sleep wind-down checklist", detail: "Supports recovery when focus starts to dip." }
  ];

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiBaseUrl}/dashboard/summary`);
  }
}

