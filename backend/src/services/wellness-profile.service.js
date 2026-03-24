import { ExerciseCompletion } from "../models/exercise-completion.model.js";
import { JournalEntry } from "../models/journal-entry.model.js";
import { MentalState } from "../models/mental-state.model.js";
import { MoodLog } from "../models/mood-log.model.js";
import { TestResult } from "../models/test-result.model.js";
import { User } from "../models/user.model.js";
import { classifyMentalState } from "./ai.service.js";
import { buildExerciseRecommendations } from "./recommendation.service.js";

const STATE_NORMALIZATION = {
  "Stress Overloaded": "Stressed",
  "Stress_Overloaded": "Stressed",
  "Burnout Risk": "Stressed",
  Burnout_Risk: "Stressed",
  "Low Mood": "Depressed",
  Low_Mood: "Depressed",
  "FOMO Pattern": "FOMO-driven",
  FOMO_Pattern: "FOMO-driven",
  "Emotional Sensitivity": "Emotionally overwhelmed",
  Emotional_Sensitivity: "Emotionally overwhelmed",
  "Social Anxiety": "Emotionally overwhelmed"
};

export async function buildWellnessSnapshot(userId) {
  const [user, latestBaseline, moodLogs, journalEntries, mentalStates, testResults, exerciseCompletions] =
    await Promise.all([
      User.findById(userId).lean(),
      TestResult.findOne({ userId, testKey: "baseline" }).sort({ createdAt: -1 }).lean(),
      MoodLog.find({ userId }).sort({ date: -1 }).limit(60).lean(),
      JournalEntry.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      MentalState.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
      TestResult.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
      ExerciseCompletion.find({ userId }).sort({ createdAt: -1 }).limit(60).lean()
    ]);

  const moodStats = summarizeMoodLogs(moodLogs);
  const journalSummary = summarizeJournalEntries(journalEntries);
  const exerciseHistory = summarizeExerciseHistory(exerciseCompletions);
  const latestScores = latestBaseline?.dimensionScores || {};

  const metrics = {
    ...latestScores,
    stress: blendedScore(latestScores.stress, moodStats.stressAverage, 0.6),
    stress_score: blendedScore(latestScores.stress, moodStats.stressAverage, 0.6),
    anxiety: Number(latestScores.anxiety ?? 50),
    focus: Number(latestScores.focus ?? 50),
    mood_stability: Number(latestScores.mood_stability ?? 50),
    social_comfort: Number(latestScores.social_comfort ?? 50),
    emotional_sensitivity: blendedScore(
      latestScores.emotional_sensitivity,
      moodStats.volatilityScore,
      0.65
    ),
    rumination: Math.max(
      Number(latestScores.rumination ?? average([latestScores.stress, latestScores.anxiety], 55)),
      journalSummary.ruminationScore
    ),
    mood_logs: {
      avg: moodStats.average,
      volatility: moodStats.volatility,
      low_ratio: moodStats.lowRatio,
      stress_avg: moodStats.stressAverage,
      sleep_quality_avg: moodStats.sleepAverage,
      energy_avg: moodStats.energyAverage
    },
    mood_avg: moodStats.average,
    mood_average: moodStats.average,
    sleep_quality: moodStats.sleepAverage,
    sleep_quality_avg: moodStats.sleepAverage,
    journal_sentiment: journalSummary.sentiment,
    fomo_score: Math.max(Number(latestScores.fomo_score ?? 0), journalSummary.fomoScore),
    exercise_history: exerciseHistory.counts
  };

  const classified = normalizeClassification(await classifyMentalState(metrics), metrics);
  const recommendationCards = buildExerciseRecommendations({
    metrics,
    mentalState: classified.mental_state,
    exerciseHistory,
    journalPatterns: journalSummary.patterns,
    limit: 4
  });

  const suggestedAction = recommendationCards[0]
    ? {
        title: recommendationCards[0].title,
        purpose: recommendationCards[0].purpose,
        expectedOutcome: recommendationCards[0].expectedOutcome,
        whyRecommended: recommendationCards[0].whyRecommended,
        durationMinutes: recommendationCards[0].durationMinutes
      }
    : null;

  return {
    user,
    latestBaseline,
    recentMoodLogs: moodLogs.slice(0, 30),
    recentJournalEntries: journalEntries.slice(0, 5),
    mentalStates,
    recentTestResults: testResults,
    exerciseCompletions,
    metrics,
    classification: classified,
    recommendationCards,
    suggestedAction,
    analytics: buildAnalytics({ moodLogs, testResults, exerciseCompletions }),
    activitySummary: buildActivitySummary({ moodLogs, journalEntries, exerciseCompletions }),
    journalSignals: journalSummary,
    exerciseHistory,
    aiInsightsHistory: buildAiInsightsHistory(mentalStates, recommendationCards)
  };
}

