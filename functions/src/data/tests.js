export const testsCatalog = [
  {
    key: "baseline",
    title: "Baseline Mental Wellness Assessment",
    category: "Onboarding",
    description:
      "Initial screening for stress, anxiety, mood stability, focus, emotional sensitivity, and social comfort.",
    scoringScale: "1 to 5 agreement scale",
    questions: [
      { id: "b1", text: "I feel tense even when nothing urgent is happening.", dimension: "stress" },
      { id: "b2", text: "My body feels physically tight during the day.", dimension: "stress" },
      { id: "b3", text: "Worry keeps repeating in my mind.", dimension: "anxiety" },
      { id: "b4", text: "Small uncertainties make me feel restless.", dimension: "anxiety" },
      {
        id: "b5",
        text: "My mood feels steady through normal daily ups and downs.",
        dimension: "mood_stability"
      },
      {
        id: "b6",
        text: "I recover emotionally after a difficult moment.",
        dimension: "mood_stability"
      },
      { id: "b7", text: "I can focus on one task without drifting away.", dimension: "focus" },
      { id: "b8", text: "It is easy for me to complete what I start.", dimension: "focus" },
      {
        id: "b9",
        text: "I get emotionally affected by comments or events for a long time.",
        dimension: "emotional_sensitivity"
      },
      {
        id: "b10",
        text: "I take criticism very personally.",
        dimension: "emotional_sensitivity"
      },
      {
        id: "b11",
        text: "I feel comfortable speaking honestly around other people.",
        dimension: "social_comfort"
      },
      {
        id: "b12",
        text: "Connecting with people feels natural to me.",
        dimension: "social_comfort"
      }
    ],
    interpretationGuide: [
      "Higher stress and anxiety suggest grounding routines and reduced cognitive overload.",
      "Higher focus and social comfort generally reflect steadier day-to-day functioning."
    ]
  },
  {
    key: "personality-insight",
    title: "Personality Insight Test",
    category: "Personality Test",
    description: "Reflects on openness, structure, and interpersonal style.",
    questions: [
      { id: "p1", text: "I enjoy trying unfamiliar approaches.", dimension: "openness" },
      { id: "p2", text: "I prefer a clear daily structure.", dimension: "structure" },
      { id: "p3", text: "I recharge through conversations.", dimension: "social_energy" },
      { id: "p4", text: "I make decisions using feelings first.", dimension: "emotional_processing" }
    ]
  },
  {
    key: "stress-check",
    title: "Stress Load Test",
    category: "Stress Test",
    description: "Measures current stress load and recovery capacity.",
    questions: [
      { id: "s1", text: "I feel mentally overloaded by responsibilities.", dimension: "stress" },
      { id: "s2", text: "I struggle to relax at the end of the day.", dimension: "stress" },
      { id: "s3", text: "Sleep feels restorative lately.", dimension: "recovery" },
      { id: "s4", text: "I feel emotionally drained after small tasks.", dimension: "fatigue" }
    ]
  },
  {
    key: "anxiety-check",
    title: "Anxiety Pattern Test",
    category: "Anxiety Test",
    description: "Surfaces worry intensity, uncertainty sensitivity, and rumination.",
    questions: [
      { id: "a1", text: "My mind jumps to worst-case outcomes.", dimension: "anxiety" },
      { id: "a2", text: "I replay conversations after they happen.", dimension: "rumination" },
      { id: "a3", text: "I feel uneasy when plans change.", dimension: "anxiety" },
      { id: "a4", text: "I need reassurance to settle my mind.", dimension: "dependence" }
    ]
  },
  {
    key: "emotional-intelligence",
    title: "Emotional Intelligence Test",
    category: "Emotional Intelligence Test",
    description: "Explores self-awareness, empathy, and regulation.",
    questions: [
      { id: "e1", text: "I can name what I am feeling clearly.", dimension: "self_awareness" },
      { id: "e2", text: "I notice emotional shifts in other people.", dimension: "empathy" },
      { id: "e3", text: "I pause before reacting strongly.", dimension: "regulation" },
      { id: "e4", text: "I can express needs without blaming others.", dimension: "communication" }
    ]
  },
  {
    key: "life-direction",
    title: "Life Direction Reflection Test",
    category: "Life Direction Test",
    description: "Reflects on purpose, self-definition, and future orientation.",
    questions: [
      { id: "l1", text: "I feel clear about what matters to me.", dimension: "clarity" },
      { id: "l2", text: "I often feel disconnected from who I want to become.", dimension: "identity_confusion" },
      { id: "l3", text: "My daily actions match my values.", dimension: "alignment" },
      { id: "l4", text: "I know what kind of growth I want next.", dimension: "direction" }
    ]
  }
];
