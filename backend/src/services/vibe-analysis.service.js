import OpenAI from "openai";
import { env } from "../config/env.js";

let openaiClient = null;

function getOpenAiClient() {
  if (!env.openAiApiKey || env.openAiApiKey === "your_openai_api_key_here") {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }
  return openaiClient;
}

// Crisis / Immediate Safety Guardrail
const CRISIS_PATTERNS = [
  /\b(kill myself|end my life|want to die|suicide|suicidal|harming myself|self[- ]harm|don't want to live|no reason to live)\b/i
];

export function checkSafetyAndCrisis(text = "") {
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isCrisis: true,
        message:
          "It sounds like you are carrying profound pain right now. MindTrack AI is a space for gentle personal reflection, but we want to make sure you are safe and supported by people who can be with you right now.",
        resources: [
          "988 Suicide & Crisis Lifeline: Call or text 988 (Available 24/7, free and confidential in US & Canada)",
          "Crisis Text Line: Text HOME to 741741 (Free, 24/7 text support)",
          "International Resources: Visit https://findahelpline.com to connect with free, local confidential support in your country."
        ]
      };
    }
  }
  return { isCrisis: false, message: "", resources: [] };
}

/**
 * Intelligent context-aware rule-based fallback generator
 * Used when external AI service is unreachable, timed out, or unconfigured.
 */