export async function refreshMentalStateSnapshot(userId, source = "system") {
  const snapshot = await buildWellnessSnapshot(userId);
  const latest = snapshot.mentalStates?.[0];
  const stateName = snapshot.classification.mental_state;
  const shouldCreate =
    !latest ||
    latest.mentalState !== stateName ||
    hoursBetween(latest.createdAt, new Date()) >= 12 ||
    source !== "system";

  if (!shouldCreate) {
    return { snapshot, savedMentalState: latest };
  }

  const savedMentalState = await MentalState.create({
    userId,
    mentalState: stateName,
    description: snapshot.classification.description,
    recommendations: snapshot.classification.recommendations || [],
    commonSigns: snapshot.classification.common_signs || [],
    recommendedExercises: snapshot.recommendationCards.map((item) => item.key),
    factors: snapshot.metrics,
    confidence: snapshot.classification.confidence || 0.7,
    source,
    whyNow: snapshot.recommendationCards[0]?.whyRecommended || snapshot.classification.description,
    suggestedAction: snapshot.suggestedAction?.title || "",
    recommendationCards: snapshot.recommendationCards
  });

  return {
    snapshot: {
      ...snapshot,
      mentalStates: [savedMentalState.toObject(), ...(snapshot.mentalStates || [])].slice(0, 8)
    },
    savedMentalState: savedMentalState.toObject()
  };
}

export function normalizeClassification(classification = {}, metrics = {}) {
  const normalizedName = normalizeMentalStateName(classification.mental_state || classification.name);

  const descriptionByState = {
    Overthinker:
      "Your recent signals suggest repeated mental loops, second-guessing, or difficulty letting thoughts settle.",
    Stressed:
      "Your recent signals suggest elevated pressure, reduced recovery room, or a nervous system that has been working hard.",
    Depressed:
      "Your recent signals suggest heavier mood, lower energy, or reduced motivation right now. This is supportive pattern recognition, not diagnosis.",
    "FOMO-driven":
      "Your recent signals suggest comparison, urgency, or a pull toward what others might be doing instead of what feels grounding for you.",
    "Emotionally overwhelmed":
      "Your recent signals suggest emotional intensity, fast shifts, or feeling overloaded by the moment.",
    Balanced:
      "Your recent signals look comparatively steady, though small maintenance habits still matter."
  };

  const recommendationsByState = {
    Overthinker: ["Use a grounding or reframing exercise", "Externalize the loop onto paper", "Choose one next action only"],
    Stressed: ["Lower stimulation for a few minutes", "Choose a quick calming reset", "Protect a small recovery window today"],
    Depressed: ["Aim for a very small supportive action", "Use a gentle self-compassion or gratitude prompt", "Reduce pressure for perfect follow-through"],
    "FOMO-driven": ["Reconnect with values before reacting", "Reduce comparison triggers briefly", "Choose one meaningful action over many urgent ones"],
    "Emotionally overwhelmed": ["Regulate before analyzing", "Use present-moment grounding", "Shrink the next step to something safe and simple"],
    Balanced: ["Maintain what is already helping", "Use reflection to stay consistent", "Protect sleep and recovery routines"]
  };

  const signsByState = {
    Overthinker: ["replaying conversations", "difficulty deciding", "mental loops at night"],
    Stressed: ["feeling on edge", "trouble unwinding", "shorter patience than usual"],
    Depressed: ["low motivation", "heavy mood", "withdrawing from effortful tasks"],
    "FOMO-driven": ["social comparison", "restlessness", "difficulty feeling settled with one choice"],
    "Emotionally overwhelmed": ["strong emotional surges", "feeling flooded", "small triggers landing heavily"],
    Balanced: ["manageable stress", "steady mood", "more reliable recovery habits"]
  };

  return {
    ...classification,
    mental_state: normalizedName,
    name: normalizedName,
    description: classification.description || descriptionByState[normalizedName],
    confidence: Number(classification.confidence ?? 0.68),
    common_signs: Array.isArray(classification.common_signs) && classification.common_signs.length
      ? classification.common_signs
      : signsByState[normalizedName],
    recommendations:
      Array.isArray(classification.recommendations) && classification.recommendations.length
        ? classification.recommendations
        : recommendationsByState[normalizedName],
    metrics
  };
}

