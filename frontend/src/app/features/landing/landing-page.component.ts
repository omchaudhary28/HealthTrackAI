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
      description: "Surface breathing, grounding, reframing, gratitude, and sleep rituals based on evolving user signals."
    },
    {
      kicker: "Connect",
      title: "Anonymous community support",
      description: "Offer moderated anonymous discussion spaces for users who want shared encouragement without identity exposure."
    }
  ];

  benefits = [
    "Human-like AI responses grounded in your recent patterns",
    "Dynamic recommendations with clear why and expected outcome",
    "Glassmorphism UI with mobile-first layouts and fast route transitions"
  ];

  steps = [
    {
      title: "Check in once",
      description: "Complete a baseline or a quick mood entry so the platform has real context to work from."
    },
    {
      title: "Get a pattern snapshot",
      description: "MindTrack blends assessments, mood logs, journal signals, and activity history into a supportive state summary."
    },
    {
      title: "Act on the next best step",
      description: "Follow a recommendation with a clear reason, expected outcome, and completion tracking."
    }
  ];
}


