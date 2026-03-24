from typing import Dict, List, Optional


def build_recommendations(metrics: Dict[str, float], mental_state: Optional[str] = None) -> Dict[str, object]:
    activities: List[str] = []
    rationale_parts: List[str] = []

    stress = metrics.get("stress", 50.0)
    anxiety = metrics.get("anxiety", 50.0)
    focus = metrics.get("focus", 50.0)
    mood_stability = metrics.get("mood_stability", 50.0)

    if stress >= 70:
        activities.extend(["Meditation", "Breathing exercises", "Stress release walk"])
        rationale_parts.append("stress is elevated")

    if anxiety >= 60:
        activities.extend(["Thought reframing", "Journaling", "Grounding prompts"])
        rationale_parts.append("anxiety and cognitive load are elevated")

    if focus <= 45:
        activities.extend(["Pomodoro focus reset", "Breathing exercises"])
        rationale_parts.append("focus looks depleted")

    if mood_stability <= 45:
        activities.extend(["Gratitude exercise", "Self-compassion reflection"])
        rationale_parts.append("mood stability appears lower than usual")

    if mental_state == "Overthinker":
        activities.extend(["Thought reframing", "Mind unload journal", "Breathing reset"])
    elif mental_state == "Stressed":
        activities.extend(["Breathing reset", "Grounding prompts", "Stress release walk"])
    elif mental_state == "Depressed":
        activities.extend(["Self-compassion reflection", "Gratitude exercise", "Mind unload journal"])
    elif mental_state == "FOMO-driven":
        activities.extend(["Values reflection", "Digital detox", "Gratitude exercise"])
    elif mental_state == "Emotionally overwhelmed":
        activities.extend(["Grounding prompts", "Breathing reset", "Self-compassion"])

    deduped = list(dict.fromkeys(activities))[:6]
    rationale = (
        f"Suggested because {'; '.join(rationale_parts)}."
        if rationale_parts
        else "Suggested as a general wellness maintenance set."
    )

    return {"activities": deduped, "rationale": rationale}
