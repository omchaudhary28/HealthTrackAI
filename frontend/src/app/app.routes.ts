import { Routes } from "@angular/router";
import { AuthPageComponent } from "./features/auth/auth-page.component";
import { CommunityForumPageComponent } from "./features/community/community-forum-page.component";
import { DashboardPageComponent } from "./features/dashboard/dashboard-page.component";
import { ExerciseLibraryPageComponent } from "./features/exercises/exercise-library-page.component";
import { JournalPageComponent } from "./features/journal/journal-page.component";
import { LandingPageComponent } from "./features/landing/landing-page.component";
import { MentalStatePageComponent } from "./features/mental-state/mental-state-page.component";
import { MoodCalendarPageComponent } from "./features/mood-calendar/mood-calendar-page.component";
import { ProfilePageComponent } from "./features/profile/profile-page.component";
import { ProgressTrackerPageComponent } from "./features/progress/progress-tracker-page.component";
import { TestCenterPageComponent } from "./features/tests/test-center-page.component";
import { TestRunnerPageComponent } from "./features/tests/test-runner-page.component";
import { authGuard } from "./core/guards/auth.guard";
import { baselineGuard } from "./core/guards/baseline.guard";

export const routes: Routes = [
  { path: "", component: LandingPageComponent, data: { animation: "landing" } },
  { path: "landing", redirectTo: "", pathMatch: "full" },
  { path: "auth", component: AuthPageComponent, data: { animation: "auth" } },
  { path: "dashboard", component: DashboardPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "dashboard" } },
  { path: "tests", component: TestCenterPageComponent, data: { animation: "tests" } },
  { path: "tests/baseline", component: TestRunnerPageComponent, canActivate: [authGuard], data: { animation: "test-runner" } },
  { path: "tests/:testKey", component: TestRunnerPageComponent, canActivate: [authGuard], data: { animation: "test-runner" } },
  { path: "mental-state", component: MentalStatePageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "mental-state" } },
  { path: "exercises", component: ExerciseLibraryPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "exercises" } },
  { path: "mood", component: MoodCalendarPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "mood" } },
  { path: "mood-calendar", redirectTo: "mood", pathMatch: "full" },
  { path: "journal", component: JournalPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "journal" } },
  { path: "community", component: CommunityForumPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "community" } },
  { path: "progress", component: ProgressTrackerPageComponent, canActivate: [authGuard, baselineGuard], data: { animation: "progress" } },
  { path: "profile", component: ProfilePageComponent, canActivate: [authGuard], data: { animation: "profile" } },
  { path: "**", redirectTo: "" }
];
