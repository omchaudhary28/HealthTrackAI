import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface TestSummary {
  key: string;
  title: string;
  category: string;
  description: string;
  scoringScale?: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  dimension: string;
}

export interface TestDefinition extends TestSummary {
  questions: TestQuestion[];
  interpretationGuide?: string[];
}

export interface TestAnswer {
  questionId: string;
  value: number;
}

@Injectable({ providedIn: "root" })
export class TestsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listTests(): Observable<TestSummary[]> {
    return this.http
      .get<{ items: TestSummary[] }>(`${this.apiBaseUrl}/tests`)
      .pipe(map((response) => response.items || []));
  }

  getTest(testKey: string): Observable<TestDefinition> {
    return this.http.get<TestDefinition>(`${this.apiBaseUrl}/tests/${encodeURIComponent(testKey)}`);
  }

  submitTest(testKey: string, answers: TestAnswer[]): Observable<unknown> {
    if (testKey === "baseline") {
      return this.http.post(`${this.apiBaseUrl}/assessment/baseline`, { answers });
    }

    return this.http.post(`${this.apiBaseUrl}/tests/${encodeURIComponent(testKey)}/submissions`, { answers });
  }
}

