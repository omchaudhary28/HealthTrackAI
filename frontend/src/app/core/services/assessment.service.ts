import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface LatestAssessmentState {
  mentalState: any | null;
  latestBaseline: any | null;
}

@Injectable({ providedIn: "root" })
export class AssessmentService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getLatest(): Observable<LatestAssessmentState> {
    return this.http.get<LatestAssessmentState>(`${this.apiBaseUrl}/assessment/state/latest`);
  }
}

