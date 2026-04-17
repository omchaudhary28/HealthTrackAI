import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DailyInsightCardComponent } from "../../shared/components/daily-insight-card.component";
import { IconComponent, MindtrackIconName } from "../../shared/components/icon.component";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, RouterLink, IconComponent, DailyInsightCardComponent],
  templateUrl: "./landing-page.component.html"
})
export class LandingPageComponent {
  features: Array<{ kicker: string; title: string; description: string; icon: MindtrackIconName }> = [
    {
      kicker: "Mission 01",
      title: "Scan your mind",
      description: "Fast baseline. Fast clarity.",
      icon: "tests"
    },
    {
      kicker: "Mission 02",
      title: "Dump your thoughts",
      description: "No essay. Just the raw thought.",
      icon: "journal"
    },
    {
      kicker: "Mission 03",
      title: "Calm your mind",
      description: "One reset move matched to your state.",
      icon: "exercises"
    },
    {
      kicker: "Side Quest",
      title: "Crew support",
      description: "Share small wins. Stay anonymous.",
      icon: "community"
    }
  ];

  benefits = [
    "XP for every action",
    "Mood-aware AI guide",
    "Playful flow, low friction"
  ];

  steps = [
    {
      title: "Ping your mood",
      description: "Quick check. No overthinking."
    },
    {
      title: "Get your read",
      description: "MindTrack builds your mind snapshot."
    },
    {
      title: "Run one mission",
      description: "Dump, calm, or scan. Stack XP."
    }
  ];
}


