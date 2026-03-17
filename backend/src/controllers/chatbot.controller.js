import { generateChatbotReply, generateContextualReply } from "../services/chatbot.service.js";
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

  const context = req.body?.context || {};
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
      history,
      context
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
        disclaimer:
          "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
      });
    }
  }

  if (intent === "greeting") {
    const reply = await ensureNonRepeating({
      reply: "Hello! How are you feeling today?",
      intent,
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
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent === "negative_response") {
    const reply = await ensureNonRepeating({
      reply: "That's completely okay. I'm here whenever you need.",
      intent,
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
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent === "emotion" || intent === "exercise_request") {
    const baseReply = buildEmotionReply(message, "breathing", intent);
    const reply = await ensureNonRepeating({
      reply: baseReply,
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          `Respond with empathy and suggest a ${formatExercise(
            "breathing"
          )} exercise. Avoid repeating the last response.`
        )
    });

    return res.json({
      reply,
      provider: "local-support",
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
  }

  if (intent === "mental_state_question") {
    if (context?.mental_state || context?.stress_score || context?.anxiety_score) {
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
            "Avoid repeating the last response. Provide a fresh explanation and one gentle next step."
          )
      });

      return res.json({
        reply,
        provider: response.provider,
        disclaimer:
          "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
      });
    }

    const reply = await ensureNonRepeating({
      reply: "I don't have your latest mental state yet. If you complete a check-in, I can explain it.",
      intent,
      lastAssistant,
      regenerate: async () =>
        generateChatbotReply(
          message,
          {},
          history,
          "Let the user know you don't have their latest mental state and invite them to complete a check-in."
        )
    });

    return res.json({
      reply,
      provider: "local-missing-context",
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
      disclaimer:
        "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
    });
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

  res.json({
    reply,
    provider: response.provider,
    disclaimer:
      "MindTrack AI provides supportive wellness guidance only and is not a clinical service."
  });
}

async function handleFollowUp({ intent, state, history, context }) {
  if (!state?.lastQuestion) {
    return null;
  }

  if (state.lastQuestion === "mental_state" && intent === "affirmative_response") {
    if (context?.mental_state || context?.stress_score || context?.anxiety_score) {
      const response = await generateContextualReply(
        "Please explain my latest mental state.",
        context,
        history,
        "The user said yes to your offer to explain their mental state. Provide the explanation."
      );
      return response.reply;
    }

    return "I don't have your latest mental state yet. If you complete a check-in, I can explain it.";
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
