import { CommonModule } from "@angular/common";
import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatbotService } from "../../core/services/chatbot.service";
import { AuthService } from "../../core/services/auth.service";
import { readStorageJson, writeStorageJson } from "../../core/utils/storage";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

@Component({
  selector: "app-floating-chatbot",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-[calc(var(--mt-safe-bottom)+0.75rem)] right-3 z-40 sm:bottom-5 sm:right-5">
      <button
        type="button"
        (click)="open = !open"
        [attr.aria-expanded]="open"
        aria-controls="mindtrack-chatbot-panel"
        class="group flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-xl active:scale-[0.97] active:translate-y-0">
        <svg class="h-6 w-6 transition group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
          <path d="M8 9h8"></path>
          <path d="M8 13h6"></path>
        </svg>
      </button>

      <div
        id="mindtrack-chatbot-panel"
        class="fixed inset-x-3 bottom-[calc(var(--mt-safe-bottom)+5rem)] max-h-[min(70vh,38rem)] origin-bottom overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur transition-all duration-200 sm:absolute sm:inset-x-auto sm:bottom-16 sm:right-0 sm:w-[22rem] sm:max-h-none sm:max-w-[calc(100vw-2.5rem)] sm:origin-bottom-right sm:rounded-3xl"
        [class.pointer-events-none]="!open"
        [class.opacity-0]="!open"
        [class.translate-y-2]="!open"
        [class.scale-95]="!open">
        <div class="border-b border-slate-100 px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">MindTrack Assistant</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">Supportive wellness guidance only. Not medical advice or diagnosis.</div>
            </div>
            <button
              type="button"
              (click)="open = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Close assistant">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="chip-scroll mt-3">
            <button
              *ngFor="let chip of quickChips"
              type="button"
              (click)="sendQuick(chip)"
              [disabled]="pending"
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              {{ chip }}
            </button>
          </div>
        </div>

        <div #scrollViewport class="max-h-[min(36vh,18rem)] space-y-3 overflow-y-auto px-4 py-4 scroll-smooth sm:max-h-80">
          <div *ngFor="let item of messages; trackBy: trackByTimestamp" class="flex" [class.justify-end]="item.role === 'user'">
            <div
              class="message-in max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-200"
              [class.bg-blue-500]="item.role === 'user'"
              [class.text-white]="item.role === 'user'"
              [class.bg-gray-100]="item.role === 'assistant'"
              [class.text-gray-800]="item.role === 'assistant'">
              {{ item.content }}
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

        <div class="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
          <textarea
            [(ngModel)]="draft"
            (keydown.enter)="onEnter($event)"
            rows="2"
            placeholder="I feel overwhelmed..."
            class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"></textarea>
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
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]">
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
        ? `Hi ${name}. If something feels off today, tell me what feels heaviest and I’ll keep the next step small.`
        : "Tell me what feels hardest right now, and I’ll help you narrow it down into one calmer next step.",
      timestamp: Date.now()
    };
  }
}
