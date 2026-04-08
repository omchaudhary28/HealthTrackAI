import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Observable, catchError, finalize, firstValueFrom, map, of, tap, throwError, timeout } from "rxjs";
import { API_BASE_URL } from "../api/api.config";
import {
  readStorageJson,
  readStorageText,
  removeStorageItem,
  storageAvailable,
  writeStorageJson,
  writeStorageText
} from "../utils/storage";

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

interface StoredSession {
  token?: string | null;
  user?: UserProfile | null;
}

interface JwtPayload {
  exp?: number;
}

const AUTH_INITIALIZER_TIMEOUT_MS = 8000;

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly storageKey = "mindtrack-session";
  private readonly tokenStorageKey = "token";
  private readonly userStorageKey = "user";
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly tokenSignal = signal<string | null>(null);
  private initializationPromise?: Promise<void>;
  currentUser = signal<UserProfile | null>(null);

  constructor() {
    this.restoreSession();
  }

  initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    const token = this.getToken();
    if (!token) {
      return Promise.resolve();
    }

    if (this.currentUser()) {
      void this.refreshSession(true);
      return Promise.resolve();
    }

    return this.refreshSession(false);
  }

  private refreshSession(silent: boolean): Promise<void> {
    this.initializationPromise = firstValueFrom(
      this.refreshMe().pipe(
        timeout({ first: AUTH_INITIALIZER_TIMEOUT_MS }),
        map(() => undefined),
        catchError((error) => {
          if (isAuthorizationError(error)) {
            this.handleUnauthorized();
            return of(undefined);
          }

          if (!this.currentUser()) {
            this.clearSession();
          }

          if (!silent && !isExpectedAuthStartupError(error)) {
            logAuthWarning("Unable to restore the saved session during app startup.", error);
          }

          return of(undefined);
        }),
        finalize(() => {
          this.initializationPromise = undefined;
        })
      )
    );

    return this.initializationPromise;
  }

  getToken(): string | null {
    const token = this.tokenSignal();
    if (!token) {
      return null;
    }

    if (!isTokenStructurallyValid(token) || isTokenExpired(token)) {
      this.clearSession();
      return null;
    }

    return token;
  }

  isLoggedIn(): boolean {
    return Boolean(this.getToken());
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  token(): string {
    return this.getToken() || "";
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
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error("Authentication token is missing"));
    }

    return this.http.get<UserProfile>(`${this.apiBaseUrl}/auth/me`).pipe(
      tap((user) => {
        const activeToken = this.getToken();
        if (activeToken) {
          this.setSession(activeToken, user);
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
        const activeToken = this.getToken();
        if (activeToken) {
          this.setSession(activeToken, user);
        }
      })
    );
  }

  markBaselineComplete(): void {
    const token = this.getToken();
    const user = this.currentUser();
    if (!token || !user) {
      return;
    }

    this.setSession(token, { ...user, baselineComplete: true });
  }

  logout(): void {
    this.clearSession();
  }

  handleUnauthorized(): void {
    this.clearSession();
  }

  private setSession(token: string, user: UserProfile): void {
    this.tokenSignal.set(token);
    this.currentUser.set(user);
    this.persistSession(token, user);
  }

  private restoreSession(): void {
    const storedSession = this.readJson<StoredSession>(this.storageKey);
    const storedToken = storedSession?.token || this.readText(this.tokenStorageKey);
    const storedUser = storedSession?.user || this.readJson<UserProfile>(this.userStorageKey);

    if (!storedToken) {
      this.clearSession();
      return;
    }

    if (!isTokenStructurallyValid(storedToken) || isTokenExpired(storedToken)) {
      this.clearSession();
      return;
    }

    this.tokenSignal.set(storedToken);
    this.currentUser.set(storedUser || null);
    this.persistSession(storedToken, storedUser || null);
  }

  private persistSession(token: string, user: UserProfile | null): void {
    if (!storageAvailable()) {
      return;
    }

    writeStorageJson(this.storageKey, { token, user });
    writeStorageText(this.tokenStorageKey, token);

    if (user) {
      writeStorageJson(this.userStorageKey, user);
    } else {
      removeStorageItem(this.userStorageKey);
    }
  }

  private clearSession(): void {
    if (storageAvailable()) {
      removeStorageItem(this.storageKey);
      removeStorageItem(this.tokenStorageKey);
      removeStorageItem(this.userStorageKey);
    }

    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  private readJson<T>(key: string): T | null {
    return readStorageJson<T>(key);
  }

  private readText(key: string): string | null {
    return readStorageText(key);
  }
}

function isAuthorizationError(error: unknown): error is { status: number } {
  return Boolean(error && typeof error === "object" && "status" in error && Number((error as { status: number }).status) === 401);
}

function isExpectedAuthStartupError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { status?: number; name?: string; message?: string };
  if (candidate.status === 0) {
    return true;
  }

  if (candidate.name === "TimeoutError" || candidate.name === "AbortError") {
    return true;
  }

  return /timeout|network error|failed to fetch|abort/i.test(String(candidate.message || ""));
}

function isTokenStructurallyValid(token: string): boolean {
  const parts = String(token || "").split(".");
  return parts.length === 3 && Boolean(parseTokenPayload(token));
}

function isTokenExpired(token: string): boolean {
  const payload = parseTokenPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
}

function parseTokenPayload(token: string): JwtPayload | null {
  const parts = String(token || "").split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(parts[1]);
    return decoded ? (JSON.parse(decoded) as JwtPayload) : null;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string): string {
  if (!value || typeof atob !== "function") {
    return "";
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function logAuthWarning(message: string, error: unknown): void {
  console.warn(`[MindTrack] ${message}`, error);
}
