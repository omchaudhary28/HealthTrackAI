export const seedExercises = [
  {
    key: "breathing_reset",
    title: "5 Minute Breathing Reset",
    category: "breathing",
    difficulty: "easy",
    durationMinutes: 5,
    purpose: "Lower nervous-system intensity when stress spikes quickly.",
    description: "Guided box-breathing practice to reduce immediate overwhelm and create a steadier starting point.",
    expectedOutcome: "A calmer body, slightly slower thoughts, and a more stable next decision.",
    benefits: ["reduces stress intensity", "supports focus recovery", "helps interrupt rumination"],
    instructions: [
      "Inhale for 4 seconds.",
      "Hold for 4 seconds.",
      "Exhale for 4 seconds.",
      "Pause for 4 seconds and repeat."
    ],
    tags: ["stress", "anxiety", "quick", "rumination"],
    bestForStates: ["Overthinker", "Stressed", "Emotionally overwhelmed"]
  },
  {
    key: "grounding_reset",
    title: "5-4-3-2-1 Grounding Reset",
    category: "breathing",
    difficulty: "easy",
    durationMinutes: 6,
    purpose: "Bring attention back to the present when thoughts feel scattered or intense.",
    description: "A sensory grounding routine that shifts attention from spiraling thoughts to the environment around you.",
    expectedOutcome: "More present-moment awareness and less emotional flooding.",
    benefits: ["settles emotional intensity", "supports regulation", "reduces mental spiraling"],
    instructions: [
      "Name 5 things you can see.",
      "Name 4 things you can feel.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell.",
      "Name 1 thing you can taste or appreciate."
    ],
    tags: ["stress", "anxiety", "grounding", "overwhelm"],
    bestForStates: ["Stressed", "Emotionally overwhelmed", "FOMO-driven"]
  },
  {
    key: "thought_reframing",
    title: "Thought Reframing Loop",
    category: "thought-reframing",
    difficulty: "medium",
    durationMinutes: 12,
    purpose: "Challenge repetitive mental loops with a more balanced interpretation.",
    description: "Externalize one recurring thought, test it, and replace it with something more grounded and workable.",
    expectedOutcome: "Less mental looping and a clearer next step.",
    benefits: ["reduces overthinking", "improves cognitive flexibility", "creates action clarity"],
    instructions: [
      "Write the thought exactly as it appears.",
      "List evidence for and against it.",
      "Rewrite it in a more grounded, specific way."
    ],
    tags: ["rumination", "overthinking", "anxiety", "clarity"],
    bestForStates: ["Overthinker", "FOMO-driven", "Stressed"]
  },
  {
    key: "gratitude_practice",
    title: "Evening Gratitude Journal",
    category: "journaling",
    difficulty: "easy",
    durationMinutes: 10,
    purpose: "Shift attention toward stabilizing moments when mood feels heavy or flat.",
    description: "Write three moments from the day that felt meaningful, comforting, or unexpectedly okay.",
    expectedOutcome: "Softer emotional tone and stronger awareness of what is still helping.",
    benefits: ["supports mood repair", "builds perspective", "strengthens positive recall"],
    instructions: [
      "List three moments from today.",
      "Describe why each mattered.",
      "Notice what these moments say about your needs and values."
    ],
    tags: ["mood", "reflection", "sleep", "gratitude"],
    bestForStates: ["Depressed", "Balanced", "FOMO-driven"]
  },
  {
    key: "journal_dump",
    title: "Mind Unload Journal",
    category: "journaling",
    difficulty: "easy",
    durationMinutes: 8,
    purpose: "Reduce thought pressure by moving noisy mental loops onto paper.",
    description: "A fast journaling prompt for unloading repeated thoughts before they build more momentum.",
    expectedOutcome: "Less mental clutter and more breathing room.",
    benefits: ["clears mental load", "supports sleep", "helps spot recurring patterns"],
    instructions: [
      "Set a timer for 8 minutes.",
      "Write everything running through your mind without editing.",
      "Circle one thought that needs action and cross out what can wait."
    ],
    tags: ["overthinking", "sleep", "stress", "clarity"],
    bestForStates: ["Overthinker", "Stressed", "Depressed"]
  },
  {
    key: "stress_release_walk",
    title: "Gentle Walk and Observe",
    category: "stress-release",
    difficulty: "easy",
    durationMinutes: 15,
    purpose: "Release nervous energy and re-engage attention through movement.",
    description: "A short sensory walk that helps discharge stress while giving your mind a simpler task.",
    expectedOutcome: "Less physical tension and slightly better focus.",
    benefits: ["reduces activation", "supports energy regulation", "restores focus"],
    instructions: [
      "Walk without music for 15 minutes.",
      "Notice five things you see and three things you hear.",
      "Finish by rating your stress before and after."
    ],
    tags: ["energy", "stress", "focus", "movement"],
    bestForStates: ["Stressed", "Emotionally overwhelmed", "Balanced"]
  },
  {
    key: "sleep_wind_down",
    title: "Sleep Wind-Down Checklist",
    category: "sleep-improvement",
    difficulty: "easy",
    durationMinutes: 20,
    purpose: "Lower stimulation before sleep when stress and scrolling keep the mind active.",
    description: "A repeatable pre-sleep routine that lowers stimulation and helps signal that the day is ending.",
    expectedOutcome: "An easier transition into rest and better recovery quality.",
    benefits: ["supports sleep consistency", "reduces nighttime stress", "improves recovery"],
    instructions: [
      "Dim bright lights.",
      "Put the phone away for 20 minutes.",
      "Write tomorrow's top priority on paper.",
      "Do one minute of slow breathing."
    ],
    tags: ["sleep", "stress", "recovery", "routine"],
    bestForStates: ["Depressed", "Stressed", "Balanced"]
  },
  {
    key: "self_compassion_reflection",
    title: "Self-Compassion Reflection",
    category: "self-reflection",
    difficulty: "medium",
    durationMinutes: 8,
    purpose: "Soften harsh self-talk when emotions feel heavy or self-blame is increasing.",
    description: "Respond to self-criticism with a more humane internal voice without pretending everything is fine.",
    expectedOutcome: "A gentler inner tone and less emotional exhaustion.",
    benefits: ["reduces self-criticism", "supports emotional recovery", "improves self-awareness"],
    instructions: [
      "Write the critical sentence you heard internally.",
      "Imagine saying it to a close friend.",
      "Rewrite it with honesty and compassion."
    ],
    tags: ["self-criticism", "mood", "journaling", "emotional recovery"],
    bestForStates: ["Depressed", "Emotionally overwhelmed", "FOMO-driven"]
  },
  {
    key: "values_reflection",
    title: "Values Reflection Check-In",
    category: "self-reflection",
    difficulty: "medium",
    durationMinutes: 10,
    purpose: "Reduce comparison and drift by reconnecting with what matters to you directly.",
    description: "A short reflection that helps separate your priorities from pressure, comparison, and urgency.",
    expectedOutcome: "Better alignment and less reactive decision-making.",
    benefits: ["reduces comparison loops", "improves direction", "supports intentional habits"],
    instructions: [
      "Write one thing pulling your attention today.",
      "Name the value you want to act from instead.",
      "Choose one small action that matches that value."
    ],
    tags: ["fomo", "direction", "reflection", "values"],
    bestForStates: ["FOMO-driven", "Overthinker", "Balanced"]
  }
];
