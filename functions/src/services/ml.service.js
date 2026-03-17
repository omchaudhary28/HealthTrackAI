import axios from "axios";
import { env } from "../config/env.js";

function fallbackExercise(stressScore) {
  if (typeof stressScore === "number" && stressScore >= 70) {
    return "breathing";
  }
  if (typeof stressScore === "number" && stressScore >= 55) {
    return "journaling";
  }
  return "gratitude";
}

export async function predictExerciseRecommendation({ stressScore, recentMood, sleepQuality }) {
  try {
    const response = await axios.post(
      `${env.mlServiceUrl}/predict-exercise`,
      {
        stress_score: typeof stressScore === "number" ? stressScore : 60,
        recent_mood: recentMood || null,
        sleep_quality: typeof sleepQuality === "number" ? sleepQuality : null
      },
      { timeout: 3000 }
    );

    return {
      recommendedExercise: response.data?.recommended_exercise || fallbackExercise(stressScore),
      confidence: response.data?.confidence ?? 0.35,
      modelReady: Boolean(response.data?.model_ready)
    };
  } catch {
    return {
      recommendedExercise: fallbackExercise(stressScore),
      confidence: 0.35,
      modelReady: false
    };
  }
}
