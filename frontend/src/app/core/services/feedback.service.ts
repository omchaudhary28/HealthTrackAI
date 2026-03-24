import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  pageContext: string;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  submit(payload: { rating: number; category: string; pageContext?: string; message: string }): Observable<FeedbackItem> {
    return this.http.post<FeedbackItem>(`${this.apiBaseUrl}/feedback`, payload);
  }

  mine(): Observable<{ items: FeedbackItem[] }> {
    return this.http.get<{ items: FeedbackItem[] }>(`${this.apiBaseUrl}/feedback/mine`);
  }
}
