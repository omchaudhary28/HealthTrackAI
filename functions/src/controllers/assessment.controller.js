import { MentalState } from "../models/mental-state.model.js";
import { MoodLog } from "../models/mood-log.model.js";
import { JournalEntry } from "../models/journal-entry.model.js";
import { TestResult } from "../models/test-result.model.js";
import { User } from "../models/user.model.js";
import { classifyMentalState, getAiRecommendations } from "../services/ai.service.js";
import { scoreTest } from "../services/assessment.service.js";
import { getPopulationComparison } from "../services/population.service.js";
import { buildExerciseRecommendations } from "../services/recommendation.service.js";

export async function submitBaselineAssessment(req, res) {
  const scored = scoreTest("baseline", req.body.answers);

  const comparisons = await Promise.all(
    ["stress", "anxiety", "mood_stability", "focus", "emotional_sensitivity", "social_comfort"].map((metric) =>
      getPopulationComparison(metric, scored.dimensionScores[metric] ?? 50)
    )
  );

  const [recentMoodLogs, recentJournalEntries] = await Promise.all([
    MoodLog.find({ userId: req.user.sub }).sort({ date: -1 }).limit(14).lean(),
    JournalEntry.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(10).lean()
  ]);

  const moodStats = buildMoodStats(recentMoodLogs);
  const journalSentiment = buildJournalSentiment(recentJournalEntries);

  const classificationMetrics = {
    ...scored.dimensionScores,
    stress_score: scored.dimensionScores.stress ?? 50,
    mood_logs: moodStats,
    sleep_quality: moodStats.sleep_quality_avg ?? 3.2,
    journal_sentiment: journalSentiment,
    exercise_history: req.body?.exercise_history || {}
  };

  const classification = await classifyMentalState(classificationMetrics);
  const aiRecommendations = await getAiRecommendations(
    classificationMetrics,
    classification.mental_state
  );
  const recommendationSet = buildExerciseRecommendations(scored.dimensionScores);

  await TestResult.create({
    userId: req.user.sub,
    testKey: "baseline",
    category: "Onboarding",
    answers: scored.answers,
    dimensionScores: scored.dimensionScores,
    labels: scored.labels,
    mentalScore: scored.mentalScore,
    interpretation: scored.interpretation,
    populationComparison: comparisons
  });

  const savedMentalState = await MentalState.create({
    userId: req.user.sub,
    mentalState: classification.mental_state,
    description: classification.description,
    recommendations: classification.recommendations,
    commonSigns: classification.common_signs || [],
    recommendedExercises: classification.recommended_exercises || classification.recommendations || [],
    factors: scored.dimensionScores,
    confidence: classification.confidence || 0.72
  });

  await User.findByIdAndUpdate(req.user.sub, { baselineComplete: true });

  res.status(201).json({
    mental_score: scored.mentalScore,
    labels: scored.labels,
    dimension_scores: scored.dimensionScores,
    classification,
    ai_recommendations: aiRecommendations,
    recommended_activities: recommendationSet,
    population_comparison: comparisons,
    state_snapshot_id: savedMentalState.id,
    disclaimer: "MindTrack AI provides wellness support and self-reflection tools only."
  });
}

export async function getPopulationComparisonByMetric(req, res) {
  const { metric, score } = req.params;
  const comparison = await getPopulationComparison(metric, Number(score));
  res.json(comparison);
}

export async function getLatestMentalState(req, res) {
  const latest = await MentalState.findOne({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
  const latestResult = await TestResult.findOne({ userId: req.user.sub, testKey: "baseline" })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    mentalState: latest,
    latestBaseline: latestResult
  });
}

function buildMoodStats(logs) {
  const moodValues = [];
  const stressValues = [];
  const sleepValues = [];

  for (const entry of logs || []) {
    if (Number.isFinite(entry?.mood)) {
      moodValues.push(Number(entry.mood));
    }
    if (Number.isFinite(entry?.stressLevel)) {
      stressValues.push(Number(entry.stressLevel));
    }
    if (Number.isFinite(entry?.sleepQuality)) {
      sleepValues.push(Number(entry.sleepQuality));
    }
  }

  const moodAvg = average(moodValues, 3);
  const moodVolatility = standardDeviation(moodValues, 0.4);
  const lowMoodRatio = moodValues.length
    ? moodValues.filter((value) => value <= 2).length / moodValues.length
    : 0;

  return {
    avg: moodAvg,
    volatility: moodVolatility,
    low_ratio: lowMoodRatio,
    stress_avg: average(stressValues, 50),
    sleep_quality_avg: average(sleepValues, 3.2)
  };
}

function buildJournalSentiment(entries) {
  const toneScores = {
    heavy: -0.6,
    negative: -0.6,
    low: -0.5,
    anxious: -0.4,
    stressed: -0.4,
    reflective: 0,
    neutral: 0,
    calm: 0.4,
    positive: 0.5,
    great: 0.6,
    happy: 0.5
  };

  const scores = [];
  for (const entry of entries || []) {
    const tone = (entry?.aiInsights?.tone || "").toLowerCase();
    if (toneScores[tone] !== undefined) {
      scores.push(toneScores[tone]);
    }
  }

  return average(scores, 0);
}

function average(values, fallback) {
  if (!values?.length) {
    return fallback;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function standardDeviation(values, fallback) {
  if (!values?.length) {
    return fallback;
  }
  const avg = average(values, fallback);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
