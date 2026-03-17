import axios from "axios";
import { env } from "../config/env.js";

function fallbackClassification(metrics) {
  const anxiety = Number(metrics.anxiety ?? 50);
  const stress = Number(metrics.stress ?? metrics.stress_score ?? 50);
  const focus = Number(metrics.focus ?? 50);
  const socialComfort = Number(metrics.social_comfort ?? 50);
  const emotionalSensitivity = Number(metrics.emotional_sensitivity ?? 50);
  const rumination = Number(metrics.rumination ?? Math.round((anxiety + stress) / 2));
  const sleepQuality = Number(metrics.sleep_quality ?? metrics.sleep_quality_avg ?? 3.2);
  const moodLogs = metrics.mood_logs || {};
  const moodAvg = Number(
    metrics.mood_avg ??
      metrics.mood_average ??
      moodLogs.avg ??
      moodLogs.average ??
      moodLogs.mean ??
      3.0
  );
  const journalSentiment = Number(metrics.journal_sentiment ?? 0);
  const fomoScore = Number(metrics.fomo_score ?? metrics.social_comparison ?? 0);

  if (stress >= 85 && sleepQuality <= 2.5 && moodAvg <= 2.8) {
    return {
      mental_state: "Burnout Risk",
      name: "Burnout Risk",
      description: "Sustained stress and low recovery may be pushing you toward burnout.",
      common_signs: ["exhaustion that sleep doesn't fix", "lower focus", "cynicism or detachment"],
      recommended_exercises: ["sleep_wind_down", "boundary_planning", "micro_breaks"],
      recommendations: ["sleep_wind_down", "boundary_planning", "micro_breaks"]
    };
  }

  if (stress >= 75 && (sleepQuality <= 3 || focus < 45)) {
    return {
      mental_state: "Stress Overloaded",
      name: "Stress Overloaded",
      description: "Stress levels are running high and recovery space feels limited.",
      common_signs: ["feeling on edge", "trouble unwinding", "irritability"],
      recommended_exercises: ["box_breathing", "grounding_5_4_3_2_1", "stress_release_walk"],
      recommendations: ["box_breathing", "grounding_5_4_3_2_1", "stress_release_walk"]
    };
  }

  if (moodAvg <= 2.5 || journalSentiment <= -0.45) {
    return {
      mental_state: "Low Mood",
      name: "Low Mood",
      description: "Energy and motivation feel lower, and mood may dip more often.",
      common_signs: ["low motivation", "sad or heavy mood", "withdrawing from activities"],
      recommended_exercises: ["self_compassion_reflection", "small_wins_list", "gratitude_practice"],
      recommendations: ["self_compassion_reflection", "small_wins_list", "gratitude_practice"]
    };
  }

  if (socialComfort <= 40 && anxiety >= 60) {
    return {
      mental_state: "Social Anxiety",
      name: "Social Anxiety",
      description: "Social situations may feel tense, uncertain, or draining.",
      common_signs: ["anticipating negative judgment", "avoidance of social plans", "replaying conversations"],
      recommended_exercises: ["gentle_exposure_steps", "grounding_5_4_3_2_1", "self_compassion_reflection"],
      recommendations: ["gentle_exposure_steps", "grounding_5_4_3_2_1", "self_compassion_reflection"]
    };
  }

  if (fomoScore >= 65) {
    return {
      mental_state: "FOMO Pattern",
      name: "FOMO Pattern",
      description: "Frequent worry about missing out on experiences or opportunities.",
      common_signs: ["social comparison", "restlessness", "checking social media frequently"],
      recommended_exercises: ["digital_detox", "gratitude_practice", "value_reflection"],
      recommendations: ["digital_detox", "gratitude_practice", "value_reflection"]
    };
  }

  if (emotionalSensitivity >= 70) {
    return {
      mental_state: "Emotional Sensitivity",
      name: "Emotional Sensitivity",
      description: "Emotions may shift quickly, and small triggers can feel intense.",
      common_signs: ["strong emotional reactions", "mood swings", "feeling easily overwhelmed"],
      recommended_exercises: ["emotion_labeling", "breathing_reset", "self_compassion_reflection"],
      recommendations: ["emotion_labeling", "breathing_reset", "self_compassion_reflection"]
    };
  }

  if (anxiety > 70 && rumination > 60) {
    return {
      mental_state: "Overthinker",
      name: "Overthinker",
      description: "Tendency toward repetitive analysis and replaying uncertain situations.",
      common_signs: ["rumination", "analysis paralysis", "difficulty letting thoughts settle"],
      recommended_exercises: ["thought_reframing", "journal_dump", "box_breathing"],
      recommendations: ["thought_reframing", "journal_dump", "box_breathing"]
    };
  }

  return {
    mental_state: "Balanced",
    name: "Balanced",
    description: "Current patterns appear comparatively steady, though routines still matter for maintenance.",
    common_signs: ["steady mood", "manageable stress", "consistent recovery habits"],
    recommended_exercises: ["gratitude_practice", "light_journaling", "sleep_wind_down"],
    recommendations: ["gratitude_practice", "light_journaling", "sleep_wind_down"]
  };
}

export async function classifyMentalState(metrics) {
  try {
    const response = await axios.post(`${env.aiServiceUrl}/classify`, { metrics }, { timeout: 4000 });
    return response.data;
  } catch {
    return fallbackClassification(metrics);
  }
}

export async function getAiRecommendations(metrics, mentalState) {
  try {
    const response = await axios.post(
      `${env.aiServiceUrl}/recommendations`,
      { metrics, mental_state: mentalState },
      { timeout: 4000 }
    );
    return response.data;
  } catch {
    return {
      activities: [],
      rationale: "Rule-based local fallback applied because the AI service was unavailable."
    };
  }
}

export async function analyzeJournalText(text, recentMood) {
  try {
    const response = await axios.post(
      `${env.aiServiceUrl}/journal/analyze`,
      { text, recent_mood: recentMood },
      { timeout: 4000 }
    );
    return response.data;
  } catch {
    return {
      patterns: ["reflection"],
      tone: recentMood || "neutral",
      suggestions: [
        "Notice one thought that kept returning today.",
        "Write one supportive sentence you would say to a friend in the same situation."
      ]
    };
  }
}
