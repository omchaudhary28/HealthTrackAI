import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  baselineComplete: boolean;
  profile?: {
    age?: number;
    gender?: string;
    occupation?: string;
    lifestyleIndicators?: string[];
    stressIndicators?: string[];
    sleepHabits?: string;
    headline?: string;
    bio?: string;
    allowDirectMessages?: boolean;
    shareProgressPublicly?: boolean;
  };
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  profile?: UserProfile["profile"];
}

export interface AuthLookupResponse {
  exists: boolean;
  recommendedMode: "login" | "signup";
  name?: string | null;
  baselineComplete?: boolean;
}

interface AuthResponse {
  token: string;
  user: UserProfile;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly storageKey = "mindtrack-session";
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly tokenSignal = signal<string | null>(null);
  currentUser = signal<UserProfile | null>(null);

  constructor() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      if (parsed?.token && parsed?.user) {
        this.tokenSignal.set(parsed.token);
        this.currentUser.set(parsed.user);
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.tokenSignal());
  }

  token(): string {
    return this.tokenSignal() || "";
  }

  signup(payload: SignupPayload): Observable<UserProfile> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/signup`, payload).pipe(
      tap((response) => this.setSession(response.token, response.user)),
      map((response) => response.user)
    );
  }

  login(email: string, password: string): Observable<UserProfile> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => this.setSession(response.token, response.user)),
        map((response) => response.user)
      );
  }

  refreshMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiBaseUrl}/auth/me`).pipe(
      tap((user) => {
        const token = this.tokenSignal();
        if (token) {
          this.setSession(token, user);
        }
      })
    );
  }

  lookup(email: string): Observable<AuthLookupResponse> {
    return this.http.get<AuthLookupResponse>(`${this.apiBaseUrl}/auth/lookup`, {
      params: { email: email.trim() }
    });
  }

  updateProfile(payload: Partial<Pick<UserProfile, "name" | "profile">>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiBaseUrl}/auth/me`, payload).pipe(
      tap((user) => {
        const token = this.tokenSignal();
        if (token) {
          this.setSession(token, user);
        }
      })
    );
  }

  markBaselineComplete(): void {
    const token = this.tokenSignal();
    const user = this.currentUser();
    if (!token || !user) {
      return;
    }

    this.setSession(token, { ...user, baselineComplete: true });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  private setSession(token: string, user: UserProfile): void {
    this.tokenSignal.set(token);
    this.currentUser.set(user);
    localStorage.setItem(this.storageKey, JSON.stringify({ token, user }));
  }
}