export function generateLocalReadVibe(content = "", recentMood = "neutral", historyEntries = []) {
  const text = content.trim();
  const lower = text.toLowerCase();
  const safety = checkSafetyAndCrisis(text);

  if (safety.isCrisis) {
    return {
      whatIHear: "I hear that you are going through an overwhelming amount of hurt and weight right now.",
      rootConcerns: [
        {
          concern: "Intense emotional pain & feeling unsafe",
          explanation: "Your writing conveys a level of distress where personal reflection alone is not enough and immediate care is paramount."
        }
      ],
      emotionalThemes: [
        { emotion: "Overwhelmed", context: "A feeling of deep distress and exhausted coping resources" }
      ],
      maintainingCycle: {
        steps: ["Isolating with heavy thoughts", "Feeling like no one can help", "Exhaustion deepening"],
        summary: "When pain reaches this point, our mind often tricks us into pulling away from the very human connection that can relieve the pressure."
      },
      nextMoves: [
        {
          title: "Reach out to immediate support",
          whyItHelps: "You do not have to carry this alone in silence.",
          smallStart: "Call or text 988, or reach out to a trusted loved one right now.",
          timeEstimate: "Immediate",
          completed: false
        }
      ],
      reflectionQuestion: "Who is one person or trusted resource you can let into this moment with you right now?",
      gentleClosing: "Please stay safe. There is help, and your life and safety matter.",
      historicalContext: { recurringThemes: [], note: "" },
      safetyNotice: safety,
      provider: "local-safety"
    };
  }

  // Detect thematic markers
  const isComparison = /compar(e|ing|ison)|behind|everyone else|peers|classmates|colleagues|imposter|not good enough/i.test(lower);
  const isOverwork = /work(ed|ing)? hard|exhaust(ed|ion)|burnout|deadlines?|overwhelm|too much|drained|tired|hours/i.test(lower);
  const isRelationship = /argument|fight|disagree|friend|partner|boss|they said|ignoring|misunderstood|conflict|relationship/i.test(lower);
  const isDecisionFriction = /can't decide|stuck|uncertain|don't know what to do|choice|crossroads|overthink(ing)?/i.test(lower);
  const isSleepIssue = /sleep|insomnia|wake|bed|restless|can't turn my brain off/i.test(lower);
  const isPositive = /grateful|happy|proud|accomplish|peaceful|good day|relieved|excited|progress/i.test(lower);

  // 1. What I Hear
  let whatIHear = "";
  if (isComparison) {
    whatIHear = "It sounds like you're putting in earnest effort, but seeing where others are makes your own progress feel smaller or slower than it truly is.";
  } else if (isOverwork && isSleepIssue) {
    whatIHear = "It sounds like your mind and body are running on empty, but the momentum of your responsibilities makes it difficult to fully power down and rest.";
  } else if (isOverwork) {
    whatIHear = "It sounds like you've been pouring a lot of your energy into what needs to get done, and the sheer volume of demands is starting to take an emotional toll.";
  } else if (isRelationship) {
    whatIHear = "It sounds like this interaction left an uncomfortable residue, leaving you replaying what happened and feeling uncertain about where things stand.";
  } else if (isDecisionFriction) {
    whatIHear = "It sounds like having to make this choice is pulling you in different directions, and fear of making the wrong move is keeping you stuck in analysis.";
  } else if (isPositive) {
    whatIHear = "It sounds like you experienced moments of genuine connection, relief, or accomplishment today, and you're taking time to anchor into that good feeling.";
  } else {
    whatIHear = "It sounds like there's a lot on your mind right now, and writing this down is your way of untangling the thoughts before they pile up further.";
  }

  // 2. Possible Root Concerns
  const rootConcerns = [];
  if (isComparison) {
    rootConcerns.push({
      concern: "Fear of falling behind",
      explanation: "One possibility is that seeing others hit milestones activates a worry that your own timeline is inadequate, even when you're working steadily."
    });
    rootConcerns.push({
      concern: "External validation as the primary metric",
      explanation: "This may be connected to measuring your daily worth against visible external benchmarks rather than your personal baseline."
    });
  } else if (isOverwork) {
    rootConcerns.push({
      concern: "Boundary friction with productivity",
      explanation: "One possibility is a belief that taking a break needs to be 'earned' through exhaustion, making rest feel uncomfortable."
    });
    rootConcerns.push({
      concern: "Pressure to meet perceived expectations",
      explanation: "This might stem from an unstated worry that slowing down will let someone down or compromise what you've built."
    });
  } else if (isRelationship) {
    rootConcerns.push({
      concern: "Need for emotional safety & understanding",
      explanation: "One possibility is that feeling unheard or judged created tension between wanting harmony and wanting your perspective respected."
    });
    rootConcerns.push({
      concern: "Uncertainty about unstated motives",
      explanation: "This may be connected to filling in the blanks of what the other person is thinking, which often amplifies worry."
    });
  } else if (isDecisionFriction) {
    rootConcerns.push({
      concern: "Desire for certainty before taking action",
      explanation: "One possibility is hoping for a guaranteed outcome before committing, which can freeze forward movement."
    });
  } else {
    rootConcerns.push({
      concern: "Mental load & processing space",
      explanation: "One possibility is that several unresolved threads are competing for your attention simultaneously."
    });
  }

  // 3. Emotional Themes
  const emotionalThemes = [];
  if (isComparison) {
    emotionalThemes.push({ emotion: "Self-Doubt", context: "Questioning whether your efforts are truly moving the needle" });
    emotionalThemes.push({ emotion: "Urgency", context: "A restless pressure to accelerate or catch up" });
  } else if (isOverwork) {
    emotionalThemes.push({ emotion: "Depletion", context: "Mental and physical stamina feeling stretched thin" });
    emotionalThemes.push({ emotion: "Duty or Obligation", context: "Continuing forward despite clear signals of fatigue" });
  } else if (isRelationship) {
    emotionalThemes.push({ emotion: "Frustration", context: "Wishing communication had gone differently" });
    emotionalThemes.push({ emotion: "Vulnerability", context: "Uncertainty about how you are perceived by someone who matters" });
  } else if (isPositive) {
    emotionalThemes.push({ emotion: "Quiet Satisfaction", context: "Appreciating a win or grounded moment" });
    emotionalThemes.push({ emotion: "Relief", context: "Letting go of tension after a stretch of effort" });
  } else {
    emotionalThemes.push({ emotion: "Mixed Feelings", context: "Balancing multiple overlapping thoughts and responsibilities" });
  }

  // 4. Maintaining Cycle
  let maintainingCycle = null;
  if (isComparison) {
    maintainingCycle = {
      steps: [
        "Spot other people's highlights",
        "Contrast with your behind-the-scenes effort",
        "Feel sudden urgency & self-criticism",
        "Work in a rushed state or hesitate",
        "Re-check what others are doing for reassurance"
      ],
      summary: "Comparison frequently creates a loop where checking others' progress temporarily spikes urgency, but drains the grounded energy needed for your own craft."
    };
  } else if (isOverwork) {
    maintainingCycle = {
      steps: [
        "Overload schedule with tasks",
        "Push through warning signs of fatigue",
        "Efficiency dips due to depletion",
        "Tasks take longer to complete",
        "Feel compelled to work even later"
      ],
      summary: "Postponing recovery usually prolongs the time each task takes, making rest seem even less accessible."
    };
  } else if (isDecisionFriction) {
    maintainingCycle = {
      steps: [
        "Face a choice with unknowns",
        "Analyze every potential flaw",
        "Postpone making the call",
        "Pressure grows as time passes",
        "Analyze even more intensely"
      ],
      summary: "Treating every detail as critical can lead to decision fatigue, where delaying feels protective but prolongs tension."
    };
  }

  // 5. Your Next Move
  const nextMoves = [];
  if (isComparison) {
    nextMoves.push({
      title: "Name your own current milestone",
      whyItHelps: "Refocusing attention on your own timeline breaks the comparison reflex.",
      smallStart: "Write down the single task you are building or learning this week, and ignore everything else for today.",
      timeEstimate: "5 mins",
      completed: false
    });
    nextMoves.push({
      title: "Log off public progress feeds for the evening",
      whyItHelps: "Removes the stimulus that triggers comparison loops before bedtime.",
      smallStart: "Put your phone in another room or set a focus timer for the rest of tonight.",
      timeEstimate: "2 mins",
      completed: false
    });
  } else if (isOverwork) {
    nextMoves.push({
      title: "Define an official stopping point for today",
      whyItHelps: "Gives your nervous system permission to transition from performance to recovery.",
      smallStart: "Choose one task to finish, then close the laptop/notebook completely.",
      timeEstimate: "5 mins",
      completed: false
    });
    nextMoves.push({
      title: "Do a 5-minute physical reset",
      whyItHelps: "Breaks the physical posture of tension accumulated from long desk or mental work.",
      smallStart: "Step away from screens, drink a tall glass of water, and stretch your shoulders.",
      timeEstimate: "5 mins",
      completed: false
    });
  } else {
    nextMoves.push({
      title: "Identify what is directly within your control",
      whyItHelps: "Separates what you can influence right now from what you can only worry about.",
      smallStart: "Draw two columns on a sticky note: 'My move today' vs 'Things that will take time.'",
      timeEstimate: "5 mins",
      completed: false
    });
    nextMoves.push({
      title: "Choose one low-friction next step",
      whyItHelps: "Action reduces anxiety much faster than further deliberation.",
      smallStart: "Pick the smallest 10-minute task that moves this forward and complete it without aiming for perfection.",
      timeEstimate: "10 mins",
      completed: false
    });
  }

  // 6. Reflection Question
  let reflectionQuestion = "";
  if (isComparison) {
    reflectionQuestion = "If you had no visibility into what anyone else was building or achieving, what would feel like meaningful progress to you this week?";
  } else if (isOverwork) {
    reflectionQuestion = "What is one thing on your to-do list that feels urgent, but could realistically wait until tomorrow without any true harm?";
  } else if (isRelationship) {
    reflectionQuestion = "Is the outcome you're worried about something the other person directly confirmed, or something you are predicting they might think?";
  } else if (isDecisionFriction) {
    reflectionQuestion = "What would you choose if you trusted that a reversible 'good enough' decision is better than no decision at all?";
  } else {
    reflectionQuestion = "Looking at what you wrote, what is the single most important thing you need for yourself right now?";
  }

  // 7. Gentle Closing
  const gentleClosing = isPositive
    ? "Celebrate the good rhythm today. Even small moments of calm and clarity are genuine evidence of growth."
    : "You're dealing with real things, and it makes sense that you felt this way. Take things one grounded step at a time today.";

  // 8. Recurring themes from user history
  const recurringThemes = [];
  if (Array.isArray(historyEntries) && historyEntries.length >= 2) {
    let compCount = 0;
    let workCount = 0;
    let dates = [];

    historyEntries.slice(0, 10).forEach((entry) => {
      const c = (entry.content || "").toLowerCase();
      const dateStr = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
      if (/compar|behind|peers/i.test(c)) {
        compCount++;
        if (dateStr) dates.push(dateStr);
      }
      if (/work|exhaust|deadline/i.test(c)) {
        workCount++;
      }
    });

    if (compCount >= 2 && isComparison) {
      recurringThemes.push({
        theme: "Self-comparison during high-effort stretches",
        observation: "You have noticed feelings of falling behind in multiple reflections when working intensely.",
        datesOrParaphrase: `Mentioned in earlier entries (e.g. ${dates.slice(0, 2).join(", ")}) and reflected again today.`
      });
    } else if (workCount >= 3) {
      recurringThemes.push({
        theme: "Sustained high demand and recovery friction",
        observation: "Workload and energy depletion have appeared regularly across recent check-ins.",
        datesOrParaphrase: "A recurring pattern of pushing through fatigue rather than pausing earlier."
      });
    }
  }

  return {
    whatIHear,
    rootConcerns,
    emotionalThemes,
    maintainingCycle,
    nextMoves,
    reflectionQuestion,
    gentleClosing,
    historicalContext: {
      recurringThemes,
      note: recurringThemes.length ? "Patterns observed across your journal history. You can adjust or dismiss any observation." : ""
    },
    safetyNotice: safety,
    provider: "local-intelligence"
  };
}

