import { Injectable, OnDestroy, inject } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/api.config";
import { AuthService } from "./auth.service";
import { CommunityPost, ConversationMessage } from "./community.service";

interface PresenceItem {
  userId: string;
  isOnline: boolean;
}

interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

@Injectable({ providedIn: "root" })
export class RealtimeService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private socket?: Socket;
  private activeToken = "";

  private readonly postCreatedSubject = new Subject<CommunityPost>();
  private readonly postUpdatedSubject = new Subject<CommunityPost>();
  private readonly messageSubject = new Subject<{ conversationId: string; message: ConversationMessage }>();
  private readonly typingSubject = new Subject<TypingEvent>();
  private readonly presenceSubject = new Subject<PresenceItem>();
  private readonly presenceSnapshotSubject = new Subject<PresenceItem[]>();

  readonly communityPostCreated$: Observable<CommunityPost> = this.postCreatedSubject.asObservable();
  readonly communityPostUpdated$: Observable<CommunityPost> = this.postUpdatedSubject.asObservable();
  readonly conversationMessage$: Observable<{ conversationId: string; message: ConversationMessage }> =
    this.messageSubject.asObservable();
  readonly conversationTyping$: Observable<TypingEvent> = this.typingSubject.asObservable();
  readonly presenceUpdate$: Observable<PresenceItem> = this.presenceSubject.asObservable();
  readonly presenceSnapshot$: Observable<PresenceItem[]> = this.presenceSnapshotSubject.asObservable();

  ensureConnected(): void {
    const token = this.authService.token();
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket && this.activeToken === token) {
      return;
    }

    this.disconnect();
    this.activeToken = token;
    const socketBaseUrl = resolveSocketBaseUrl(this.apiBaseUrl);
    const transports = resolveRealtimeTransports(socketBaseUrl);

    this.socket = io(socketBaseUrl, {
      auth: { token },
      transports,
      upgrade: transports.includes("websocket"),
      reconnectionAttempts: 2,
      timeout: 10000
    });

    this.socket.on("community:post-created", (payload: CommunityPost) => this.postCreatedSubject.next(payload));
    this.socket.on("community:post-updated", (payload: CommunityPost) => this.postUpdatedSubject.next(payload));
    this.socket.on("conversation:message", (payload: { conversationId: string; message: ConversationMessage }) =>
      this.messageSubject.next(payload)
    );
    this.socket.on("conversation:typing", (payload: TypingEvent) => this.typingSubject.next(payload));
    this.socket.on("presence:update", (payload: PresenceItem) => this.presenceSubject.next(payload));
    this.socket.on("presence:snapshot", (payload: { items: PresenceItem[] }) =>
      this.presenceSnapshotSubject.next(payload.items || [])
    );
  }

  joinConversation(conversationId: string): void {
    this.ensureConnected();
    this.socket?.emit("conversation:join", { conversationId });
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.ensureConnected();
    this.socket?.emit("conversation:typing", { conversationId, isTyping });
  }

  subscribePresence(userIds: string[]): void {
    if (!userIds.length) {
      return;
    }

    this.ensureConnected();
    this.socket?.emit("presence:subscribe", { userIds });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.activeToken = "";
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}

function resolveSocketBaseUrl(apiBaseUrl: string): string {
  if (apiBaseUrl.startsWith("/")) {
    return window.location.origin;
  }

  const parsed = new URL(apiBaseUrl);
  parsed.pathname = parsed.pathname.replace(/\/api\/v1\/?$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function resolveRealtimeTransports(socketBaseUrl: string): Array<"websocket" | "polling"> {
  if (typeof window === "undefined") {
    return ["polling"];
  }

  const appOrigin = window.location.origin.replace(/\/$/, "");
  if (socketBaseUrl === appOrigin) {
    return ["websocket", "polling"];
  }

  return ["polling"];
}