function normalizeMentalStateName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "Balanced";
  }

  return STATE_NORMALIZATION[trimmed] || trimmed;
}

function summarizeMoodLogs(moodLogs = []) {
  const moodValues = moodLogs.map((item) => Number(item.mood)).filter(Number.isFinite);
  const stressValues = moodLogs.map((item) => Number(item.stressLevel)).filter(Number.isFinite);
  const sleepValues = moodLogs.map((item) => Number(item.sleepQuality)).filter(Number.isFinite);
  const energyValues = moodLogs.map((item) => Number(item.energyLevel)).filter(Number.isFinite);

  const averageMood = average(moodValues, 3);
  const volatility = standardDeviation(moodValues, 0.35);

  return {
    average: round(averageMood, 2),
    lowRatio: moodValues.length ? round(moodValues.filter((value) => value <= 2).length / moodValues.length, 2) : 0,
    volatility: round(volatility, 2),
    volatilityScore: round(Math.min(100, volatility * 28 + (5 - averageMood) * 10), 1),
    stressAverage: round(average(stressValues, 55), 1),
    sleepAverage: round(average(sleepValues, 3.2), 1),
    energyAverage: round(average(energyValues, 3), 1)
  };
}

function summarizeJournalEntries(entries = []) {
  const toneScores = {
    heavy: -0.75,
    negative: -0.6,
    low: -0.55,
    anxious: -0.35,
    stressed: -0.35,
    reflective: 0,
    neutral: 0,
    calm: 0.35,
    positive: 0.45,
    happy: 0.5
  };

  const patternCounts = new Map();
  const sentiments = [];

  for (const entry of entries) {
    const tone = String(entry?.aiInsights?.tone || "").toLowerCase();
    if (toneScores[tone] !== undefined) {
      sentiments.push(toneScores[tone]);
    }

    for (const pattern of entry?.aiInsights?.patterns || []) {
      const normalized = String(pattern).trim().toLowerCase();
      if (!normalized) {
        continue;
      }

      patternCounts.set(normalized, (patternCounts.get(normalized) || 0) + 1);
    }
  }

  const patterns = [...patternCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern]) => pattern);

  return {
    patterns,
    sentiment: round(average(sentiments, 0), 2),
    ruminationScore: patterns.includes("rumination") ? 78 : 42,
    fomoScore: patterns.includes("social comparison") ? 72 : 0
  };
}

function summarizeExerciseHistory(completions = []) {
  const counts = {};
  const ratings = {};
  const recentKeys = [];

  for (const completion of completions) {
    const key = String(completion.exerciseKey || "").trim();
    if (!key) {
      continue;
    }

    counts[key] = (counts[key] || 0) + 1;
    recentKeys.push(key);

    const rating = Number(completion.feedbackRating);
    if (Number.isFinite(rating) && rating > 0) {
      ratings[key] = ratings[key] || [];
      ratings[key].push(rating);
    }
  }

  const averageRatings = Object.fromEntries(
    Object.entries(ratings).map(([key, values]) => [key, round(average(values, 0), 2)])
  );

  const topRatedKeys = Object.entries(averageRatings)
    .filter(([, value]) => Number(value) >= 4)
    .map(([key]) => key);

  return {
    counts,
    averageRatings,
    topRatedKeys,
    recentKeys: recentKeys.slice(0, 6),
    totalCompleted: completions.length
  };
}

