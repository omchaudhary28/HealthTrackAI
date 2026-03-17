import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface MoodLog {
  _id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  stressLevel: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMoodLogPayload {
  date?: string; // ISO date or datetime; backend normalizes to midnight.
  mood: 1 | 2 | 3 | 4 | 5;
  stressLevel: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface ListMoodLogsResponse {
  items: MoodLog[];
}

@Injectable({ providedIn: "root" })
export class MoodService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<MoodLog[]> {
    return this.http.get<ListMoodLogsResponse>(`${this.apiBaseUrl}/mood-logs`).pipe(map((res) => res.items || []));
  }

  upsert(payload: CreateMoodLogPayload): Observable<MoodLog> {
    return this.http.post<MoodLog>(`${this.apiBaseUrl}/mood-logs`, payload);
  }
}

