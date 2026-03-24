from __future__ import annotations

from typing import Dict, List, Tuple

import math


STATE_LIBRARY = {
    "Stressed": {
        "description": "Recent signals suggest elevated stress and reduced recovery space. This is supportive pattern recognition, not diagnosis.",
        "signs": [
            "feeling on edge most days",
            "trouble unwinding after work",
            "shorter patience than usual",
        ],
        "recommended_exercises": [
            "breathing_reset",
            "grounding_reset",
            "stress_release_walk",
        ],
    },
    "Depressed": {
        "description": "Recent signals suggest heavier mood and lower energy right now. This is supportive pattern recognition, not diagnosis.",
        "signs": [
            "low motivation",
            "heavy or flat mood",
            "pulling back from effortful tasks",
        ],
        "recommended_exercises": [
            "self_compassion_reflection",
            "gratitude_practice",
            "journal_dump",
        ],
    },
    "FOMO-driven": {
        "description": "Recent signals suggest comparison, urgency, or difficulty feeling settled with one path.",
        "signs": [
            "social comparison",
            "restlessness",
            "difficulty feeling satisfied with one choice",
        ],
        "recommended_exercises": [
            "values_reflection",
            "gratitude_practice",
            "grounding_reset",
        ],
    },
    "Emotionally overwhelmed": {
        "description": "Recent signals suggest emotional intensity and overload may be landing heavily right now.",
        "signs": [
            "strong emotional surges",
            "feeling flooded",
            "small triggers landing heavily",
        ],
        "recommended_exercises": [
            "grounding_reset",
            "breathing_reset",
            "self_compassion_reflection",
        ],
    },
    "Overthinker": {
        "description": "Recent signals suggest repetitive analysis, uncertainty loops, or difficulty letting thoughts settle.",
        "signs": [
            "rumination",
            "analysis paralysis",
            "replaying situations afterward",
        ],
        "recommended_exercises": [
            "thought_reframing",
            "journal_dump",
            "breathing_reset",
        ],
    },
    "Balanced": {
        "description": "Current patterns appear comparatively steady, though maintenance habits still matter.",
        "signs": [
            "manageable stress most days",
            "steadier mood",
            "more reliable recovery habits",
        ],
        "recommended_exercises": [
            "gratitude_practice",
            "values_reflection",
            "sleep_wind_down",
        ],
    },
}


def _get_metric(metrics: Dict[str, object], *keys, default: float = 0.0) -> float:
    for key in keys:
        value = metrics.get(key)
        if value is None:
            continue
        try:
            return float(value)
        except (TypeError, ValueError):
            continue
    return float(default)


def _extract_mood_stats(metrics: Dict[str, object]) -> Tuple[float, float, float]:
    mood_logs = metrics.get("mood_logs")
    values: List[float] = []

    if isinstance(mood_logs, list):
        for entry in mood_logs:
            if isinstance(entry, dict):
                value = entry.get("mood") or entry.get("score") or entry.get("value")
            else:
                value = entry
            try:
                values.append(float(value))
            except (TypeError, ValueError):
                continue
    elif isinstance(mood_logs, dict):
        avg = _get_metric(mood_logs, "avg", "average", "mean", "mood_avg", default=0)
        volatility = _get_metric(mood_logs, "volatility", "std", "mood_volatility", default=0)
        low_ratio = _get_metric(mood_logs, "low_ratio", "low_mood_ratio", default=0)
        if avg or volatility or low_ratio:
            return avg, volatility, low_ratio

    if values:
        avg = sum(values) / len(values)
        variance = sum((v - avg) ** 2 for v in values) / len(values)
        volatility = math.sqrt(variance)
        low_ratio = sum(1 for v in values if v <= 2.0) / len(values)
        return avg, volatility, low_ratio

    avg_fallback = _get_metric(metrics, "mood_avg", "mood_average", default=3.0)
    volatility_fallback = _get_metric(metrics, "mood_volatility", "mood_std", default=0.4)
    low_ratio_fallback = _get_metric(metrics, "low_mood_ratio", default=0.0)
    return avg_fallback, volatility_fallback, low_ratio_fallback


def _extract_journal_sentiment(metrics: Dict[str, object]) -> float:
    sentiment = metrics.get("journal_sentiment")
    if sentiment is not None:
        try:
            return float(sentiment)
        except (TypeError, ValueError):
            pass

    tone = str(metrics.get("journal_tone") or "").lower().strip()
    if tone in {"heavy", "negative", "low"}:
        return -0.6
    if tone in {"reflective", "neutral"}:
        return 0.0
    if tone in {"calm", "positive", "light"}:
        return 0.4
    return 0.0


def _extract_exercise_history(metrics: Dict[str, object]) -> Tuple[int, float]:
    history = metrics.get("exercise_history")
    if not isinstance(history, dict):
        return 0, 0.0

    total = 0
    calming = 0
    for key, value in history.items():
        try:
            count = int(value)
        except (TypeError, ValueError):
            continue
        total += count
        if key in {"breathing_reset", "grounding_reset", "journal_dump", "gratitude_practice"}:
            calming += count

    ratio = calming / total if total else 0.0
    return total, ratio


def classify_mental_state(metrics: Dict[str, object]) -> Dict[str, object]:
    stress = _get_metric(metrics, "stress_score", "stress", default=50.0)
    anxiety = _get_metric(metrics, "anxiety", default=50.0)
    focus = _get_metric(metrics, "focus", default=50.0)
    social_comfort = _get_metric(metrics, "social_comfort", default=50.0)
    emotional_sensitivity = _get_metric(metrics, "emotional_sensitivity", default=50.0)
    rumination = _get_metric(metrics, "rumination", default=(anxiety + stress) / 2)
    sleep_quality = _get_metric(metrics, "sleep_quality", "sleep_quality_avg", "sleep", default=3.2)

    mood_avg, mood_volatility, low_mood_ratio = _extract_mood_stats(metrics)
    journal_sentiment = _extract_journal_sentiment(metrics)
    exercise_total, exercise_calm_ratio = _extract_exercise_history(metrics)

    fomo_score = _get_metric(metrics, "fomo_score", "social_comparison", default=0.0)

    if stress >= 75 and (sleep_quality <= 3.0 or focus <= 45):
        state_key = "Stressed"
        confidence = 0.8
    elif mood_avg <= 2.5 or journal_sentiment <= -0.45 or low_mood_ratio >= 0.5:
        state_key = "Depressed"
        confidence = 0.78
    elif fomo_score >= 65:
        state_key = "FOMO-driven"
        confidence = 0.71
    elif emotional_sensitivity >= 70 or mood_volatility >= 1.1 or (social_comfort <= 40 and anxiety >= 60):
        state_key = "Emotionally overwhelmed"
        confidence = 0.74
    elif anxiety > 70 and rumination > 60:
        state_key = "Overthinker"
        confidence = 0.78
    else:
        state_key = "Balanced"
        confidence = 0.66

    if exercise_total >= 6 and exercise_calm_ratio >= 0.6 and stress < 65 and mood_avg >= 3.2:
        state_key = "Balanced"
        confidence = max(confidence, 0.7)

    definition = STATE_LIBRARY[state_key]
    return {
        "mental_state": state_key,
        "name": state_key,
        "description": definition["description"],
        "common_signs": definition["signs"],
        "recommended_exercises": definition["recommended_exercises"],
        "recommendations": definition["recommended_exercises"],
        "confidence": confidence,
    }
