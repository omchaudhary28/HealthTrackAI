import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { baselineGuard } from "./core/guards/baseline.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/landing/landing-page.component").then((m) => m.LandingPageComponent),
    data: { animation: "landing", themeKey: "landing" }
  },
  { path: "landing", redirectTo: "", pathMatch: "full" },
  {
    path: "about",
    loadComponent: () => import("./features/about/about-page.component").then((m) => m.AboutPageComponent),
    data: { animation: "about", themeKey: "about" }
  },
  {
    path: "auth",
    loadComponent: () => import("./features/auth/auth-page.component").then((m) => m.AuthPageComponent),
    data: { animation: "auth", themeKey: "auth" }
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard-page.component").then((m) => m.DashboardPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "dashboard", themeKey: "dashboard" }
  },
  {
    path: "tests",
    loadComponent: () =>
      import("./features/tests/test-center-page.component").then((m) => m.TestCenterPageComponent),
    data: { animation: "tests", themeKey: "tests" }
  },
  {
    path: "tests/baseline",
    loadComponent: () =>
      import("./features/tests/test-runner-page.component").then((m) => m.TestRunnerPageComponent),
    canActivate: [authGuard],
    data: { animation: "test-runner", themeKey: "tests" }
  },
  {
    path: "tests/:testKey",
    loadComponent: () =>
      import("./features/tests/test-runner-page.component").then((m) => m.TestRunnerPageComponent),
    canActivate: [authGuard],
    data: { animation: "test-runner", themeKey: "tests" }
  },
  {
    path: "mental-state",
    loadComponent: () =>
      import("./features/mental-state/mental-state-page.component").then((m) => m.MentalStatePageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "mental-state", themeKey: "mentalState" }
  },
  {
    path: "exercises",
    loadComponent: () =>
      import("./features/exercises/exercise-library-page.component").then((m) => m.ExerciseLibraryPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "exercises", themeKey: "exercises" }
  },
  {
    path: "mood",
    loadComponent: () =>
      import("./features/mood-calendar/mood-calendar-page.component").then((m) => m.MoodCalendarPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "mood", themeKey: "mood" }
  },
  { path: "mood-calendar", redirectTo: "mood", pathMatch: "full" },
  {
    path: "journal",
    loadComponent: () => import("./features/journal/journal-page.component").then((m) => m.JournalPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "journal", themeKey: "journal" }
  },
  {
    path: "community",
    loadComponent: () =>
      import("./features/community/community-forum-page.component").then((m) => m.CommunityForumPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "community", themeKey: "community" }
  },
  {
    path: "feedback",
    loadComponent: () =>
      import("./features/feedback/feedback-page.component").then((m) => m.FeedbackPageComponent),
    canActivate: [authGuard],
    data: { animation: "feedback", themeKey: "feedback" }
  },
  {
    path: "progress",
    loadComponent: () =>
      import("./features/progress/progress-tracker-page.component").then((m) => m.ProgressTrackerPageComponent),
    canActivate: [authGuard, baselineGuard],
    data: { animation: "progress", themeKey: "progress" }
  },
  {
    path: "profile",
    loadComponent: () => import("./features/profile/profile-page.component").then((m) => m.ProfilePageComponent),
    canActivate: [authGuard],
    data: { animation: "profile", themeKey: "profile" }
  },
  {
    path: "profile/:userId",
    loadComponent: () => import("./features/profile/profile-page.component").then((m) => m.ProfilePageComponent),
    canActivate: [authGuard],
    data: { animation: "profile", themeKey: "profile" }
  },
  { path: "**", redirectTo: "" }
];
