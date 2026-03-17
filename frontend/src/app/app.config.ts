import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { DEFAULT_API_BASE_URL, API_BASE_URL } from "./core/api/api.config";
import { authInterceptor } from "./core/api/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: DEFAULT_API_BASE_URL },
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideAnimations()
  ]
};
