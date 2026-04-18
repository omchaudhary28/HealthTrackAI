import OpenAI from "openai";
import { env } from "../config/env.js";

const SYSTEM_PROMPT =
  "You are MindTrack AI, a supportive mental-wellness assistant. " +
  "Sound natural, calm, and human. Start by validating the user's experience in plain language, then offer one or two practical next steps. " +
  "Use the provided context for light personalization, but do not overstate certainty. Avoid repetitive phrasing across turns. " +
  "Never present yourself as a medical authority, never diagnose, and never claim treatment or crisis expertise.";

const MENTAL_STATE_PROMPT =
  "The user is asking about their mental state. Explain it clearly, gently, and non-clinically. " +
  "Frame it as a pattern snapshot rather than a diagnosis, and end with one practical, low-pressure suggestion.";

const MAX_HISTORY = 12;
const DEFAULT_TEMPERATURE = 0.7;

let openaiClient = null;

function getOpenAiClient() {
  if (!env.openAiApiKey) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return openaiClient;
}

function localWellnessReply(message) {
  const input = message.toLowerCase();

  if (input.includes("overwhelmed") || input.includes("panic")) {
    return "That sounds like a lot to carry right now. We can keep this small. Would a grounding reset or a short breathing exercise feel more manageable?";
  }

  if (input.includes("sleep")) {
    return "If your mind is still running at night, a short brain-dump and a simple wind-down routine can help reduce the carryover into sleep.";
  }

  if (input.includes("journal")) {
    return "Try this prompt: What felt heaviest today, and what would feel slightly kinder or lighter tomorrow?";
  }

  if (input.includes("lost") || input.includes("confused")) {
    return "Feeling lost can make everything seem louder at once. Let's narrow it down to one thing that feels most urgent, and one thing that can wait.";
  }

  return "I'm here to help you slow things down a little. I can suggest a calming exercise, a journaling prompt, or help you make sense of your latest pattern.";
}

function contextualFallback(message, context) {
  if (context?.mental_state && context.mental_state !== "Unknown") {
    return `Based on your recent pattern, you look closer to ${context.mental_state}. That is a support snapshot, not a diagnosis. Want a next step that matches it?`;
  }

  return localWellnessReply(message);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .map((item) => ({
      role: item.role,
      content: typeof item.content === "string" ? item.content.trim() : ""
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY);
}

function formatContext(context) {
  if (!context || typeof context !== "object") {
    return null;
  }

  const entries = [];

  if (context.mental_state && context.mental_state !== "Unknown") {
    entries.push(`mental state: ${context.mental_state}`);
  }

  if (context.stress_score !== null && context.stress_score !== undefined) {
    entries.push(`stress score: ${context.stress_score}`);
  }

  if (context.anxiety_score !== null && context.anxiety_score !== undefined) {
    entries.push(`anxiety score: ${context.anxiety_score}`);
  }

  if (context.suggested_action?.title) {
    entries.push(`suggested action: ${context.suggested_action.title}`);
  }

  if (Array.isArray(context.recommendation_titles) && context.recommendation_titles.length) {
    entries.push(`top recommendations: ${context.recommendation_titles.join(", ")}`);
  }

  if (Array.isArray(context.journal_patterns) && context.journal_patterns.length) {
    entries.push(`journal patterns: ${context.journal_patterns.join(", ")}`);
  }

  if (entries.length === 0) {
    return null;
  }

  return `User context for gentle personalization only: ${entries.join(", ")}.`;
}

function shouldAppendUserMessage(message, history) {
  const trimmed = (message || "").trim();
  if (!trimmed) {
    return false;
  }

  const last = history[history.length - 1];
  if (last && last.role === "user" && last.content === trimmed) {
    return false;
  }

  return true;
}

function buildMessages(message, context, history, systemPrompt, extraSystemPrompt) {
  const messages = [{ role: "system", content: systemPrompt }];

  if (extraSystemPrompt) {
    messages.push({ role: "system", content: extraSystemPrompt });
  }

  const contextSummary = formatContext(context);
  if (contextSummary) {
    messages.push({ role: "system", content: contextSummary });
  }

  const sanitizedHistory = normalizeHistory(history);
  messages.push(...sanitizedHistory);

  if (shouldAppendUserMessage(message, sanitizedHistory)) {
    messages.push({ role: "user", content: message.trim() });
  }

  return messages;
}

async function requestCompletion(message, context, history, fallbackReply, extraSystemPrompt) {
  if (!env.openAiApiKey) {
    return {
      reply: fallbackReply,
      provider: "local-fallback"
    };
  }

  const client = getOpenAiClient();
  if (!client) {
    return {
      reply: fallbackReply,
      provider: "local-fallback"
    };
  }

  const messages = buildMessages(message, context, history, SYSTEM_PROMPT, extraSystemPrompt);
  const model = env.openAiModel || "gpt-4o-mini";

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: DEFAULT_TEMPERATURE
    });

    const content = completion?.choices?.[0]?.message?.content?.trim();

    return {
      reply: content || fallbackReply,
      provider: "openai"
    };
  } catch {
    return {
      reply: fallbackReply,
      provider: "local-fallback"
    };
  }
}

export async function generateChatbotReply(message, context = {}, history = [], extraSystemPrompt = null) {
  const fallback = localWellnessReply(message);
  return requestCompletion(message, context, history, fallback, extraSystemPrompt);
}

export async function generateContextualReply(message, context = {}, history = [], extraSystemPrompt = null) {
  const fallback = contextualFallback(message, context);
  const combinedPrompt = extraSystemPrompt
    ? `${MENTAL_STATE_PROMPT} ${extraSystemPrompt}`
    : MENTAL_STATE_PROMPT;
  return requestCompletion(message, context, history, fallback, combinedPrompt);
}
