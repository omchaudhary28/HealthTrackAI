import { HttpError } from "../utils/http-error.js";

export const COMMUNITY_REACTIONS = [
  { key: "support", label: "Support", emoji: "\u2764\ufe0f" },
  { key: "hug", label: "Hug", emoji: "\ud83e\udd17" },
  { key: "strength", label: "Strength", emoji: "\ud83d\udcaa" }
];

const HARD_BLOCK_PATTERNS = [
  /\bkill yourself\b/i,
  /\bkys\b/i,
  /\bgo die\b/i,
  /\bself-?harm tutorial\b/i,
  /\bhow to hurt yourself\b/i,
  /\bworthless trash\b/i
];

const FLAG_PATTERNS = [
  /\bidiot\b/i,
  /\bstupid\b/i,
  /\bmoron\b/i,
  /\bpathetic\b/i,
  /\bworthless\b/i,
  /\bhate you\b/i,
  /\bshut up\b/i
];

const MENTAL_STATE_ALIASES = {
  Overthinker: "Overthinker",
  Stressed: "Stressed",
  Depressed: "Depressed",
  FOMO: "FOMO",
  "FOMO-driven": "FOMO",
  Balanced: "Balanced"
};

const ALIAS_ADJECTIVES = ["Quiet", "Gentle", "Steady", "Soft", "Calm", "Kind", "Brave", "Open"];
const ALIAS_NOUNS = ["Lantern", "Harbor", "Echo", "Thread", "River", "Meadow", "Signal", "Sunrise"];

export function normalizeCommunityText(value, options = {}) {
  const {
    fieldName = "Text",
    allowEmpty = false,
    maxLength = 600
  } = options;

  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    if (allowEmpty) {
      return { text: "", flags: [] };
    }

    throw new HttpError(400, `${fieldName} is required`);
  }

  if (text.length > maxLength) {
    throw new HttpError(422, `${fieldName} must be ${maxLength} characters or fewer`);
  }

  const moderation = moderateCommunityText(text);
  if (moderation.blocked) {
    throw new HttpError(422, `${fieldName} contains language that is not allowed in the community`);
  }

  return { text, flags: moderation.flags };
}

export function moderateCommunityText(text) {
  const flags = FLAG_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  const blocked = HARD_BLOCK_PATTERNS.some((pattern) => pattern.test(text));

  return { blocked, flags };
}

export function normalizeTags(tags = []) {
  return [...new Set(
    (Array.isArray(tags) ? tags : [])
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6)
  )];
}

export function normalizeMentalStateTag(value, fallback = "Balanced") {
  const normalized = String(value || "").trim();
  return MENTAL_STATE_ALIASES[normalized] || MENTAL_STATE_ALIASES[fallback] || "Balanced";
}

export function normalizeReactionKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!COMMUNITY_REACTIONS.some((item) => item.key === key)) {
    throw new HttpError(422, "Unsupported reaction");
  }

  return key;
}

export function buildAnonymousAlias(seed = "") {
  const source = String(seed || "mindtrack");
  const code = [...source].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
  const adjective = ALIAS_ADJECTIVES[code % ALIAS_ADJECTIVES.length];
  const noun = ALIAS_NOUNS[(code * 3) % ALIAS_NOUNS.length];

  return `${adjective} ${noun}`;
}
