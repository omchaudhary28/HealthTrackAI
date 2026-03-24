import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { API_BASE_URL } from "./core/api/api.config";
import { authInterceptor } from "./core/api/auth.interceptor";

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
  }

  return "https://healthtrackai-v1ug.onrender.com/api/v1";
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
      provide: API_BASE_URL,
      useValue: resolveApiBaseUrl()
    }
  ]
};