/**
 * Main AI-powered Read Vibe analyzer
 * Calls OpenAI if configured; falls back gracefully to local intelligence.
 */
export async function analyzeJournalVibe(content = "", recentMood = "neutral", historyEntries = [], allowHistorical = true) {
  const safety = checkSafetyAndCrisis(content);
  if (safety.isCrisis) {
    return generateLocalReadVibe(content, recentMood, []);
  }

  const client = getOpenAiClient();
  if (!client) {
    return generateLocalReadVibe(content, recentMood, allowHistorical ? historyEntries : []);
  }

  const historyContextText = allowHistorical && Array.isArray(historyEntries) && historyEntries.length
    ? historyEntries
        .slice(0, 5)
        .map((e, idx) => `[Entry ${idx + 1} on ${new Date(e.createdAt || Date.now()).toLocaleDateString()}]: "${(e.content || "").slice(0, 180)}"`)
        .join("\n")
    : "No prior history provided.";

  const systemPrompt = `You are MindTrack AI, a thoughtful, compassionate, intelligent reflection companion.
Your purpose is to help a person reflect deeply on their journal entry and discover practical, grounded next steps.

CRITICAL RULES:
1. NEVER diagnose mental illnesses or assign psychiatric labels (no clinical terminology).
2. Distinguish explicit statements from uncertain interpretations. Use phrases like "One possibility is...", "This may be connected to...".
3. Avoid generic motivational fluff, toxic positivity, or patronizing reassurances.
4. Offer 2 or 3 manageable, concrete actions in 'nextMoves' with time estimates and a small way to start today.
5. If historical entries are provided, note genuine recurring themes ONLY if backed by evidence. If not supported, leave 'recurringThemes' empty.
6. Return ONLY valid JSON adhering strictly to the schema provided.

Output JSON format:
{
  "whatIHear": "Clear, natural language explanation of what the user is experiencing",
  "rootConcerns": [
    { "concern": "Title of plausible root concern", "explanation": "Brief rationale phrased as a possibility" }
  ],
  "emotionalThemes": [
    { "emotion": "Emotion name", "context": "Brief context from their words" }
  ],
  "maintainingCycle": {
    "steps": ["Step 1", "Step 2", "Step 3"],
    "summary": "Brief explanation of how the loop may sustain itself"
  },
  "nextMoves": [
    {
      "title": "Clear action title",
      "whyItHelps": "Why this specifically addresses their concern",
      "smallStart": "One small way to start today",
      "timeEstimate": "e.g. 5 mins",
      "completed": false
    }
  ],
  "reflectionQuestion": "One thoughtful, context-specific follow-up question directly addressing their situation",
  "gentleClosing": "Short, grounded, supportive statement",
  "recurringThemes": [
    { "theme": "Theme title", "observation": "Observation", "datesOrParaphrase": "Evidence" }
  ]
}`;

  try {
    const userPrompt = `USER JOURNAL ENTRY:\n"${content}"\n\nRECENT MOOD: ${recentMood}\n\nPRIOR JOURNAL CONTEXT:\n${historyContextText}`;

    const completion = await client.chat.completions.create({
      model: env.openAiModel || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    if (!parsed.whatIHear || !Array.isArray(parsed.rootConcerns)) {
      throw new Error("Incomplete JSON response from model");
    }

    return {
      whatIHear: parsed.whatIHear,
      rootConcerns: parsed.rootConcerns || [],
      emotionalThemes: parsed.emotionalThemes || [],
      maintainingCycle: parsed.maintainingCycle || null,
      nextMoves: (parsed.nextMoves || []).map((m) => ({ ...m, completed: false })),
      reflectionQuestion: parsed.reflectionQuestion || "What is one thing that would feel kind or helpful for you today?",
      gentleClosing: parsed.gentleClosing || "Take things one steady step at a time.",
      historicalContext: {
        recurringThemes: parsed.recurringThemes || [],
        note: (parsed.recurringThemes || []).length ? "Patterns observed across your journal history." : ""
      },
      safetyNotice: { isCrisis: false, message: "", resources: [] },
      provider: "openai"
    };
  } catch (err) {
    console.warn("[MindTrack] OpenAI vibe analysis fallback invoked:", err?.message);
    return generateLocalReadVibe(content, recentMood, allowHistorical ? historyEntries : []);
  }
}

/**
 * Multi-turn follow-up reflection conversation
 */
export async function generateFollowUpTurn(entryContent = "", previousAnalysis = null, followUpHistory = [], userMessage = "") {
  const safety = checkSafetyAndCrisis(userMessage);
  if (safety.isCrisis) {
    return {
      reply: safety.message + "\n\n" + safety.resources.join("\n"),
      provider: "safety-guardrail"
    };
  }

  const client = getOpenAiClient();
  if (!client) {
    // Local contextual conversational reply
    const lower = userMessage.toLowerCase();
    let reply = "";
    if (/internship|job|career|hiring|recruit/i.test(lower)) {
      reply = "That makes the concern much more specific. It sounds like this isn't just about general progress, but about concrete career security. A practical next move here is to pick one specific role description, identify one real skill to build, and set a low-pressure application goal rather than comparing yourself to people who are already on the other side of that milestone.";
    } else if (/alone|no one|isolated/i.test(lower)) {
      reply = "Hearing that you feel so on your own with this adds significant weight to the problem. When we don't share our struggles, they echo louder in our heads. Could you share even 10% of this with someone you feel relatively safe with?";
    } else if (/fail|mess(ed)? up|wrong/i.test(lower)) {
      reply = "It makes sense that making a mistake feels high-stakes right now. But a setback in one instance doesn't define your entire trajectory. What would a compassionate response to yourself look like if a good friend made the exact same mistake?";
    } else {
      reply = `Thank you for sharing that extra context. Clarifying that gives us a much clearer picture. Looking at what you just said alongside your original reflection, let's keep the focus on what is within your hands today: what is one small, low-friction action that feels doable before you sleep?`;
    }

    return {
      reply,
      provider: "local-intelligence"
    };
  }

  const historyMessages = (followUpHistory || []).map((h) => ({
    role: h.role,
    content: h.content
  }));

  const systemPrompt = `You are MindTrack AI, a thoughtful reflection companion.
The user previously wrote a journal entry and received a structured reflection analysis.
You asked a follow-up question: "${previousAnalysis?.reflectionQuestion || ""}".
The user has responded with additional thoughts.

RULES:
1. Do NOT repeat the entire initial analysis.
2. Demonstrate real contextual problem-solving based on their new reply.
3. Keep the tone warm, grounded, humble, and practical (2–3 short paragraphs maximum).
4. Suggest one refined, manageable adjustment to their next move.
5. No psychiatric diagnoses or clinical labeling.`;

  try {
    const completion = await client.chat.completions.create({
      model: env.openAiModel || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Original entry: "${entryContent.slice(0, 500)}"` },
        ...historyMessages,
        { role: "user", content: userMessage.trim() }
      ],
      temperature: 0.7,
      max_tokens: 450
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "Thank you for sharing that context. Take things one small step at a time today.";
    return {
      reply,
      provider: "openai"
    };
  } catch (err) {
    console.warn("[MindTrack] Follow-up turn fallback invoked:", err?.message);
    return {
      reply: "Thank you for reflecting further on that. Clarifying this brings more specificity to the issue. Focus on what is directly within your control for the rest of today, and let the rest settle.",
      provider: "local-fallback"
    };
  }
}

/**
 * Extracts recurring patterns and themes across past journal entries
 */
export function extractRecurringThemesFromHistory(historyEntries = []) {
  if (!Array.isArray(historyEntries) || historyEntries.length < 2) {
    return [];
  }

  const themes = [];
  const compDates = [];
  const fatigueDates = [];
  const uncertaintyDates = [];
  const criticDates = [];
  const boundaryDates = [];

  for (const entry of historyEntries) {
    const text = (entry.content || "").toLowerCase();
    const dateStr = entry.createdAt
      ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";

    if (/compar|behind|peer|classmate|colleague|everyone else|falling behind/i.test(text)) {
      if (dateStr && !compDates.includes(dateStr)) compDates.push(dateStr);
    }
    if (/burnout|exhaust|drained|tired|fatigue|overwork|no break/i.test(text)) {
      if (dateStr && !fatigueDates.includes(dateStr)) fatigueDates.push(dateStr);
    }
    if (/future|what if|uncertain|anxious|worry|doubt|stuck/i.test(text)) {
      if (dateStr && !uncertaintyDates.includes(dateStr)) uncertaintyDates.push(dateStr);
    }
    if (/not enough|mess(ed)? up|failure|disappointed in myself|hate that i/i.test(text)) {
      if (dateStr && !criticDates.includes(dateStr)) criticDates.push(dateStr);
    }
    if (/people[- ]pleas|saying yes|boundary|boundaries|overwhelm/i.test(text)) {
      if (dateStr && !boundaryDates.includes(dateStr)) boundaryDates.push(dateStr);
    }
  }

  if (compDates.length >= 2) {
    themes.push({
      theme: "Self-Comparison Under Pressure",
      observation: "You tend to measure your progress against others when tackling demanding projects.",
      datesOrParaphrase: `Appeared across entries from ${compDates.slice(0, 3).join(", ")}.`
    });
  }
  if (fatigueDates.length >= 2) {
    themes.push({
      theme: "Boundary & Energy Depletion",
      observation: "Entries show a pattern of pushing through fatigue rather than inserting micro-rests early.",
      datesOrParaphrase: `Noted in entries from ${fatigueDates.slice(0, 3).join(", ")}.`
    });
  }
  if (uncertaintyDates.length >= 2) {
    themes.push({
      theme: "Future Uncertainty Loops",
      observation: "Worry about future outcomes frequently occupies cognitive space during reflection.",
      datesOrParaphrase: `Observed across check-ins on ${uncertaintyDates.slice(0, 3).join(", ")}.`
    });
  }
  if (criticDates.length >= 2) {
    themes.push({
      theme: "High Self-Demands & Harsh Standards",
      observation: "Self-evaluations lean harshly critical even when effort has been steady.",
      datesOrParaphrase: `Reflected in entries from ${criticDates.slice(0, 3).join(", ")}.`
    });
  }
  if (boundaryDates.length >= 2) {
    themes.push({
      theme: "Over-Commitment & Boundary Friction",
      observation: "Difficulty declining requests or setting clear limits before exhaustion sets in.",
      datesOrParaphrase: `Identified on ${boundaryDates.slice(0, 3).join(", ")}.`
    });
  }

  return themes;
}

