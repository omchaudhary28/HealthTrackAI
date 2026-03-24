import axios from "axios";
import { env } from "../config/env.js";

export async function logExerciseCompletionSample({
  userId,
  stressScore,
  mood,
  sleepQuality,
  exerciseCompleted,
  resultAfter
}) {
  try {
    await axios.post(
      `${env.mlServiceUrl}/log-sample`,
      {
        user_id: userId ? String(userId) : undefined,
        stress_score: Number.isFinite(Number(stressScore)) ? Number(stressScore) : 55,
        mood: mood || "neutral",
        sleep_quality: Number.isFinite(Number(sleepQuality)) ? Number(sleepQuality) : undefined,
        exercise_completed: exerciseCompleted,
        result_after: resultAfter || undefined
      },
      { timeout: 3000 }
    );
  } catch {
    return;
  }
}
