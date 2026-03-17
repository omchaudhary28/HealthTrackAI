from __future__ import annotations

from typing import Dict, List, Tuple

import math


STATE_LIBRARY = {
    "Stress_Overloaded": {
        "name": "Stress Overloaded",
        "description": "Stress levels are running high and recovery space feels limited.",
        "signs": [
            "feeling on edge most days",
            "trouble unwinding after work",
            "short temper or irritability",
        ],
        "recommended_exercises": [
            "box_breathing",
            "grounding_5_4_3_2_1",
            "stress_release_walk",
        ],
    },
    "Low_Mood": {
        "name": "Low Mood",
        "description": "Energy and motivation feel lower, and mood may dip more often.",
        "signs": [
            "low motivation",
            "sad or heavy mood",
            "withdrawing from activities",
        ],
        "recommended_exercises": [
            "self_compassion_reflection",
            "small_wins_list",
            "gratitude_practice",
        ],
    },
    "FOMO_Pattern": {
        "name": "FOMO Pattern",
        "description": "Frequent worry about missing out on experiences or opportunities.",
        "signs": [
            "social comparison",
            "restlessness",
            "checking social media frequently",
        ],
        "recommended_exercises": [
            "digital_detox",
            "gratitude_practice",
            "value_reflection",
        ],
    },
    "Social_Anxiety": {
        "name": "Social Anxiety",
        "description": "Social situations may feel tense, uncertain, or draining.",
        "signs": [
            "anticipating negative judgment",
            "avoidance of social plans",
            "replaying conversations afterward",
        ],
        "recommended_exercises": [
            "gentle_exposure_steps",
            "grounding_5_4_3_2_1",
            "self_compassion_reflection",
        ],
    },
    "Burnout_Risk": {
        "name": "Burnout Risk",
        "description": "Sustained stress and low recovery may be pushing you toward burnout.",
        "signs": [
            "exhaustion that sleep doesn't fix",
            "lower focus or productivity",
            "cynicism or detachment",
        ],
        "recommended_exercises": [
            "sleep_wind_down",
            "boundary_planning",
            "micro_breaks",
        ],
    },
    "Emotional_Sensitivity": {
        "name": "Emotional Sensitivity",
        "description": "Emotions may shift quickly, and small triggers can feel intense.",
        "signs": [
            "strong emotional reactions",
            "mood swings",
            "feeling easily overwhelmed",
        ],
        "recommended_exercises": [
            "emotion_labeling",
            "breathing_reset",
            "self_compassion_reflection",
        ],
    },
    "Overthinker": {
        "name": "Overthinker",
        "description": "Tendency toward repetitive analysis, uncertainty loops, and replaying past situations.",
        "signs": [
            "rumination",
            "analysis paralysis",
            "difficulty letting thoughts settle",
        ],
        "recommended_exercises": [
            "thought_reframing",
            "journal_dump",
            "box_breathing",
        ],
    },
    "Balanced": {
        "name": "Balanced",
        "description": "Current patterns appear comparatively steady, though routines still matter for maintenance.",
        "signs": [
            "steady mood most days",
            "manageable stress levels",
            "consistent recovery habits",
        ],
        "recommended_exercises": [
            "gratitude_practice",
            "light_journaling",
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
        if key in {"breathing", "box_breathing", "grounding", "journaling", "gratitude"}:
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

    if stress >= 85 and sleep_quality <= 2.5 and (mood_avg <= 2.8 or low_mood_ratio >= 0.4):
        state_key = "Burnout_Risk"
        confidence = 0.84
    elif stress >= 75 and (sleep_quality <= 3.0 or focus <= 45):
        state_key = "Stress_Overloaded"
        confidence = 0.8
    elif mood_avg <= 2.5 or journal_sentiment <= -0.45 or low_mood_ratio >= 0.5:
        state_key = "Low_Mood"
        confidence = 0.78
    elif social_comfort <= 40 and anxiety >= 60:
        state_key = "Social_Anxiety"
        confidence = 0.74
    elif fomo_score >= 65:
        state_key = "FOMO_Pattern"
        confidence = 0.71
    elif emotional_sensitivity >= 70 or mood_volatility >= 1.1:
        state_key = "Emotional_Sensitivity"
        confidence = 0.72
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
        "mental_state": definition["name"],
        "name": definition["name"],
        "description": definition["description"],
        "common_signs": definition["signs"],
        "recommended_exercises": definition["recommended_exercises"],
        "recommendations": definition["recommended_exercises"],
        "confidence": confidence,
    }
