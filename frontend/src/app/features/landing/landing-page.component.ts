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
      title: "Quick vibe check",
      description: "Start with a fast baseline so the app knows where you're at."
    },
    {
      kicker: "Reflect",
      title: "Journal, no essay",
      description: "Drop a few lines, tag the mood, and let the app spot the loop."
    },
    {
      kicker: "Improve",
      title: "Exercises that fit today",
      description: "Breathing, grounding, and reset moves picked for your current state."
    },
    {
      kicker: "Connect",
      title: "Low-key support feed",
      description: "Post short updates, stay anonymous, and skip the oversharing."
    }
  ];

  benefits = [
    "\"Tiny wins > perfect plans.\"",
    "AI replies shaped by your recent patterns",
    "Fast mobile UI that stays out of your way"
  ];

  steps = [
    {
      title: "Check in",
      description: "Do a baseline or drop one mood log."
    },
    {
      title: "Get the read",
      description: "MindTrack blends your logs into one clean snapshot."
    },
    {
      title: "Make one move",
      description: "Pick the next step and keep it chill."
    }
  ];
}


