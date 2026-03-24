import { Exercise } from "../models/exercise.model.js";
import { ExerciseCompletion } from "../models/exercise-completion.model.js";
import { enrichExercise, findExerciseByKey, normalizeExerciseKey } from "../services/exercise-catalog.service.js";
import { logExerciseCompletionSample } from "../services/ml-feedback.service.js";
import { buildWellnessSnapshot, refreshMentalStateSnapshot } from "../services/wellness-profile.service.js";

export async function listExercises(req, res) {
  const category = req.query.category;
  const filters = category ? { category } : {};
  const storedItems = await Exercise.find(filters).sort({ createdAt: -1 }).lean();
  const items = (storedItems.length ? storedItems : []).map((exercise) => enrichExercise(exercise));

  if (items.length) {
    return res.json({ items });
  }

  const fallbackItems = category
    ? getFallbackExercises().filter((exercise) => exercise.category === category)
    : getFallbackExercises();

  return res.json({ items: fallbackItems });
}

export async function listRecommendedExercises(req, res) {
  const snapshot = await buildWellnessSnapshot(req.user.sub);
  res.json({
    items: snapshot.recommendationCards,
    currentMentalState: snapshot.classification.mental_state,
    suggestedAction: snapshot.suggestedAction
  });
}

export async function recordExerciseCompletion(req, res) {
  const payload = req.body || {};
  const exerciseKey = normalizeExerciseKey({
    key: payload.exerciseKey,
    title: payload.exerciseTitle
  });
  const catalogExercise = findExerciseByKey(exerciseKey || payload.exerciseTitle);
  const exercise = enrichExercise({
    ...catalogExercise,
    key: catalogExercise?.key || exerciseKey,
    title: payload.exerciseTitle || catalogExercise?.title,
    category: payload.category || catalogExercise?.category,
    durationMinutes: payload.durationMinutes || catalogExercise?.durationMinutes,
    purpose: catalogExercise?.purpose,
    description: payload.description || catalogExercise?.description
  });

  const completion = await ExerciseCompletion.create({
    userId: req.user.sub,
    exerciseKey: exercise.key,
    exerciseTitle: exercise.title,
    category: exercise.category,
    source: payload.source || "library",
    durationMinutes: exercise.durationMinutes,
    feedbackRating: payload.feedbackRating,
    feedbackText: payload.feedbackText,
    resultAfter: payload.resultAfter,
    contextSnapshot: {
      whyRecommended: payload.whyRecommended,
      expectedOutcome: payload.expectedOutcome
    }
  });

  const { snapshot } = await refreshMentalStateSnapshot(req.user.sub, "exercise-completion");

  await logExerciseCompletionSample({
    userId: req.user.sub,
    stressScore: snapshot.metrics.stress_score,
    mood: moodLabel(snapshot.metrics.mood_avg),
    sleepQuality: snapshot.metrics.sleep_quality,
    exerciseCompleted: exercise.key,
    resultAfter: payload.resultAfter || payload.feedbackText
  });

  res.status(201).json({
    item: completion,
    suggestedAction: snapshot.suggestedAction,
    recommendationCards: snapshot.recommendationCards
  });
}

function getFallbackExercises() {
  return [
    "breathing_reset",
    "grounding_reset",
    "thought_reframing",
    "gratitude_practice",
    "journal_dump",
    "stress_release_walk",
    "sleep_wind_down",
    "self_compassion_reflection",
    "values_reflection"
  ]
    .map((key) => findExerciseByKey(key))
    .filter(Boolean)
    .map((exercise) => enrichExercise(exercise));
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
