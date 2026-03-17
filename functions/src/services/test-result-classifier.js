const RESULT_LIBRARY = {
  personality_test: {
    "Reflective Thinker": {
      description: "You process experiences deeply and tend to learn through thoughtful reflection.",
      strengths: ["Insightful", "Thoughtful decision-making", "Values-driven"],
      suggestions: ["Balance reflection with action steps", "Schedule small experiments to test ideas"],
      recommended_exercises: ["journal_dump", "value_reflection", "gratitude_practice"]
    },
    "Analytical Mind": {
      description: "You prefer structured thinking and enjoy breaking problems into clear steps.",
      strengths: ["Logical reasoning", "Planning skills", "Clarity under pressure"],
      suggestions: ["Include emotional check-ins", "Practice flexible planning"],
      recommended_exercises: ["thought_reframing", "goal_breakdown", "breathing_reset"]
    },
    "Emotionally Sensitive": {
      description: "Emotions register strongly and can be highly influential in your day-to-day choices.",
      strengths: ["Empathy", "Emotional awareness", "Creativity"],
      suggestions: ["Add grounding pauses", "Name emotions before reacting"],
      recommended_exercises: ["emotion_labeling", "grounding_5_4_3_2_1", "breathing_reset"]
    },
    "Social Explorer": {
      description: "You gain energy from connection and feel motivated by shared experiences.",
      strengths: ["Social confidence", "Curiosity", "Collaboration"],
      suggestions: ["Protect recovery time", "Balance social time with solo recharge"],
      recommended_exercises: ["connection_check_in", "gratitude_practice", "boundary_planning"]
    },
    "Cautious Planner": {
      description: "You value structure and careful planning, preferring predictable paths.",
      strengths: ["Consistency", "Risk awareness", "Follow-through"],
      suggestions: ["Add small novelty", "Practice flexibility with low-stakes changes"],
      recommended_exercises: ["micro_experiments", "values_mapping", "breathing_reset"]
    }
  },
  stress_load_test: {
    "Balanced Stress Response": {
      description: "Stress levels feel manageable with healthy recovery routines.",
      strengths: ["Stable recovery habits", "Good self-monitoring"],
      suggestions: ["Keep restorative routines consistent", "Protect sleep windows"],
      recommended_exercises: ["sleep_wind_down", "gratitude_practice", "light_walk"]
    },
    "Stress Overload": {
      description: "Stress levels are running high and recovery feels limited right now.",
      strengths: ["Awareness of limits", "Motivation to reset"],
      suggestions: ["Reduce task load where possible", "Add short recovery breaks"],
      recommended_exercises: ["box_breathing", "grounding_5_4_3_2_1", "stress_release_walk"]
    },
    "Burnout Risk": {
      description: "Sustained stress and fatigue suggest a need for deeper recovery.",
      strengths: ["Recognizes strain", "Open to change"],
      suggestions: ["Prioritize rest and boundaries", "Reduce nonessential tasks"],
      recommended_exercises: ["sleep_wind_down", "boundary_planning", "micro_breaks"]
    },
    "Pressure Driven": {
      description: "You can push through pressure, but it may come at a recovery cost.",
      strengths: ["Persistence", "Drive"],
      suggestions: ["Schedule recovery time", "Check stress signals earlier"],
      recommended_exercises: ["breathing_reset", "stress_release_walk", "journaling_prompt"]
    },
    "Resilient Under Pressure": {
      description: "You hold steady under pressure and recover relatively well.",
      strengths: ["Resilience", "Adaptability"],
      suggestions: ["Maintain recovery habits", "Keep hydration and sleep stable"],
      recommended_exercises: ["breathing_reset", "gratitude_practice", "light_walk"]
    }
  },
  anxiety_pattern_test: {
    "Future Worrier": {
      description: "Worry tends to focus on future possibilities and what might go wrong.",
      strengths: ["Preparedness", "Risk awareness"],
      suggestions: ["Set worry windows", "Practice grounding in the present"],
      recommended_exercises: ["box_breathing", "thought_reframing", "grounding_5_4_3_2_1"]
    },
    "Social Overthinker": {
      description: "Anxiety shows up most around social situations and self-judgment.",
      strengths: ["Care for relationships", "Empathy"],
      suggestions: ["Limit replay loops", "Use brief self-compassion prompts"],
      recommended_exercises: ["self_compassion_reflection", "journaling_prompt", "grounding_5_4_3_2_1"]
    },
    "Situational Anxiety": {
      description: "Anxiety spikes around specific contexts rather than constantly.",
      strengths: ["Awareness of triggers", "Adaptability"],
      suggestions: ["Prepare for known triggers", "Use short breathing resets"],
      recommended_exercises: ["breathing_reset", "prep_checklist", "grounding_5_4_3_2_1"]
    },
    "Low Anxiety Pattern": {
      description: "Anxiety patterns are relatively low at this time.",
      strengths: ["Steady nervous system", "Stable routines"],
      suggestions: ["Maintain supportive habits", "Notice early signs if they change"],
      recommended_exercises: ["gratitude_practice", "light_journaling", "sleep_wind_down"]
    },
    "Cognitive Looping": {
      description: "Thoughts tend to loop or replay, making it hard to let go.",
      strengths: ["Depth of processing", "Attention to detail"],
      suggestions: ["Limit rumination time", "Use externalization prompts"],
      recommended_exercises: ["thought_reframing", "journal_dump", "box_breathing"]
    }
  },
  emotional_intelligence_test: {
    "Emotionally Aware": {
      description: "You recognize emotions clearly and can name them accurately.",
      strengths: ["Self-awareness", "Emotional clarity"],
      suggestions: ["Practice expressing needs", "Translate insights into actions"],
      recommended_exercises: ["emotion_labeling", "needs_mapping", "journaling_prompt"]
    },
    "Empathetic Listener": {
      description: "You notice others' emotions and tend to respond with empathy.",
      strengths: ["Empathy", "Connection skills"],
      suggestions: ["Balance empathy with boundaries", "Check in with your own needs"],
      recommended_exercises: ["boundary_planning", "self_compassion_reflection", "gratitude_practice"]
    },
    "Emotionally Reactive": {
      description: "Emotions can feel intense and harder to regulate in the moment.",
      strengths: ["Strong emotional range", "Authenticity"],
      suggestions: ["Add a pause before reacting", "Use grounding skills"],
      recommended_exercises: ["box_breathing", "grounding_5_4_3_2_1", "emotion_labeling"]
    },
    "Emotionally Balanced": {
      description: "You regulate emotions well and stay grounded through changes.",
      strengths: ["Stability", "Calm under pressure"],
      suggestions: ["Keep recovery habits consistent", "Share what works for you"],
      recommended_exercises: ["gratitude_practice", "sleep_wind_down", "light_walk"]
    },
    "Developing Awareness": {
      description: "You are building awareness of emotions and how they affect you.",
      strengths: ["Growth mindset", "Curiosity"],
      suggestions: ["Practice naming emotions daily", "Reflect on triggers"],
      recommended_exercises: ["emotion_labeling", "journaling_prompt", "breathing_reset"]
    }
  },
  life_direction_reflection_test: {
    "Clear Purpose Path": {
      description: "You feel clear about what matters and how to move forward.",
      strengths: ["Clarity", "Motivation"],
      suggestions: ["Turn clarity into small weekly actions", "Review progress monthly"],
      recommended_exercises: ["values_mapping", "goal_breakdown", "weekly_reflection"]
    },
    "Exploration Phase": {
      description: "You are exploring options and learning what fits.",
      strengths: ["Openness", "Willingness to explore"],
      suggestions: ["Try small experiments", "Track what energizes you"],
      recommended_exercises: ["micro_experiments", "values_mapping", "journaling_prompt"]
    },
    "Value Searching": {
      description: "You are clarifying values and what you want to prioritize.",
      strengths: ["Self-reflection", "Honesty"],
      suggestions: ["List top values", "Notice daily alignment"],
      recommended_exercises: ["value_reflection", "gratitude_practice", "journaling_prompt"]
    },
    "Direction Uncertain": {
      description: "Direction feels unclear right now and may need more exploration.",
      strengths: ["Curiosity", "Openness to change"],
      suggestions: ["Start with small next steps", "Seek supportive feedback"],
      recommended_exercises: ["values_mapping", "micro_experiments", "grounding_5_4_3_2_1"]
    },
    "Purpose Driven": {
      description: "Your actions align with a strong sense of purpose.",
      strengths: ["Alignment", "Focus"],
      suggestions: ["Protect your energy", "Celebrate progress"],
      recommended_exercises: ["weekly_reflection", "gratitude_practice", "sleep_wind_down"]
    }
  }
};

