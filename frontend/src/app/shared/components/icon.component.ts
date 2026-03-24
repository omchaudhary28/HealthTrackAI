import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

export type MindtrackIconName =
  | "dashboard"
  | "insights"
  | "tests"
  | "mood"
  | "journal"
  | "exercises"
  | "community"
  | "progress"
  | "profile";

@Component({
  selector: "app-icon",
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.class]="className"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="title ? 'img' : null"
      [attr.aria-hidden]="title ? null : 'true'">
      <title *ngIf="title">{{ title }}</title>

      <ng-container [ngSwitch]="name">
        <ng-container *ngSwitchCase="'dashboard'">
          <rect x="3" y="3" width="8" height="8" rx="2"></rect>
          <rect x="13" y="3" width="8" height="8" rx="2"></rect>
          <rect x="3" y="13" width="8" height="8" rx="2"></rect>
          <rect x="13" y="13" width="8" height="8" rx="2"></rect>
        </ng-container>

        <ng-container *ngSwitchCase="'insights'">
          <path d="M12 3c4.8 0 8.5 3.8 8.5 8.5S16.8 20 12 20 3.5 16.2 3.5 11.5 7.2 3 12 3z"></path>
          <path d="M9 12c.9-1.4 2-2.1 3-2.1s2.1.7 3 2.1"></path>
          <path d="M10 8.5h.01"></path>
          <path d="M14 8.5h.01"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'tests'">
          <rect x="7" y="3.5" width="10" height="18" rx="2"></rect>
          <path d="M9 3.5V2.6a1.1 1.1 0 0 1 1.1-1.1h3.8A1.1 1.1 0 0 1 15 2.6v0.9"></path>
          <path d="M10 12l1.5 1.5L14.8 10.2"></path>
          <path d="M9.5 16.2h5"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'mood'">
          <rect x="4" y="5" width="16" height="16" rx="2.2"></rect>
          <path d="M8 3v4"></path>
          <path d="M16 3v4"></path>
          <path d="M4 9h16"></path>
          <path d="M8 13h0.01"></path>
          <path d="M12 13h0.01"></path>
          <path d="M16 13h0.01"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'journal'">
          <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V4z"></path>
          <path d="M6 19.8V6a2 2 0 0 0-2-2h10"></path>
          <path d="M10 9h6"></path>
          <path d="M10 13h6"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'exercises'">
          <path d="M12 21s-7-4.3-7-10a4.2 4.2 0 0 1 7-2.2A4.2 4.2 0 0 1 19 11c0 5.7-7 10-7 10z"></path>
          <path d="M8.5 12.2l1.8 1.9L15.6 9"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'community'">
          <path d="M16.5 21a5.8 5.8 0 0 0-9 0"></path>
          <path d="M16 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"></path>
          <path d="M8 11.8a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4z"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'progress'">
          <path d="M4 18V6"></path>
          <path d="M4 18h16"></path>
          <path d="M7 14l3-3 3 3 5-6"></path>
          <path d="M18 8v3h-3"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'profile'">
          <path d="M12 21a9 9 0 1 0-0.01 0z"></path>
          <path d="M8 19a4.8 4.8 0 0 1 8 0"></path>
          <path d="M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"></path>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <path d="M12 6v6l4 2"></path>
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
        </ng-container>
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input({ required: true }) name: MindtrackIconName = "dashboard";
  @Input() title?: string;
  @Input() className = "h-5 w-5";
}
