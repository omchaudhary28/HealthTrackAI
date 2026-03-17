import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { API_BASE_URL } from "./core/api/api.config";
import { authInterceptor } from "./core/api/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: API_BASE_URL,
      useValue: "https://healthtrackai-v1ug.onrender.com"
    }
  ]
};