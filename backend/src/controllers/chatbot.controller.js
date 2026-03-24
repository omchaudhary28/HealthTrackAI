import { generateChatbotReply, generateContextualReply } from "../services/chatbot.service.js";
import { predictExerciseRecommendation } from "../services/ml.service.js";
import { buildWellnessSnapshot } from "../services/wellness-profile.service.js";
import {
  buildEmotionReply,
  buildConversationState,
  classifyIntent,
  ensureNonRepeating,
  extractLastAssistantMessage,
  formatExercise
} from "../utils/chat-intent.js";

export async function sendChatbotMessage(req, res) {
  const message = (req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const history = Array.isArray(req.body?.messages)
    ? req.body.messages
    : Array.isArray(req.body?.history)
    ? req.body.history
    : [];
  const lastAssistant = extractLastAssistantMessage(history);
  const state = buildConversationState(history);
  const intent = classifyIntent(message);
  const userId = req.body?.userId || null;

  const snapshot = userId ? await safelyBuildSnapshot(userId) : null;
  const context = buildChatContext(snapshot);

  if (intent === "affirmative_response" || intent === "negative_response" || intent === "maybe_response") {
    const followUpReply = await handleFollowUp({ intent, state, history, context });

    if (followUpReply) {
      const reply = await ensureNonRepeating({
        reply: followUpReply,
        intent,
        lastAssistant,
        regenerate: async () =>
          generateChatbotReply(
            message,
            context,
            history,
            "Avoid repeating the last response. Provide a short, supportive follow-up."
          )
      });

      return res.json(responsePayload(reply, "local-followup", context));
    }
  }

  if (intent === "greeting") {
    const greeting = snapshot?.user?.name
      ? `Hey ${snapshot.user.name.split(" ")[0]}. How are you feeling today?`
      : "Hello. How are you feeling today?";

    const reply = await ensureNonRepeating({
      reply: greeting,
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          context,
          history,
          "Provide a warm greeting, acknowledge the user gently, and ask one short check-in question."
        )
    });

    return res.json(responsePayload(reply, "local-greeting", context));
  }

  if (intent === "negative_response") {
    const reply = await ensureNonRepeating({
      reply: "That is completely okay. We can keep it simple, or pause here if that feels better.",
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          context,
          history,
          "Respond briefly and kindly acknowledging the user's no. Avoid repeating the last response."
        )
    });

    return res.json(responsePayload(reply, "local-negative", context));
  }

  if (intent === "emotion" || intent === "exercise_request") {
    const personalizedExercise =
      snapshot?.recommendationCards?.[0] || (await buildMlRecommendation(snapshot, message));
    const baseReply = personalizedExercise
      ? `${buildEmotionReply(message, personalizedExercise.title || personalizedExercise.key, intent)} ${
          personalizedExercise.whyRecommended
            ? `I’d start with ${personalizedExercise.title} because ${lowerCaseFirst(personalizedExercise.whyRecommended)}`
            : ""
        }`.trim()
      : buildEmotionReply(message, "breathing reset", intent);

    const reply = await ensureNonRepeating({
      reply: baseReply,
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          context,
          history,
          `Respond with empathy and suggest a ${formatExercise(
            personalizedExercise?.title || "breathing reset"
          )}. Keep it supportive and non-medical.`
        )
    });

    return res.json(responsePayload(reply, personalizedExercise ? "personalized-support" : "ml-recommendation", context));
  }

  if (intent === "mental_state_question") {
    if (!context?.mental_state || context.mental_state === "Unknown") {
      const reply = await ensureNonRepeating({
        reply: "I do not have enough recent data to explain your latest pattern yet. A quick check-in or baseline assessment would give me more to work with.",
        intent,
        lastAssistant,
        regenerate: async () =>
          generateChatbotReply(
            message,
            {},
            history,
            "Let the user know you do not have their latest mental-state snapshot and invite a check-in."
          )
      });

      return res.json(responsePayload(reply, "local-missing-context", context));
    }

    const response = await generateContextualReply(message, context, history);
    const reply = await ensureNonRepeating({
      reply: response.reply,
      intent,
      lastAssistant,
      regenerate: async () =>
        generateContextualReply(
          message,
          context,
          history,
          "Avoid repeating the last response. Explain the state in a fresh way and offer one gentle next step."
        )
    });

    return res.json(responsePayload(reply, response.provider, context));
  }

  if (intent === "unknown") {
    const response = await generateChatbotReply(
      message,
      context,
      history,
      "The user input is minimal or unclear. Respond with a gentle, supportive clarifying question."
    );
    const reply = await ensureNonRepeating({
      reply: response.reply,
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          context,
          history,
          "Provide a different short prompt inviting the user to share how they feel or what feels hardest right now."
        )
    });

    return res.json(responsePayload(reply, response.provider, context));
  }

  const response = await generateChatbotReply(message, context, history);
  const reply = await ensureNonRepeating({
    reply: response.reply,
    intent,
    lastAssistant,
    regenerate: async () =>
      generateChatbotReply(
        message,
        context,
        history,
        "Avoid repeating the last assistant response. Provide a fresh, concise reply."
      )
  });

  return res.json(responsePayload(reply, response.provider, context));
}

