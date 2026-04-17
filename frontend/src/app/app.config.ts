import { APP_INITIALIZER, ApplicationConfig, ErrorHandler } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { API_BASE_URL } from "./core/api/api.config";
import { authInterceptor } from "./core/api/auth.interceptor";
import { AppErrorHandler } from "./core/errors/app-error-handler";
import { AuthService } from "./core/services/auth.service";

const RENDER_API_BASE_URL = "https://healthtrackai-v1ug.onrender.com/api/v1";

declare global {
  interface Window {
    __mindtrackApiBaseUrl?: string;
    __mindtrackConfig?: {
      apiBaseUrl?: string;
    };
  }
}

function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const configured =
      window.__mindtrackConfig?.apiBaseUrl ||
      window.__mindtrackApiBaseUrl;

    if (configured) {
      return configured.replace(/\/$/, "");
    }

    if (isLocalDevelopmentHost(window.location.hostname)) {
      return "http://localhost:4000/api/v1";
    }

    return RENDER_API_BASE_URL;
  }

  return RENDER_API_BASE_URL;
}

function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => authService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
        anchorScrolling: "enabled"
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler
    },
    {
      provide: API_BASE_URL,
      useValue: resolveApiBaseUrl()
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};

function isLocalDevelopmentHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}
