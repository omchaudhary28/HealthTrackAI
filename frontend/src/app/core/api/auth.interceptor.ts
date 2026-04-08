import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { API_BASE_URL } from "./api.config";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const apiBaseUrl = inject(API_BASE_URL);
  const isApiRequest = isMindTrackApiRequest(req.url, apiBaseUrl);
  const token = isApiRequest ? authService.getToken() : null;

  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (shouldHandleUnauthorized(error, request.url, isApiRequest)) {
        authService.handleUnauthorized();

        const currentUrl = router.url || "/";
        if (shouldRedirectToAuth(currentUrl)) {
          void router.navigate(["/auth"], {
            queryParams: currentUrl ? { next: currentUrl } : undefined
          });
        }
      }

      return throwError(() => error);
    })
  );
};

function isMindTrackApiRequest(url: string, apiBaseUrl: string): boolean {
  const normalizedBaseUrl = String(apiBaseUrl || "").replace(/\/$/, "");
  return url.startsWith(normalizedBaseUrl) || url.startsWith("/api/");
}

function shouldHandleUnauthorized(error: unknown, url: string, isApiRequest: boolean): boolean {
  return (
    isApiRequest &&
    error instanceof HttpErrorResponse &&
    error.status === 401 &&
    !isPublicAuthEndpoint(url)
  );
}

function isPublicAuthEndpoint(url: string): boolean {
  const normalized = String(url || "").toLowerCase();
  return (
    normalized.includes("/auth/login") ||
    normalized.includes("/auth/signup") ||
    normalized.includes("/auth/lookup")
  );
}

function shouldRedirectToAuth(url: string): boolean {
  const normalized = String(url || "").split("?")[0];
  return !(
    normalized === "/" ||
    normalized.startsWith("/auth") ||
    normalized.startsWith("/about") ||
    normalized.startsWith("/landing")
  );
}