function pickScore(scores, key, fallback = 50) {
  const value = Number(scores?.[key]);
  return Number.isNaN(value) ? fallback : value;
}

export function classifyTestResult(testType, scores = {}) {
  let resultType = "Balanced Stress Response";

  switch (testType) {
    case "personality_test": {
      const openness = pickScore(scores, "openness");
      const structure = pickScore(scores, "structure");
      const social = pickScore(scores, "social_energy");
      const emotional = pickScore(scores, "emotional_processing");

      if (openness >= 70 && emotional >= 60) {
        resultType = "Reflective Thinker";
      } else if (social >= 70 && openness >= 60) {
        resultType = "Social Explorer";
      } else if (emotional >= 75) {
        resultType = "Emotionally Sensitive";
      } else if (structure >= 70 && openness < 55) {
        resultType = "Cautious Planner";
      } else {
        resultType = "Analytical Mind";
      }
      break;
    }
    case "stress_load_test": {
      const stress = pickScore(scores, "stress");
      const recovery = pickScore(scores, "recovery", 50);
      const fatigue = pickScore(scores, "fatigue", 50);

      if (stress >= 80 && fatigue >= 70 && recovery <= 40) {
        resultType = "Burnout Risk";
      } else if (stress >= 75 && fatigue >= 60) {
        resultType = "Stress Overload";
      } else if (stress >= 65 && recovery >= 60) {
        resultType = "Pressure Driven";
      } else if (stress >= 60 && recovery >= 70 && fatigue <= 45) {
        resultType = "Resilient Under Pressure";
      } else {
        resultType = "Balanced Stress Response";
      }
      break;
    }
    case "anxiety_pattern_test": {
      const anxiety = pickScore(scores, "anxiety");
      const rumination = pickScore(scores, "rumination", 50);
      const dependence = pickScore(scores, "dependence", 50);

      if (rumination >= 70) {
        resultType = "Cognitive Looping";
      } else if (anxiety >= 70 && rumination >= 50) {
        resultType = "Future Worrier";
      } else if (dependence >= 65 && anxiety >= 60) {
        resultType = "Social Overthinker";
      } else if (anxiety <= 45 && rumination <= 45) {
        resultType = "Low Anxiety Pattern";
      } else {
        resultType = "Situational Anxiety";
      }
      break;
    }
    case "emotional_intelligence_test": {
      const selfAwareness = pickScore(scores, "self_awareness");
      const empathy = pickScore(scores, "empathy");
      const regulation = pickScore(scores, "regulation");
      const communication = pickScore(scores, "communication");

      if (regulation >= 70 && selfAwareness >= 65 && empathy >= 60) {
        resultType = "Emotionally Balanced";
      } else if (empathy >= 75 && communication >= 60) {
        resultType = "Empathetic Listener";
      } else if (selfAwareness >= 70 && regulation >= 60) {
        resultType = "Emotionally Aware";
      } else if (regulation <= 40) {
        resultType = "Emotionally Reactive";
      } else {
        resultType = "Developing Awareness";
      }
      break;
    }
    case "life_direction_reflection_test": {
      const clarity = pickScore(scores, "clarity");
      const identity = pickScore(scores, "identity_confusion");
      const alignment = pickScore(scores, "alignment");
      const direction = pickScore(scores, "direction");

      if (clarity >= 70 && alignment >= 70 && direction >= 65 && identity <= 40) {
        resultType = "Clear Purpose Path";
      } else if (alignment >= 75 && direction >= 70) {
        resultType = "Purpose Driven";
      } else if (identity >= 70 || clarity <= 45 || direction <= 45) {
        resultType = "Direction Uncertain";
      } else if (alignment <= 55 && clarity <= 65) {
        resultType = "Value Searching";
      } else {
        resultType = "Exploration Phase";
      }
      break;
    }
    default:
      resultType = "Balanced Stress Response";
  }

  const library = RESULT_LIBRARY[testType] || RESULT_LIBRARY.stress_load_test;
  const payload = library[resultType] || library["Balanced Stress Response"];

  return {
    test_type: testType,
    result_type: resultType,
    description: payload.description,
    strengths: payload.strengths,
    suggestions: payload.suggestions,
    recommended_exercises: payload.recommended_exercises
  };
}

export function mapTestKeyToType(testKey) {
  const mapping = {
    "personality-insight": "personality_test",
    "stress-check": "stress_load_test",
    "anxiety-check": "anxiety_pattern_test",
    "emotional-intelligence": "emotional_intelligence_test",
    "life-direction": "life_direction_reflection_test"
  };

  return mapping[testKey] || "stress_load_test";
}