async function handleFollowUp({ intent, state, history, context }) {
  if (!state?.lastQuestion) {
    return null;
  }

  if (state.lastQuestion === "mental_state" && intent === "affirmative_response") {
    if (!context?.mental_state || context.mental_state === "Unknown") {
      return "I do not have your latest pattern yet. A quick check-in would help me personalize that.";
    }

    const response = await generateContextualReply(
      "Please explain my latest mental state.",
      context,
      history,
      "The user said yes to your offer to explain their mental state. Provide the explanation."
    );
    return response.reply;
  }

  if (intent === "affirmative_response") {
    switch (state.lastQuestion) {
      case "gratitude_exercise":
        return "Good. Start with one small thing that felt supportive today, even if it was brief.";
      case "breathing_exercise":
        return "Try this: inhale for 4, hold for 4, exhale for 4, pause for 4. Repeat for one minute.";
      case "journaling_prompt":
        return "Try this prompt: what felt most difficult today, and what would help you feel 5 percent steadier?";
      case "grounding_exercise":
        return "Let’s ground first: name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste.";
      case "exercise_offer":
        return "Sure. Would you prefer breathing, grounding, or a short journal prompt?";
      default:
        return null;
    }
  }

  if (intent === "negative_response") {
    switch (state.lastQuestion) {
      case "breathing_exercise":
        return "No problem. A short journal prompt may feel lighter if you want that instead.";
      case "journaling_prompt":
        return "That is okay. We can keep it verbal and just identify what feels most urgent.";
      case "grounding_exercise":
        return "Understood. We can slow it down another way if you want.";
      case "exercise_offer":
      case "mental_state":
        return "That is okay. If you want to return to it later, I’ll pick it up from there.";
      default:
        return null;
    }
  }

  if (intent === "maybe_response") {
    return "We can keep it very small. One calmer breath or one sentence is enough to start.";
  }

  return null;
}

async function safelyBuildSnapshot(userId) {
  try {
    return await buildWellnessSnapshot(userId);
  } catch {
    return null;
  }
}

function buildChatContext(snapshot) {
  if (!snapshot) {
    return {};
  }

  return {
    mental_state: snapshot.classification?.mental_state || snapshot.mentalStates?.[0]?.mentalState || "Unknown",
    stress_score: snapshot.metrics?.stress_score ?? null,
    anxiety_score: snapshot.metrics?.anxiety ?? null,
    suggested_action: snapshot.suggestedAction || null,
    recommendation_titles: (snapshot.recommendationCards || []).map((item) => item.title).slice(0, 3),
    journal_patterns: snapshot.journalSignals?.patterns || []
  };
}

async function buildMlRecommendation(snapshot, message) {
  try {
    const response = await predictExerciseRecommendation({
      stressScore: snapshot?.metrics?.stress_score ?? 60,
      recentMood: snapshot ? moodLabel(snapshot.metrics?.mood_avg) : moodFromMessage(message) || "stressed",
      sleepQuality: snapshot?.metrics?.sleep_quality ?? 3
    });

    return response?.recommendedExercise
      ? { key: response.recommendedExercise, title: formatExercise(response.recommendedExercise) }
      : null;
  } catch {
    return null;
  }
}

function responsePayload(reply, provider, context) {
  return {
    reply,
    provider,
    context,
    disclaimer:
      "MindTrack AI provides supportive wellness guidance only and is not a clinical or medical service."
  };
}

function moodFromMessage(message) {
  const normalized = String(message || "").toLowerCase();
  if (normalized.includes("overwhelmed") || normalized.includes("panic")) {
    return "overwhelmed";
  }
  if (normalized.includes("anxious") || normalized.includes("anxiety")) {
    return "anxious";
  }
  if (normalized.includes("sad") || normalized.includes("down")) {
    return "low";
  }
  return "stressed";
}

function moodLabel(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "neutral";
  }

  if (numeric <= 2.4) {
    return "low";
  }
  if (numeric <= 3.2) {
    return "neutral";
  }
  if (numeric <= 4) {
    return "calm";
  }

  return "good";
}

function lowerCaseFirst(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}