function buildAnalytics({ moodLogs = [], testResults = [], exerciseCompletions = [] }) {
  const scoreSeries = [...testResults]
    .reverse()
    .slice(-6)
    .map((item) => ({
      label: formatShortDate(item.createdAt),
      value: Number(item.mentalScore ?? 0)
    }));

  const moodSeries = [...moodLogs]
    .reverse()
    .slice(-7)
    .map((item) => ({
      label: formatShortDate(item.date),
      value: Number(item.mood ?? 0)
    }));

  const stressSeries = [...moodLogs]
    .reverse()
    .slice(-7)
    .map((item) => ({
      label: formatShortDate(item.date),
      value: Number(item.stressLevel ?? 0)
    }));

  return {
    scoreTrend: {
      labels: scoreSeries.map((item) => item.label),
      values: scoreSeries.map((item) => item.value)
    },
    moodTrend: {
      labels: moodSeries.map((item) => item.label),
      values: moodSeries.map((item) => item.value)
    },
    stressTrend: {
      labels: stressSeries.map((item) => item.label),
      values: stressSeries.map((item) => item.value)
    },
    exerciseMomentum: {
      labels: lastSevenDayLabels(),
      values: countByRecentDays(exerciseCompletions, (item) => item.createdAt)
    }
  };
}

function buildActivitySummary({ moodLogs = [], journalEntries = [], exerciseCompletions = [] }) {
  const now = new Date();
  const within30Days = (value) => daysBetween(value, now) <= 30;

  return {
    moodCheckIns30d: moodLogs.filter((item) => within30Days(item.date)).length,
    journalEntries30d: journalEntries.filter((item) => within30Days(item.createdAt)).length,
    exerciseCompleted30d: exerciseCompletions.filter((item) => within30Days(item.createdAt)).length,
    exerciseStreak: buildRecentStreak(exerciseCompletions.map((item) => item.createdAt)),
    journalStreak: buildRecentStreak(journalEntries.map((item) => item.createdAt))
  };
}

function buildAiInsightsHistory(mentalStates = [], recommendationCards = []) {
  const history = mentalStates.slice(0, 4).map((item) => ({
    id: String(item._id || item.id || item.createdAt || Math.random()),
    title: item.mentalState,
    description: item.description,
    confidence: item.confidence,
    createdAt: item.createdAt,
    suggestedAction: item.suggestedAction || recommendationCards[0]?.title || ""
  }));

  if (history.length) {
    return history;
  }

  return recommendationCards.slice(0, 2).map((item, index) => ({
    id: `rec-${index}`,
    title: item.title,
    description: item.whyRecommended,
    confidence: null,
    createdAt: null,
    suggestedAction: item.expectedOutcome
  }));
}

function blendedScore(primary, secondary, primaryWeight = 0.5) {
  const first = Number(primary);
  const second = Number(secondary);

  if (Number.isFinite(first) && Number.isFinite(second)) {
    return round(first * primaryWeight + second * (1 - primaryWeight), 1);
  }

  if (Number.isFinite(first)) {
    return first;
  }

  if (Number.isFinite(second)) {
    return second;
  }

  return 50;
}

function average(values = [], fallback = 0) {
  const cleaned = values.map(Number).filter(Number.isFinite);
  if (!cleaned.length) {
    return fallback;
  }

  return cleaned.reduce((sum, value) => sum + value, 0) / cleaned.length;
}

function standardDeviation(values = [], fallback = 0) {
  const cleaned = values.map(Number).filter(Number.isFinite);
  if (!cleaned.length) {
    return fallback;
  }

  const avg = average(cleaned, fallback);
  const variance = cleaned.reduce((sum, value) => sum + (value - avg) ** 2, 0) / cleaned.length;
  return Math.sqrt(variance);
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function lastSevenDayLabels() {
  const now = new Date();
  const labels = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    labels.push(new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date));
  }

  return labels;
}

function countByRecentDays(items = [], getDate) {
  const now = new Date();

  return Array.from({ length: 7 }, (_unused, index) => {
    const target = new Date(now);
    target.setHours(0, 0, 0, 0);
    target.setDate(now.getDate() - (6 - index));

    return items.filter((item) => {
      const value = new Date(getDate(item));
      if (Number.isNaN(value.getTime())) {
        return false;
      }

      value.setHours(0, 0, 0, 0);
      return value.getTime() === target.getTime();
    }).length;
  });
}

function buildRecentStreak(values = []) {
  const keys = new Set(
    values
      .map((value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "";
        }

        return date.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!keys.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function daysBetween(value, reference) {
  const left = new Date(value);
  const right = new Date(reference);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const diff = Math.abs(right.getTime() - left.getTime());
  return diff / (1000 * 60 * 60 * 24);
}

function hoursBetween(value, reference) {
  const left = new Date(value);
  const right = new Date(reference);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(right.getTime() - left.getTime()) / (1000 * 60 * 60);
}
