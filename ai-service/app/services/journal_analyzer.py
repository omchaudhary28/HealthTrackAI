from typing import Dict, List


PATTERN_RULES = {
    "rumination": ["again", "replay", "over and over", "can't stop thinking", "stuck"],
    "self-criticism": ["my fault", "i'm useless", "i failed", "not good enough", "ashamed"],
    "negative thinking": ["hopeless", "pointless", "nothing works", "worst", "tired of this"],
    "isolation": ["alone", "nobody gets it", "withdraw", "don't want to talk"],
}


def analyze_journal(text: str, recent_mood: str | None = None) -> Dict[str, object]:
    lowered = text.lower()
    detected_patterns: List[str] = []

    for pattern, triggers in PATTERN_RULES.items():
        if any(trigger in lowered for trigger in triggers):
            detected_patterns.append(pattern)

    tone = recent_mood or ("heavy" if detected_patterns else "reflective")

    suggestions = [
        "Name one feeling and one need underneath it.",
        "Write one kinder sentence you could tell yourself tonight.",
    ]

    if "rumination" in detected_patterns:
        suggestions.append("Set a two-minute timer and write the thought once instead of replaying it.")
    if "self-criticism" in detected_patterns:
        suggestions.append("Ask whether you would speak this way to someone you care about.")
    if "negative thinking" in detected_patterns:
        suggestions.append("List one piece of evidence that the situation is not permanent.")
    if "isolation" in detected_patterns:
        suggestions.append("Consider one low-pressure connection you could make this week.")

    return {
        "patterns": detected_patterns or ["reflection"],
        "tone": tone,
        "suggestions": suggestions[:5],
    }
