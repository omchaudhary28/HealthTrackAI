import { getExerciseCatalog } from "./exercise-catalog.service.js";

const STATE_MATCHERS = {
  Overthinker: ["rumination", "overthinking", "clarity", "grounding"],
  Stressed: ["stress", "quick", "recovery", "grounding", "movement"],
  Depressed: ["mood", "gratitude", "self-criticism", "sleep", "emotional recovery"],
  "FOMO-driven": ["fomo", "values", "direction", "reflection", "gratitude"],
  "Emotionally overwhelmed": ["overwhelm", "grounding", "breathing", "emotional recovery"],
  Balanced: ["gratitude", "sleep", "routine", "reflection"]
};

export function buildExerciseRecommendations({
  metrics = {},
  mentalState = "Balanced",
  exerciseHistory = {},
  journalPatterns = [],
  limit = 4
} = {}) {
  const catalog = getExerciseCatalog();
  const counts = exerciseHistory?.counts || {};
  const averageRatings = exerciseHistory?.averageRatings || {};
  const recentKeys = new Set(exerciseHistory?.recentKeys || []);
  const topRatedKeys = new Set(exerciseHistory?.topRatedKeys || []);
  const normalizedPatterns = new Set((journalPatterns || []).map(normalizeTag));

  const recommendations = catalog
    .map((exercise) => {
      const matches = [];
      let score = 0;

      if (exercise.bestForStates?.includes(mentalState)) {
        score += 4;
        matches.push(`aligned with your current ${mentalState.toLowerCase()} pattern`);
      }

      const stateTags = STATE_MATCHERS[mentalState] || [];
      const exerciseTags = (exercise.tags || []).map(normalizeTag);
      const tagOverlap = exerciseTags.filter((tag) => stateTags.includes(tag));
      if (tagOverlap.length) {
        score += tagOverlap.length * 1.5;
        matches.push(`targets ${tagOverlap.join(", ")}`);
      }

      const stress = Number(metrics.stress ?? metrics.stress_score ?? 50);
      const anxiety = Number(metrics.anxiety ?? 50);
      const moodAverage = Number(metrics.mood_avg ?? metrics.mood_average ?? 3);
      const sleepQuality = Number(metrics.sleep_quality ?? metrics.sleep_quality_avg ?? 3);

      if (stress >= 70 && includesAny(exerciseTags, ["stress", "quick", "movement", "grounding"])) {
        score += 2;
        matches.push("supports elevated stress");
      }

      if (anxiety >= 65 && includesAny(exerciseTags, ["rumination", "grounding", "breathing"])) {
        score += 2;
        matches.push("helps interrupt anxious loops");
      }

      if (moodAverage <= 2.7 && includesAny(exerciseTags, ["mood", "gratitude", "emotional recovery"])) {
        score += 2;
        matches.push("supports low-mood recovery");
      }

      if (sleepQuality <= 2.8 && includesAny(exerciseTags, ["sleep", "recovery"])) {
        score += 2;
        matches.push("fits recent recovery strain");
      }

      const patternOverlap = exerciseTags.filter((tag) => normalizedPatterns.has(tag));
      if (patternOverlap.length) {
        score += patternOverlap.length * 1.5;
        matches.push(`responds to ${patternOverlap.join(", ")}`);
      }

      const completionCount = Number(counts[exercise.key] || 0);
      const averageRating = Number(averageRatings[exercise.key] || 0);

      if (completionCount > 0 && averageRating >= 4) {
        score += 2;
        matches.push("worked well for you before");
      } else if (completionCount >= 3 && averageRating > 0 && averageRating < 3.2) {
        score -= 1.5;
        matches.push("de-prioritized because recent feedback was weaker");
      }

      if (recentKeys.has(exercise.key) && !topRatedKeys.has(exercise.key)) {
        score -= 0.75;
      }

      if (topRatedKeys.has(exercise.key)) {
        score += 1.5;
      }

      return {
        ...exercise,
        recommendationScore: round(score),
        whyRecommended: buildWhyRecommended(matches, mentalState),
        whatYouWillAchieve: exercise.expectedOutcome,
        aiReasoning: matches.slice(0, 3)
      };
    })
    .filter((exercise) => exercise.recommendationScore > 1)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  if (recommendations.length) {
    return recommendations;
  }

  return catalog
    .slice(0, limit)
    .map((exercise) => ({
      ...exercise,
      recommendationScore: 1,
      whyRecommended: `Suggested as a gentle default for a ${mentalState.toLowerCase()} support plan.`,
      whatYouWillAchieve: exercise.expectedOutcome,
      aiReasoning: ["fallback recommendation"]
    }));
}

function buildWhyRecommended(matches, mentalState) {
  if (!matches.length) {
    return `Suggested as a low-friction next step for a ${mentalState.toLowerCase()} check-in.`;
  }

  return `Recommended because it ${matches.slice(0, 2).join(" and ")}.`;
}

function includesAny(values, expected) {
  return expected.some((item) => values.includes(item));
}

function normalizeTag(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function round(value) {
  return Math.round(value * 10) / 10;
}
