import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DailyInsightCardComponent } from "../../shared/components/daily-insight-card.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, RouterLink, DailyInsightCardComponent],
  templateUrl: "./landing-page.component.html"
})
export class LandingPageComponent {
  features = [
    {
      kicker: "Assess",
      title: "Baseline wellness testing",
      description: "Measure stress, anxiety, mood stability, focus, emotional sensitivity, and social comfort during onboarding."
    },
    {
      kicker: "Reflect",
      title: "Guided journaling and prompts",
      description: "Capture daily reflections with mood tags, AI prompts, and pattern analysis for rumination or self-criticism."
    },
    {
      kicker: "Improve",
      title: "Exercises matched to current needs",
      description: "Surface breathing, meditation, reframing, gratitude, and sleep rituals based on the user profile and scores."
    },
    {
      kicker: "Connect",
      title: "Anonymous community support",
      description: "Offer moderated anonymous discussion spaces for users who want shared encouragement without identity exposure."
    }
  ];
}


