import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const baselineGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    return true;
  }

  if (user.baselineComplete) {
    return true;
  }

  if (state.url.startsWith("/tests/baseline")) {
    return true;
  }

  return router.createUrlTree(["/tests", "baseline"]);
};

