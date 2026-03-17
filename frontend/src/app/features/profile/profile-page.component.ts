import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [ScrollRevealDirective, CommonModule, FormsModule],
  template: `
    <section appScrollReveal class="space-y-6">
      <div class="rounded-[2.5rem] border border-white/70 bg-white/80 p-7 shadow-[0_25px_70px_-45px_rgba(32,50,71,0.55)] backdrop-blur">
        <div class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">User profile</div>
        <h1 class="mt-2 text-3xl font-semibold text-slate-900">Context fields that shape recommendations and trend analysis.</h1>
      </div>
      <form class="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(32,50,71,0.45)] backdrop-blur">
        <div class="grid gap-5 md:grid-cols-2">
          <label class="block text-sm font-medium text-slate-600">Name
            <input [(ngModel)]="profile.name" name="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600">Gender
            <input [(ngModel)]="profile.gender" name="gender" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600">Occupation
            <input [(ngModel)]="profile.occupation" name="occupation" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600">Sleep habits
            <input [(ngModel)]="profile.sleepHabits" name="sleepHabits" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600 md:col-span-2">Lifestyle indicators
            <input [(ngModel)]="profile.lifestyleIndicators" name="lifestyleIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
          <label class="block text-sm font-medium text-slate-600 md:col-span-2">Stress indicators
            <input [(ngModel)]="profile.stressIndicators" name="stressIndicators" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </label>
        </div>
      </form>
    </section>
  `
})
export class ProfilePageComponent {
  profile = {
    name: "Avery",
    gender: "Female",
    occupation: "Product designer",
    sleepHabits: "Screen time before bed",
    lifestyleIndicators: "Remote work, low movement during weekdays",
    stressIndicators: "Deadline pressure, overthinking, shallow sleep"
  };
}


