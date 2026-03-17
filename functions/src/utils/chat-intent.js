function normalizeReply(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function extractLastAssistantMessage(history) {
  if (!Array.isArray(history)) {
    return "";
  }

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];
    if (item?.role === "assistant" && typeof item.content === "string") {
      return item.content.trim();
    }
  }

  return "";
}

function fallbackVariants(intent) {
  const variants = {
    greeting: [
      "Hi there! How are you feeling today?",
      "Hey! Want to share how you're doing?"
    ],
    emotion: [
      "That sounds tough. Would you like a short breathing reset or a journaling prompt?",
      "I'm here with you. Want to try a quick grounding exercise?"
    ],
    exercise_request: [
      "I can suggest a breathing reset or a short journaling prompt. Which sounds better?",
      "Would you like a quick breathing exercise or a calming reflection prompt?"
    ],
    negative_response: [
      "No worries at all. I'm here whenever you need.",
      "That's okay. If you'd like to talk later, I'm here."
    ],
    unknown: [
      "Is something on your mind?",
      "If you'd like, you can tell me how you're feeling today."
    ],
    general: [
      "I'm here to help. Want to share a bit more about what's on your mind?"
    ]
  };

  return variants[intent] || variants.general;
}

export async function ensureNonRepeating({ reply, intent, lastAssistant, regenerate }) {
  if (!lastAssistant) {
    return reply;
  }

  if (normalizeReply(reply) !== normalizeReply(lastAssistant)) {
    return reply;
  }

  if (regenerate) {
    const regenerated = await regenerate();
    const regeneratedReply = regenerated?.reply ?? regenerated;
    if (normalizeReply(regeneratedReply) !== normalizeReply(lastAssistant)) {
      return regeneratedReply;
    }
  }

  const options = fallbackVariants(intent);
  const alternative = options.find(
    (option) => normalizeReply(option) !== normalizeReply(lastAssistant)
  );
  return alternative || reply;
}

export function classifyIntent(message) {
  if (isMentalStateQuery(message)) {
    return "mental_state_question";
  }

  if (isExerciseRequest(message)) {
    return "exercise_request";
  }

  if (isEmotionSignal(message)) {
    return "emotion";
  }

  if (isGreetingOnly(message)) {
    return "greeting";
  }

  if (isAffirmativeResponse(message)) {
    return "affirmative_response";
  }

  if (isNegativeResponse(message)) {
    return "negative_response";
  }

  if (isMaybeResponse(message)) {
    return "maybe_response";
  }

  if (isUnknownInput(message)) {
    return "unknown";
  }

  return "general";
}

function isGreetingOnly(message) {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  const tokens = normalized.split(" ");
  if (tokens.length > 2) {
    return false;
  }

  const greetings = new Set(["hi", "hello", "hey", "hiya", "yo"]);
  const fillers = new Set(["there"]);

  if (tokens.length === 1) {
    return greetings.has(tokens[0]);
  }

  const includesGreeting = tokens.some((token) => greetings.has(token));
  return (
    includesGreeting &&
    tokens.every((token) => greetings.has(token) || fillers.has(token))
  );
}

