import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface Exercise {
  key?: string;
  _id?: string;
  title: string;
  category: string;
  difficulty?: "easy" | "medium" | "advanced";
  durationMinutes: number;
  purpose?: string;
  description: string;
  expectedOutcome?: string;
  benefits?: string[];
  instructions?: string[];
  tags?: string[];
  bestForStates?: string[];
  whyRecommended?: string;
  whatYouWillAchieve?: string;
  aiReasoning?: string[];
  recommendationScore?: number;
}

interface ListExercisesResponse {
  items: Exercise[];
}

interface RecommendedExercisesResponse {
  items: Exercise[];
}

export interface ExerciseCompletionPayload {
  exerciseKey?: string;
  exerciseTitle: string;
  category?: string;
  durationMinutes?: number;
  source?: string;
  feedbackRating?: number;
  feedbackText?: string;
  resultAfter?: string;
  whyRecommended?: string;
  expectedOutcome?: string;
}

@Injectable({ providedIn: "root" })
export class ExercisesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(category?: string): Observable<Exercise[]> {
    const params = category ? { category } : undefined;
    return this.http
      .get<ListExercisesResponse>(`${this.apiBaseUrl}/exercises`, { params })
      .pipe(map((res) => res.items || []));
  }

  recommended(): Observable<Exercise[]> {
    return this.http
      .get<RecommendedExercisesResponse>(`${this.apiBaseUrl}/exercises/recommended`)
      .pipe(map((res) => res.items || []));
  }

  complete(payload: ExerciseCompletionPayload): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/exercises/completions`, payload);
  }
}
