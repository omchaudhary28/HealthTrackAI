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
      mental_state: "Stressed",
      name: "Stressed",
      description:
        "Stress is elevated and recovery appears limited right now. This is supportive pattern recognition, not diagnosis.",
      common_signs: ["exhaustion that sleep does not fully fix", "lower focus", "feeling mentally overextended"],
      recommended_exercises: ["sleep_wind_down", "stress_release_walk", "breathing_reset"],
      recommendations: ["protect a recovery block", "reduce stimulation briefly", "choose one calming action next"],
      confidence: 0.84
    };
  }

  if (stress >= 75 && (sleepQuality <= 3 || focus < 45)) {
    return {
      mental_state: "Stressed",
      name: "Stressed",
      description:
        "Your recent inputs suggest elevated pressure and reduced recovery space. This is supportive pattern recognition, not diagnosis.",
      common_signs: ["feeling on edge", "trouble unwinding", "irritability"],
      recommended_exercises: ["breathing_reset", "grounding_reset", "stress_release_walk"],
      recommendations: ["slow the pace for a few minutes", "settle the body before problem-solving", "protect recovery today"],
      confidence: 0.8
    };
  }

  if (moodAvg <= 2.5 || journalSentiment <= -0.45) {
    return {
      mental_state: "Depressed",
      name: "Depressed",
      description:
        "Your recent inputs suggest a heavier mood and lower energy right now. This is supportive pattern recognition, not diagnosis.",
      common_signs: ["low motivation", "sad or heavy mood", "withdrawing from activities"],
      recommended_exercises: ["self_compassion_reflection", "gratitude_practice", "journal_dump"],
      recommendations: ["shrink the next step", "choose one supportive routine", "reduce pressure for perfect productivity"],
      confidence: 0.78
    };
  }

  if (socialComfort <= 40 && anxiety >= 60) {
    return {
      mental_state: "Emotionally overwhelmed",
      name: "Emotionally overwhelmed",
      description:
        "Your recent inputs suggest social pressure and emotional intensity may be landing heavily right now.",
      common_signs: ["anticipating negative judgment", "avoidance of social plans", "replaying conversations"],
      recommended_exercises: ["grounding_reset", "self_compassion_reflection", "breathing_reset"],
      recommendations: ["regulate before analyzing", "pick a smaller social step", "lower the emotional load first"],
      confidence: 0.74
    };
  }

  if (fomoScore >= 65) {
    return {
      mental_state: "FOMO-driven",
      name: "FOMO-driven",
      description: "Frequent worry about missing out on experiences or opportunities.",
      common_signs: ["social comparison", "restlessness", "checking social media frequently"],
      recommended_exercises: ["values_reflection", "gratitude_practice", "grounding_reset"],
      recommendations: ["reconnect with your own priorities", "step away from comparison triggers briefly", "choose one meaningful action"],
      confidence: 0.71
    };
  }

  if (emotionalSensitivity >= 70) {
    return {
      mental_state: "Emotionally overwhelmed",
      name: "Emotionally overwhelmed",
      description: "Emotions may shift quickly, and small triggers can feel intense.",
      common_signs: ["strong emotional reactions", "mood swings", "feeling easily overwhelmed"],
      recommended_exercises: ["grounding_reset", "breathing_reset", "self_compassion_reflection"],
      recommendations: ["settle the body first", "name the emotion without expanding the story", "use a simpler next step"],
      confidence: 0.72
    };
  }

  if (anxiety > 70 && rumination > 60) {
    return {
      mental_state: "Overthinker",
      name: "Overthinker",
      description: "Tendency toward repetitive analysis and replaying uncertain situations.",
      common_signs: ["rumination", "analysis paralysis", "difficulty letting thoughts settle"],
      recommended_exercises: ["thought_reframing", "journal_dump", "breathing_reset"],
      recommendations: ["externalize the loop", "reduce decision load", "choose one grounded action"],
      confidence: 0.78
    };
  }

  return {
    mental_state: "Balanced",
    name: "Balanced",
    description: "Current patterns appear comparatively steady, though routines still matter for maintenance.",
    common_signs: ["steady mood", "manageable stress", "consistent recovery habits"],
    recommended_exercises: ["gratitude_practice", "values_reflection", "sleep_wind_down"],
    recommendations: ["maintain the routines that are helping", "use reflection to stay steady", "protect recovery windows"],
    confidence: 0.66
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