function isMentalStateQuery(message) {
  const normalized = message.toLowerCase();
  const phrases = [
    "mental state",
    "my mental state",
    "latest mental state",
    "current mental state",
    "state of mind",
    "explain state",
    "explain my state"
  ];

  if (phrases.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  if (normalized.includes("my state")) {
    const hints = ["mental", "mind", "explain", "latest", "current"];
    if (hints.some((hint) => normalized.includes(hint)) || message.includes("?")) {
      return true;
    }
  }

  return false;
}

function isEmotionSignal(message) {
  const normalized = message.toLowerCase();
  const keywords = [
    "stress",
    "stressed",
    "overwhelmed",
    "panic",
    "anxious",
    "anxiety",
    "sad",
    "down",
    "tired",
    "burned out",
    "lonely",
    "angry"
  ];
  return keywords.some((keyword) => normalized.includes(keyword));
}

function isExerciseRequest(message) {
  const normalized = message.toLowerCase();
  const keywords = [
    "exercise",
    "breathing",
    "box breathing",
    "grounding",
    "meditation",
    "journal",
    "journaling",
    "prompt"
  ];
  if (keywords.some((keyword) => normalized.includes(keyword))) {
    return true;
  }

  return normalized.includes("recommend") && normalized.includes("exercise");
}

function isNegativeResponse(message) {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  const negatives = [
    "no",
    "nope",
    "nah",
    "not really",
    "not now",
    "no thanks",
    "no thank you"
  ];

  if (negatives.includes(normalized)) {
    return true;
  }

  if (normalized.startsWith("no ") || normalized === "no") {
    return true;
  }

  return false;
}

function isAffirmativeResponse(message) {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  const positives = [
    "yes",
    "yeah",
    "yep",
    "sure",
    "ok",
    "okay",
    "please",
    "sounds good",
    "go ahead",
    "let's do it"
  ];

  if (positives.includes(normalized)) {
    return true;
  }

  if (normalized.startsWith("yes ") || normalized.startsWith("ok ")) {
    return true;
  }

  return false;
}

function isMaybeResponse(message) {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  const maybes = ["maybe", "not sure", "perhaps", "kinda", "kind of", "idk", "i don't know"];
  return maybes.some((value) => normalized === value || normalized.startsWith(`${value} `));
}

function isUnknownInput(message) {
  const trimmed = message.trim();
  if (!trimmed) {
    return true;
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return true;
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return true;
  }

  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length > 2) {
    return false;
  }

  const fillers = new Set(["hm", "hmm", "umm", "um", "uh", "ok", "okay", "k", "huh"]);
  return tokens.every((token) => fillers.has(token));
}

export function buildConversationState(history) {
  const lastAssistant = extractLastAssistantMessage(history);
  if (!lastAssistant) {
    return { lastQuestion: null, lastQuestionText: "" };
  }

  const normalized = lastAssistant.toLowerCase();
  const looksLikeQuestion =
    lastAssistant.includes("?") ||
    normalized.startsWith("would you like") ||
    normalized.startsWith("do you want") ||
    normalized.startsWith("want to") ||
    normalized.startsWith("should we") ||
    normalized.startsWith("can i");

  if (!looksLikeQuestion) {
    return { lastQuestion: null, lastQuestionText: lastAssistant };
  }

  const inferred = inferQuestionType(normalized);
  return { lastQuestion: inferred, lastQuestionText: lastAssistant };
}

function inferQuestionType(normalized) {
  if (normalized.includes("gratitude")) {
    return "gratitude_exercise";
  }
  if (normalized.includes("breathing") || normalized.includes("box breathing")) {
    return "breathing_exercise";
  }
  if (normalized.includes("journaling") || normalized.includes("journal") || normalized.includes("prompt")) {
    return "journaling_prompt";
  }
  if (normalized.includes("mental state") || normalized.includes("state of mind")) {
    return "mental_state";
  }
  if (normalized.includes("grounding")) {
    return "grounding_exercise";
  }
  if (normalized.includes("exercise") || normalized.includes("try one") || normalized.includes("try it")) {
    return "exercise_offer";
  }

  return null;
}

export function buildEmotionReply(message, recommendedExercise, intent) {
  const cleaned = formatExercise(recommendedExercise || "breathing");
  const phrasing = cleaned.includes("exercise") ? cleaned : `${cleaned} exercises`;
  const emotion = extractEmotionLabel(message);

  if (intent === "exercise_request") {
    return `I can suggest ${phrasing} based on your recent patterns. Would you like to try one?`;
  }

  if (emotion) {
    return `I'm sorry you're feeling ${emotion}. I noticed ${phrasing} often help users with similar stress levels. Would you like to try one?`;
  }

  return `I noticed ${phrasing} often help users with similar stress levels. Would you like to try one?`;
}

export function formatExercise(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase();
}

function extractEmotionLabel(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes("overwhelmed")) {
    return "overwhelmed";
  }
  if (normalized.includes("stressed") || normalized.includes("stress")) {
    return "stressed";
  }
  if (normalized.includes("anxious") || normalized.includes("anxiety")) {
    return "anxious";
  }
  if (normalized.includes("sad") || normalized.includes("down")) {
    return "down";
  }
  if (normalized.includes("tired") || normalized.includes("burned out")) {
    return "worn out";
  }
  if (normalized.includes("lonely")) {
    return "lonely";
  }
  if (normalized.includes("angry")) {
    return "angry";
  }
  return "";
}
