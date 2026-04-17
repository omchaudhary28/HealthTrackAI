import { Component, Input } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRightLong,
  faArrowTrendUp,
  faArrowsRotate,
  faBookOpen,
  faBolt,
  faBrain,
  faBullseye,
  faCalendarDays,
  faChartLine,
  faChartPie,
  faChartSimple,
  faClock,
  faClipboard,
  faClipboardList,
  faComments,
  faDumbbell,
  faFaceSmileBeam,
  faFire,
  faGear,
  faHeart,
  faHeartPulse,
  faListCheck,
  faMessage,
  faPenNib,
  faRobot,
  faShareNodes,
  faShieldHeart,
  faSpa,
  faUser,
  faUserGear,
  faUsers,
  faWaveSquare,
  faWandSparkles
} from "@fortawesome/free-solid-svg-icons";

export type MindtrackIconName =
  | "activity"
  | "analytics"
  | "arrow"
  | "bot"
  | "brain"
  | "calendar"
  | "chart-line"
  | "clipboard"
  | "comments"
  | "community"
  | "compose"
  | "dashboard"
  | "exercises"
  | "feedback"
  | "heart"
  | "heartbeat"
  | "insights"
  | "journal"
  | "lightning"
  | "message"
  | "mood"
  | "pen"
  | "profile"
  | "progress"
  | "pulse"
  | "refresh"
  | "settings"
  | "share"
  | "shield"
  | "smile"
  | "spa"
  | "sparkles"
  | "streak"
  | "target"
  | "tests"
  | "time"
  | "user-settings"
  | "users"
  | "wand";

const ICONS: Record<MindtrackIconName, IconDefinition> = {
  activity: faDumbbell,
  analytics: faChartSimple,
  arrow: faArrowRightLong,
  bot: faRobot,
  brain: faBrain,
  calendar: faCalendarDays,
  "chart-line": faChartLine,
  clipboard: faClipboard,
  comments: faComments,
  community: faUsers,
  compose: faPenNib,
  dashboard: faChartPie,
  exercises: faHeartPulse,
  feedback: faComments,
  heart: faHeart,
  heartbeat: faHeartPulse,
  insights: faWandSparkles,
  journal: faBookOpen,
  lightning: faBolt,
  message: faMessage,
  mood: faFaceSmileBeam,
  pen: faPenNib,
  profile: faUser,
  progress: faArrowTrendUp,
  pulse: faWaveSquare,
  refresh: faArrowsRotate,
  settings: faGear,
  share: faShareNodes,
  shield: faShieldHeart,
  smile: faFaceSmileBeam,
  spa: faSpa,
  sparkles: faWandSparkles,
  streak: faFire,
  target: faBullseye,
  tests: faClipboardList,
  time: faClock,
  "user-settings": faUserGear,
  users: faUsers,
  wand: faWandSparkles
};

@Component({
  selector: "app-icon",
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <fa-icon
      [icon]="icon()"
      [title]="title"
      [class]="className"
      [attr.aria-hidden]="title ? null : 'true'"></fa-icon>
  `
})
export class IconComponent {
  @Input({ required: true }) name: MindtrackIconName = "dashboard";
  @Input() title?: string;
  @Input() className = "h-5 w-5";

  icon(): IconDefinition {
    return ICONS[this.name] || faWandSparkles;
  }
}
