import OpenAI from "openai";
import { env } from "../config/env.js";

const SYSTEM_PROMPT =
  "You are a friendly mental wellness assistant that helps users reflect on their emotions and suggests healthy coping strategies. " +
  "Keep responses warm, concise, and practical. Do not claim to diagnose or provide medical treatment.";

const MENTAL_STATE_PROMPT =
  "The user is asking about their mental state. Use the provided context to explain it clearly and kindly. " +
  "Keep it brief and offer one gentle next step.";

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
    return "It sounds heavy. Would you like a 5 minute breathing exercise or a short grounding prompt?";
  }

  if (input.includes("sleep")) {
    return "A wind-down checklist and a brief journal brain-dump could help tonight. I can suggest both.";
  }

  if (input.includes("journal")) {
    return "Try this prompt: What emotion showed up most strongly today, and what triggered it?";
  }

  return "I can help explain results, suggest a calming exercise, or help you choose the next reflection step.";
}

function contextualFallback(message, context) {
  if (context?.mental_state && context.mental_state !== "Unknown") {
    return `Based on your latest check-in, your current state is ${context.mental_state}. Would you like a breathing reset, a short journaling prompt, or a grounding exercise?`;
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
