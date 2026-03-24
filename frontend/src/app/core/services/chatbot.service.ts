import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, of } from "rxjs";
import { API_BASE_URL } from "../api/api.config";

interface ChatbotResponse {
  reply: string;
}

interface ChatMessagePayload {
  role: "assistant" | "user";
  content: string;
}

@Injectable({ providedIn: "root" })
export class ChatbotService {
  private readonly apiBaseUrl = inject(API_BASE_URL);

  constructor(private readonly http: HttpClient) {}

  sendMessage(message: string, messages: ChatMessagePayload[], userId?: string | null): Observable<string> {
    const chatUrl = buildChatUrl(this.apiBaseUrl);
    const payload = {
      message,
      messages: Array.isArray(messages)
        ? messages.map((item) => ({ role: item.role, content: item.content }))
        : undefined,
      userId: userId || undefined
    };
    return this.http.post<ChatbotResponse>(chatUrl, payload).pipe(
      map((response) => response.reply),
      catchError(() =>
        of("I can suggest a short breathing reset, journaling prompt, or a calmer next step if you want.")
      )
    );
  }
}

function buildChatUrl(apiBaseUrl: string): string {
  if (!apiBaseUrl) {
    return "/api/v1/chatbot/message";
  }

  const normalized = apiBaseUrl.replace(/\/$/, "");

  if (normalized.endsWith("/api/v1")) {
    return `${normalized}/chatbot/message`;
  }

  return `${normalized}/chatbot/message`;
}
