import { seedExercises } from "../data/exercises.js";

const catalogByKey = new Map(seedExercises.map((exercise) => [exercise.key, exercise]));
const catalogByTitle = new Map(seedExercises.map((exercise) => [normalizeSlug(exercise.title), exercise]));

export function getExerciseCatalog() {
  return seedExercises.map((exercise) => ({ ...exercise }));
}

export function enrichExercise(exercise = {}) {
  const normalizedKey = normalizeExerciseKey(exercise);
  const seed =
    (normalizedKey && catalogByKey.get(normalizedKey)) ||
    catalogByTitle.get(normalizeSlug(exercise.title));

  const merged = {
    ...seed,
    ...exercise
  };

  return {
    ...merged,
    key: merged.key || normalizedKey || normalizeSlug(merged.title),
    purpose: merged.purpose || merged.description || "Support a steadier next step.",
    expectedOutcome:
      merged.expectedOutcome ||
      "A calmer, clearer follow-up action that feels easier to sustain.",
    benefits: Array.isArray(merged.benefits) && merged.benefits.length ? merged.benefits : [],
    instructions: Array.isArray(merged.instructions) ? merged.instructions : [],
    tags: Array.isArray(merged.tags) ? merged.tags : [],
    bestForStates: Array.isArray(merged.bestForStates) ? merged.bestForStates : []
  };
}

export function normalizeExerciseKey(exercise = {}) {
  if (exercise?.key) {
    return normalizeSlug(exercise.key);
  }

  if (exercise?.title) {
    return normalizeSlug(exercise.title);
  }

  return "";
}

export function findExerciseByKey(key) {
  if (!key) {
    return null;
  }

  return (
    catalogByKey.get(normalizeSlug(key)) ||
    catalogByTitle.get(normalizeSlug(key)) ||
    null
  );
}

function normalizeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
