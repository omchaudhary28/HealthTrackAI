import { seedExercises } from "../data/exercises.js";

function scoreRecommendation(exercise, metrics) {
  let score = 0;

  if (metrics.stress >= 70 && exercise.tags.includes("stress")) {
    score += 3;
  }
  if (metrics.anxiety >= 60 && (exercise.tags.includes("anxiety") || exercise.tags.includes("rumination"))) {
    score += 3;
  }
  if ((metrics.focus ?? 50) <= 45 && exercise.tags.includes("focus")) {
    score += 2;
  }
  if ((metrics.emotional_sensitivity ?? 50) >= 65 && exercise.tags.includes("self-criticism")) {
    score += 2;
  }
  if ((metrics.mood_stability ?? 50) <= 45 && exercise.tags.includes("mood")) {
    score += 2;
  }
  if ((metrics.social_comfort ?? 50) <= 40 && exercise.category === "self-reflection") {
    score += 1;
  }

  return score;
}

export function buildExerciseRecommendations(metrics) {
  return seedExercises
    .map((exercise) => ({ ...exercise, recommendationScore: scoreRecommendation(exercise, metrics) }))
    .filter((exercise) => exercise.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 4);
}
