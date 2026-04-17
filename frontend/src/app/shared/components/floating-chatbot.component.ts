import { CommonModule } from "@angular/common";
import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatbotService } from "../../core/services/chatbot.service";
import { AuthService } from "../../core/services/auth.service";
import { readStorageJson, writeStorageJson } from "../../core/utils/storage";
import { IconComponent } from "./icon.component";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

@Component({
  selector: "app-floating-chatbot",
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-[calc(var(--mt-safe-bottom)+0.75rem)] right-3 z-40 sm:bottom-5 sm:right-5">
      <button
        type="button"
        (click)="open = !open"
        [attr.aria-expanded]="open"
        aria-controls="mindtrack-chatbot-panel"
        class="group mt-card mt-card-hover flex h-14 w-14 items-center justify-center rounded-full p-0 text-[var(--mt-accent-strong)] shadow-lg ring-1 ring-white/70">
        <app-icon name="bot" className="icon-bounce-soft text-xl transition group-hover:scale-105"></app-icon>
      </button>

      <div
        id="mindtrack-chatbot-panel"
        class="fixed inset-x-3 bottom-[calc(var(--mt-safe-bottom)+5rem)] max-h-[min(70vh,38rem)] origin-bottom overflow-hidden rounded-[1.75rem] border border-white/60 bg-[linear-gradient(155deg,rgba(247,251,255,0.92),rgba(234,242,249,0.86),rgba(220,232,244,0.82))] shadow-2xl backdrop-blur transition-all duration-200 sm:absolute sm:inset-x-auto sm:bottom-16 sm:right-0 sm:w-[22rem] sm:max-h-none sm:max-w-[calc(100vw-2.5rem)] sm:origin-bottom-right sm:rounded-3xl"
        [class.pointer-events-none]="!open"
        [class.opacity-0]="!open"
        [class.translate-y-2]="!open"
        [class.scale-95]="!open">
        <div class="border-b border-slate-200/80 bg-[linear-gradient(145deg,rgba(249,252,255,0.88),rgba(238,245,251,0.78),var(--mt-accent-soft))] px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="mt-card-brand">
              <div class="assistant-avatar">
                <app-icon name="bot" className="icon-bounce-soft text-sm"></app-icon>
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-900">MindTrack Assistant</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">Supportive wellness guidance only. Not medical advice or diagnosis.</div>
              </div>
            </div>
            <button
              type="button"
              (click)="open = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-[rgba(247,250,254,0.94)] text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Close assistant">
              <app-icon name="arrow" className="text-sm rotate-45"></app-icon>
            </button>
          </div>

          <div class="chip-scroll mt-3">
            <button
              *ngFor="let chip of quickChips"
              type="button"
              (click)="sendQuick(chip)"
              [disabled]="pending"
              class="rounded-full border border-slate-200 bg-[rgba(246,250,254,0.92)] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
              {{ chip }}
            </button>
          </div>
        </div>

        <div #scrollViewport class="max-h-[min(36vh,18rem)] space-y-3 overflow-y-auto px-4 py-4 scroll-smooth sm:max-h-80">
          <div *ngFor="let item of messages; trackBy: trackByTimestamp" class="flex" [class.justify-end]="item.role === 'user'">
            <div
              class="message-in chat-speech-bubble max-w-[92%] px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-200 sm:max-w-[85%]"
              [class.chat-speech-bubble-user]="item.role === 'user'"
              [class.bg-blue-500]="item.role === 'user'"
              [class.text-white]="item.role === 'user'"
              [class.border-blue-200]="item.role === 'user'"
              [class.bg-slate-100]="item.role === 'assistant'"
              [class.border-slate-200]="item.role === 'assistant'"
              [class.text-gray-800]="item.role === 'assistant'">
              <div class="flex items-start gap-3">
                <div *ngIf="item.role === 'assistant'" class="assistant-avatar assistant-avatar-sm">
                  <app-icon name="bot" className="text-xs"></app-icon>
                </div>
                <div>
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="pending" class="flex items-center gap-2 text-xs text-slate-500">
            <span>Assistant is thinking...</span>
            <span class="typing-dots">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </span>
          </div>
        </div>

        <div class="sticky bottom-0 border-t border-slate-200/80 bg-[rgba(243,248,253,0.94)] p-4 backdrop-blur">
          <textarea
            [(ngModel)]="draft"
            (keydown.enter)="onEnter($event)"
            rows="2"
            placeholder="I feel overwhelmed..."
            class="app-textarea w-full resize-none rounded-2xl px-4 py-3 text-sm leading-6"></textarea>
          <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              (click)="send()"
              [disabled]="pending || !draft.trim()"
              class="flex-1 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
              Send
            </button>
            <button
              type="button"
              (click)="clear()"
              class="rounded-2xl border border-slate-200 bg-[rgba(247,250,254,0.94)] px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white active:scale-[0.98]">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FloatingChatbotComponent implements AfterViewChecked {
  @ViewChild("scrollViewport") scrollViewport?: ElementRef<HTMLDivElement>;

  private readonly storageKey = "mindtrack-chat-memory";
  open = false;
  draft = "";
  pending = false;
  messages: ChatMessage[] = [];
  quickChips = ["I feel lost", "Give me a journaling prompt", "Explain my latest mental state"];

  private shouldAutoScroll = true;
  private requestId = 0;
  private lastHandledRequestId = 0;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.messages = this.readSavedMessages();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldAutoScroll) {
      return;
    }

    const el = this.scrollViewport?.nativeElement;
    if (!el) {
      return;
    }

    el.scrollTop = el.scrollHeight;
    this.shouldAutoScroll = false;
  }

  onEnter(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.send();
  }

  prefill(text: string): void {
    if (this.pending) {
      return;
    }

    this.draft = text;
  }

  sendQuick(text: string): void {
    if (this.pending) {
      return;
    }

    this.draft = text;
    this.send();
  }

  clear(): void {
    this.draft = "";
    this.messages = [this.buildInitialMessage()];
    this.persistMessages();
  }

  send(): void {
    if (this.pending) {
      return;
    }

    const message = this.draft.trim();
    if (!message) {
      return;
    }

    const timestamp = Date.now();
    this.messages = [...this.messages, { role: "user", content: message, timestamp }];
    this.draft = "";
    this.pending = true;
    this.shouldAutoScroll = true;
    this.requestId += 1;
    const activeRequest = this.requestId;
    const userId = this.authService.currentUser()?.id;
    this.persistMessages();

    this.chatbotService.sendMessage(message, this.messages, userId).subscribe({
      next: (reply) => {
        if (activeRequest !== this.requestId) {
          return;
        }

        if (this.lastHandledRequestId === activeRequest) {
          return;
        }

        this.lastHandledRequestId = activeRequest;
        this.messages = [...this.messages, { role: "assistant", content: reply, timestamp: Date.now() }];
        this.pending = false;
        this.shouldAutoScroll = true;
        this.persistMessages();
        this.cdr.markForCheck();
      },
      error: () => {
        if (activeRequest !== this.requestId) {
          return;
        }

        if (this.lastHandledRequestId === activeRequest) {
          return;
        }

        this.lastHandledRequestId = activeRequest;
        this.messages = [
          ...this.messages,
          {
            role: "assistant",
            content:
              "I'm having trouble responding right now. If you want, try a short breathing reset or write one sentence about what feels most urgent.",
            timestamp: Date.now()
          }
        ];
        this.pending = false;
        this.shouldAutoScroll = true;
        this.persistMessages();
        this.cdr.markForCheck();
      }
    });
  }

  trackByTimestamp(_index: number, item: ChatMessage): number {
    return item.timestamp;
  }

  private readSavedMessages(): ChatMessage[] {
    const parsed = readStorageJson<ChatMessage[]>(this.storageKey);
    if (!Array.isArray(parsed) || !parsed.length) {
      return [this.buildInitialMessage()];
    }

    return parsed;
  }

  private persistMessages(): void {
    writeStorageJson(this.storageKey, this.messages.slice(-14));
  }

  private buildInitialMessage(): ChatMessage {
    const name = this.authService.currentUser()?.name?.split(" ")?.[0];
    return {
      role: "assistant",
      content: name
        ? `Hi ${name}. If something feels off today, tell me what feels heaviest and I'll keep the next step small.`
        : "Tell me what feels hardest right now, and I'll help you narrow it down into one calmer next step.",
      timestamp: Date.now()
    };
  }
}
