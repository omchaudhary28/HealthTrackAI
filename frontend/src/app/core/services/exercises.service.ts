import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface Exercise {
  _id?: string;
  title: string;
  category: string;
  difficulty?: "easy" | "medium" | "advanced";
  durationMinutes: number;
  description: string;
  instructions?: string[];
  tags?: string[];
}

interface ListExercisesResponse {
  items: Exercise[];
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
}

