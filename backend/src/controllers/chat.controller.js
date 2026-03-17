import { MentalState } from "../models/mental-state.model.js";
import { MoodLog } from "../models/mood-log.model.js";
import { TestResult } from "../models/test-result.model.js";
import { generateChatbotReply, generateContextualReply } from "../services/chatbot.service.js";
import { predictExerciseRecommendation } from "../services/ml.service.js";
import {
  buildEmotionReply,
  buildConversationState,
  classifyIntent,
  ensureNonRepeating,
  extractLastAssistantMessage,
  formatExercise
} from "../utils/chat-intent.js";

export async function sendContextualChat(req, res) {
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

  if (intent === "affirmative_response" || intent === "negative_response" || intent === "maybe_response") {
    const followUpReply = await handleFollowUp({
      intent,
      state,
      message,
      history,
      userId: req.body?.userId || req.user?.sub
    });

    if (followUpReply) {
      const reply = await ensureNonRepeating({
        reply: followUpReply,
        intent,
        lastAssistant,
        regenerate: async () =>
          generateChatbotReply(
            message,
            {},
            history,
            "Avoid repeating the last response. Provide a short, supportive follow-up."
          )
      });

      return res.json({
        reply,
        provider: "local-followup",
        context: null,
        disclaimer:
          "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
      });
    }
  }

  if (intent === "greeting") {
    const reply = await ensureNonRepeating({
      reply: "Hello! How are you feeling today?",
      intent,
      message,
      history,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          "Provide a friendly greeting and a short check-in question. Avoid repeating the last response."
        )
    });
    return res.json({
      reply,
      provider: "local-greeting",
      context: null,
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent === "negative_response") {
    const reply = await ensureNonRepeating({
      reply: "That's completely okay. If you change your mind, I'm here to help.",
      intent,
      message,
      history,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          "Respond briefly and kindly acknowledging the user's no. Avoid repeating the last response."
        )
    });
    return res.json({
      reply,
      provider: "local-negative",
      context: null,
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  const requestedUserId = req.body?.userId;
  const userId = requestedUserId || req.user.sub;

  if (!userId) {
    return res.status(400).json({ error: "User id is required." });
  }

  if (requestedUserId && String(requestedUserId) !== String(req.user.sub)) {
    return res.status(403).json({ error: "User mismatch." });
  }

  if (intent === "emotion" || intent === "exercise_request") {
    const stressContext = await buildStressContext(userId, message);
    const recommendation = await predictExerciseRecommendation(stressContext);
    const baseReply = buildEmotionReply(message, recommendation?.recommendedExercise, intent);
    const reply = await ensureNonRepeating({
      reply: baseReply,
      intent,
      message,
      history,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          `Respond with empathy and suggest a ${formatExercise(
            recommendation?.recommendedExercise || "breathing"
          )} exercise. Avoid repeating the last response.`
        )
    });

    return res.json({
      reply,
      provider: "ml-recommendation",
      context: null,
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent === "unknown") {
    const response = await generateChatbotReply(
      message,
      {},
      history,
      "The user input is minimal or unclear. Respond with a gentle, supportive clarifying question."
    );
    const reply = await ensureNonRepeating({
      reply: response.reply,
      intent,
      message,
      history,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          "Provide a different short prompt inviting the user to share how they're feeling."
        )
    });
    return res.json({
      reply,
      provider: response.provider,
      context: null,
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent !== "mental_state_question") {
    const response = await generateChatbotReply(message, {}, history);
    const reply = await ensureNonRepeating({
      reply: response.reply,
      intent,
      message,
      history,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          "Avoid repeating the last assistant response. Provide a fresh, concise reply."
        )
    });
    return res.json({
      reply,
      provider: response.provider,
      context: null,
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  const [latestState, latestBaseline] = await Promise.all([
    MentalState.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    TestResult.findOne({ userId, testKey: "baseline" }).sort({ createdAt: -1 }).lean()
  ]);

  const stressScore =
    pickScore(latestState?.factors?.stress) ?? pickScore(latestBaseline?.dimensionScores?.stress);
  const anxietyScore =
    pickScore(latestState?.factors?.anxiety) ?? pickScore(latestBaseline?.dimensionScores?.anxiety);

  const context = {
    mental_state: latestState?.mentalState || "Unknown",
    stress_score: stressScore ?? null,
    anxiety_score: anxietyScore ?? null
  };

  const response = await generateContextualReply(message, context, history);
  const reply = await ensureNonRepeating({
    reply: response.reply,
    intent,
    message,
    history,
    lastAssistant,
    regenerate: async () =>
      generateContextualReply(
        message,
        context,
        history,
        "Avoid repeating the last response. Provide a fresh explanation and one gentle next step."
      )
  });

  return res.json({
    reply,
    provider: response.provider,
    context,
    disclaimer:
      "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
  });
}

function pickScore(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

async function buildStressContext(userId, message) {
  const [latestMood, latestState, latestBaseline] = await Promise.all([
    MoodLog.findOne({ userId }).sort({ date: -1 }).lean(),
    MentalState.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    TestResult.findOne({ userId, testKey: "baseline" }).sort({ createdAt: -1 }).lean()
  ]);

  const stressScore =
    pickScore(latestMood?.stressLevel) ??
    pickScore(latestState?.factors?.stress) ??
    pickScore(latestBaseline?.dimensionScores?.stress) ??
    60;

  const sleepQuality = pickScore(latestMood?.sleepQuality) ?? 3;

  const recentMood =
    moodFromLog(latestMood, stressScore) || moodFromMessage(message) || "stressed";

  return { stressScore, recentMood, sleepQuality };
}

function moodFromLog(latestMood, stressScore) {
  if (!latestMood) {
    return null;
  }

  if (typeof stressScore === "number" && stressScore >= 70) {
    return "stressed";
  }

  const moodValue = Number(latestMood.mood);
  if (Number.isNaN(moodValue)) {
    return null;
  }

  if (moodValue <= 2) {
    return "low";
  }
  if (moodValue === 3) {
    return "neutral";
  }
  if (moodValue === 4) {
    return "calm";
  }
  return "great";
}

function moodFromMessage(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes("overwhelmed") || normalized.includes("panic")) {
    return "overwhelmed";
  }
  if (normalized.includes("anxious") || normalized.includes("anxiety")) {
    return "anxious";
  }
  if (normalized.includes("stressed") || normalized.includes("stress")) {
    return "stressed";
  }
  if (normalized.includes("sad") || normalized.includes("down") || normalized.includes("low")) {
    return "low";
  }
  return null;
}

async function handleFollowUp({ intent, state, message, history, userId }) {
  if (!state?.lastQuestion) {
    return null;
  }

  if (state.lastQuestion === "mental_state" && intent === "affirmative_response") {
    if (!userId) {
      return "I don't have your latest mental state yet. If you complete a check-in, I can explain it.";
    }

    const [latestState, latestBaseline] = await Promise.all([
      MentalState.findOne({ userId }).sort({ createdAt: -1 }).lean(),
      TestResult.findOne({ userId, testKey: "baseline" }).sort({ createdAt: -1 }).lean()
    ]);

    const stressScore =
      pickScore(latestState?.factors?.stress) ??
      pickScore(latestBaseline?.dimensionScores?.stress);
    const anxietyScore =
      pickScore(latestState?.factors?.anxiety) ??
      pickScore(latestBaseline?.dimensionScores?.anxiety);

    const context = {
      mental_state: latestState?.mentalState || "Unknown",
      stress_score: stressScore ?? null,
      anxiety_score: anxietyScore ?? null
    };

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
        return [
          "Great! Let's try a quick gratitude exercise.",
          "Step 1: Think of one small thing you're grateful for today.",
          "Step 2: Take a slow breath and focus on that thought.",
          "Step 3: Write it in your journal if you'd like."
        ].join("\n");
      case "breathing_exercise":
        return [
          "Great. Try this box-breathing reset:",
          "Inhale for 4 seconds.",
          "Hold for 4 seconds.",
          "Exhale for 4 seconds.",
          "Hold for 4 seconds.",
          "Repeat for 1 minute."
        ].join("\n");
      case "journaling_prompt":
        return "Here is a gentle prompt: What emotion showed up most today, and what seemed to trigger it?";
      case "grounding_exercise":
        return "Try this grounding: notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.";
      case "exercise_offer":
        return "Sure. Would you like a breathing reset or a short journaling prompt?";
      default:
        return null;
    }
  }

  if (intent === "negative_response") {
    switch (state.lastQuestion) {
      case "gratitude_exercise":
        return "That's okay. Would you prefer a breathing exercise instead?";
      case "breathing_exercise":
        return "No problem. Would a short journaling prompt feel better?";
      case "journaling_prompt":
        return "That's okay. Would you like a breathing reset instead?";
      case "grounding_exercise":
        return "No worries. If you'd like, we can try a breathing reset instead.";
      case "exercise_offer":
        return "That's okay. If you'd like something later, I'm here.";
      case "mental_state":
        return "That's okay. If you want to review it later, just ask.";
      default:
        return null;
    }
  }

  if (intent === "maybe_response") {
    switch (state.lastQuestion) {
      case "gratitude_exercise":
        return "We can keep it small. Want a one-sentence gratitude prompt?";
      case "breathing_exercise":
        return "We can try a 30-second breathing reset if that feels easier.";
      case "journaling_prompt":
        return "We can keep it light. Want a one-line journaling prompt?";
      case "exercise_offer":
        return "No rush. If you want, we can start with something small like one deep breath.";
      default:
        return null;
    }
  }

  return null;
}
