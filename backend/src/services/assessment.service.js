import { testsCatalog } from "../data/tests.js";
import { HttpError } from "../utils/http-error.js";

const adverseDimensions = new Set([
  "stress",
  "anxiety",
  "emotional_sensitivity",
  "fatigue",
  "rumination",
  "dependence",
  "identity_confusion"
]);

function findTest(testKey) {
  return testsCatalog.find((test) => test.key === testKey);
}

function normalizeValue(value) {
  return Math.round(((Number(value) - 1) / 4) * 100);
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function toLabel(metric, score) {
  if (adverseDimensions.has(metric)) {
    if (score >= 70) {
      return "high";
    }
    if (score >= 40) {
      return "moderate";
    }
    return "low";
  }

  if (score >= 70) {
    return "high";
  }
  if (score >= 40) {
    return "medium";
  }
  return "low";
}

export function scoreTest(testKey, submittedAnswers) {
  const test = findTest(testKey);

  if (!test) {
    throw new HttpError(404, "Test not found");
  }

  const answers = Array.isArray(submittedAnswers) ? submittedAnswers : [];
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const dimensionScores = {};

  for (const question of test.questions) {
    const responseValue = answerMap.get(question.id);
    if (typeof responseValue !== "number") {
      throw new HttpError(400, `Missing answer for question ${question.id}`);
    }

    const score = normalizeValue(responseValue);
    const current = dimensionScores[question.dimension] || [];
    current.push(score);
    dimensionScores[question.dimension] = current;
  }

  const averagedScores = Object.fromEntries(
    Object.entries(dimensionScores).map(([dimension, values]) => [dimension, average(values)])
  );

  if (averagedScores.emotional_sensitivity !== undefined) {
    averagedScores.emotional_stability = 100 - averagedScores.emotional_sensitivity;
  }

  const labels = Object.fromEntries(
    Object.entries(averagedScores)
      .filter(([dimension]) => dimension !== "emotional_stability")
      .map(([dimension, score]) => [dimension, toLabel(dimension, score)])
  );

  if (averagedScores.emotional_stability !== undefined) {
    labels.emotional_stability = toLabel("emotional_stability", averagedScores.emotional_stability);
  }

  const positiveComposite = [
    averagedScores.mood_stability ?? 50,
    averagedScores.focus ?? 50,
    averagedScores.social_comfort ?? 50,
    averagedScores.emotional_stability ?? 50
  ];
  const adverseComposite = [
    100 - (averagedScores.stress ?? 50),
    100 - (averagedScores.anxiety ?? 50)
  ];
  const mentalScore = average([...positiveComposite, ...adverseComposite]);

  return {
    test,
    answers,
    dimensionScores: averagedScores,
    labels,
    mentalScore,
    interpretation: test.interpretationGuide || []
  };
}

export function getTestsSummary() {
  return testsCatalog.map(({ key, title, category, description, scoringScale }) => ({
    key,
    title,
    category,
    description,
    scoringScale
  }));
}

export function getTestByKey(testKey) {
  const test = findTest(testKey);
  if (!test) {
    throw new HttpError(404, "Test not found");
  }

  return test;
}
