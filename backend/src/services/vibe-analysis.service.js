import OpenAI from "openai";
import { env } from "../config/env.js";

let openaiClient = null;

function getOpenAiClient() {
  if (!env.openAiApiKey || env.openAiApiKey === "your_openai_api_key_here" || env.openAiApiKey === "sk-your-real-key") {
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
 * Context-aware intelligent reflection engine
 * Dynamically adapts to positive, anxious, sad, angry, exhausted, unmotivated,
 * comparison, relationship, decision, or everyday reflection inputs.
 */
export function generateLocalReadVibe(content = "", recentMood = "neutral", historyEntries = []) {
  const text = (content || "").trim();
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

  // Sentiment and thematic detectors
  const isPositive = /\b(happy|joy|grateful|gratitude|proud|accomplish|peaceful|content|relieved|excited|progress|good day|feeling good|great day|smile|wonderful|blessed|delighted|serene|cheerful|loved)\b/i.test(lower);
  const isSadness = /\b(sad|crying|tears|lonely|alone|miss (them|him|her)|grief|heartbroken|empty|down|depressed|unloved|hurting|grieving|lost|gloomy)\b/i.test(lower);
  const isAnxiety = /\b(anxious|anxiety|nervous|scared|fear|panic|heart racing|dread|worried|worrying|what if|freaking out|paralyzed|terrified|shaking)\b/i.test(lower);
  const isAnger = /\b(angry|furious|mad|pissed|annoyed|frustrated|unfair|resent|hate|irritated|bitter|injustice|rude|disrespect)\b/i.test(lower);
  const isComparison = /\b(compar(e|ing|ison)|behind|everyone else|peers|classmates|colleagues|imposter|not good enough|portfolio|internship|lagging)\b/i.test(lower);
  const isOverwork = /\b(work(ed|ing)? hard|exhaust(ed|ion)|burnout|deadlines?|overwhelm|too much|drained|tired|hours|overtime)\b/i.test(lower);
  const isLowMotivation = /\b(lazy|can't do anything|unmotivated|procrastinat|stuck in bed|bored|no energy|don't care|apathy|sluggish|slump)\b/i.test(lower);
  const isRelationship = /\b(argument|fight|disagree|friend|partner|boss|they said|ignoring|misunderstood|conflict|relationship|boyfriend|girlfriend|spouse)\b/i.test(lower);
  const isDecisionFriction = /\b(can't decide|stuck|uncertain|don't know what to do|choice|crossroads|overthink(ing)?|doubt)\b/i.test(lower);
  const isSleepIssue = /\b(sleep|insomnia|wake|bed|restless|can't turn my brain off|nightmare|awake)\b/i.test(lower);

  // 1. What I Hear
  let whatIHear = "";
  if (isPositive) {
    whatIHear = "It sounds like today brought a genuine sense of happiness, ease, and lightness, and you're pausing to acknowledge and enjoy that good feeling.";
  } else if (isSadness) {
    whatIHear = "It sounds like you're carrying a deep sense of sadness or emotional heaviness right now, and finding the words to express it is an act of real honesty.";
  } else if (isAnxiety) {
    whatIHear = "It sounds like anxiety has kicked your internal alarm system into overdrive, making future unknowns feel like immediate, looming pressures.";
  } else if (isAnger) {
    whatIHear = "It sounds like a boundary was crossed or something felt deeply unfair, and your frustration is a clear signal that your values were compromised.";
  } else if (isComparison) {
    whatIHear = "It sounds like you're putting in earnest effort, but seeing where others are makes your own progress feel smaller or slower than it truly is.";
  } else if (isLowMotivation) {
    whatIHear = "It sounds like your energy and motivation are running low today, and self-criticism about not being productive is only making the inertia heavier.";
  } else if (isOverwork && isSleepIssue) {
    whatIHear = "It sounds like your mind and body are running on empty, but the momentum of your responsibilities makes it difficult to fully power down and rest.";
  } else if (isOverwork) {
    whatIHear = "It sounds like you've been pouring a lot of your energy into what needs to get done, and the sheer volume of demands is starting to take an emotional toll.";
  } else if (isRelationship) {
    whatIHear = "It sounds like this interaction left an uncomfortable residue, leaving you replaying what happened and feeling uncertain about where things stand.";
  } else if (isDecisionFriction) {
    whatIHear = "It sounds like having to make this choice is pulling you in different directions, and fear of making the wrong move is keeping you stuck in analysis.";
  } else {
    whatIHear = "It sounds like you're taking a thoughtful pause to reflect on how today unfolded, giving yourself space to sort through your experiences.";
  }

  // 2. Possible Root Concerns / Emotional Foundations
  const rootConcerns = [];
  if (isPositive) {
    rootConcerns.push({
      concern: "Savoring positive momentum",
      explanation: "One possibility is that taking an intentional moment to acknowledge this happiness helps anchor it in your memory, building long-term emotional resilience."
    });
    rootConcerns.push({
      concern: "Inner safety & alignment",
      explanation: "This may be connected to feeling in flow with your values or experiencing well-earned relief after a stretch of effort."
    });
  } else if (isSadness) {
    rootConcerns.push({
      concern: "Need for emotional comfort & release",
      explanation: "One possibility is that a loss, feeling of disconnection, or accumulated ache needs gentle recognition rather than quick problem-solving."
    });
    rootConcerns.push({
      concern: "Holding heavy feelings alone",
      explanation: "This may stem from bearing emotional sorrow in silence, which can make the isolation feel larger."
    });
  } else if (isAnxiety) {
    rootConcerns.push({
      concern: "Need for predictability & security",
      explanation: "One possibility is that an upcoming event or uncertain outcome is triggering your mind to demand guaranteed answers."
    });
    rootConcerns.push({
      concern: "Catastrophic forecasting",
      explanation: "This might be connected to treating worst-case hypothetical scenarios as probable realities rather than distant possibilities."
    });
  } else if (isAnger) {
    rootConcerns.push({
      concern: "Boundary violation or unmet expectations",
      explanation: "One possibility is that someone's behavior felt disrespectful, invalidating, or out of step with mutual fairness."
    });
    rootConcerns.push({
      concern: "Frustration with limited control",
      explanation: "This may be connected to wanting to fix an external situation that you cannot unilaterally dictate."
    });
  } else if (isComparison) {
    rootConcerns.push({
      concern: "Fear of falling behind",
      explanation: "One possibility is that seeing others hit milestones activates a worry that your own timeline is inadequate, even when you're working steadily."
    });
    rootConcerns.push({
      concern: "External validation as the primary metric",
      explanation: "This may be connected to measuring your daily worth against visible external benchmarks rather than your personal baseline."
    });
  } else if (isLowMotivation) {
    rootConcerns.push({
      concern: "Energy conservation & recovery debt",
      explanation: "One possibility is that lack of motivation is your body's protective way of signaling that you are overdue for genuine rest."
    });
    rootConcerns.push({
      concern: "High activation friction",
      explanation: "This might stem from viewing tasks as all-or-nothing, which makes taking the first small step feel intimidating."
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
      concern: "Mental clarity & daily integration",
      explanation: "One possibility is that stepping back to write helps organize your thoughts and prioritize what actually matters today."
    });
  }

  // 3. Emotional Themes
  const emotionalThemes = [];
  if (isPositive) {
    emotionalThemes.push({ emotion: "Joy & Ease", context: "Feeling lighthearted and comfortable in the present moment" });
    emotionalThemes.push({ emotion: "Grounded Contentment", context: "Appreciating where you are without rushing to the next stressor" });
  } else if (isSadness) {
    emotionalThemes.push({ emotion: "Sorrow or Ache", context: "Feeling the weight of sadness or longing" });
    emotionalThemes.push({ emotion: "Vulnerability", context: "Honoring that things feel tender and delicate right now" });
  } else if (isAnxiety) {
    emotionalThemes.push({ emotion: "Hypervigilance", context: "High alert nervous system response to anticipated pressure" });
    emotionalThemes.push({ emotion: "Internal Tension", context: "Feeling physical or mental tightness regarding upcoming outcomes" });
  } else if (isAnger) {
    emotionalThemes.push({ emotion: "Frustration", context: "A surging reaction to feeling dismissed or treated unfairly" });
    emotionalThemes.push({ emotion: "Guardedness", context: "An urge to protect personal boundaries and self-respect" });
  } else if (isComparison) {
    emotionalThemes.push({ emotion: "Self-Doubt", context: "Questioning whether your efforts are truly moving the needle" });
    emotionalThemes.push({ emotion: "Urgency", context: "A restless pressure to accelerate or catch up" });
  } else if (isLowMotivation) {
    emotionalThemes.push({ emotion: "Sluggishness", context: "Low physical or mental drive to initiate demanding tasks" });
    emotionalThemes.push({ emotion: "Self-Pressure", context: "Feeling guilty or frustrated with yourself for moving slowly" });
  } else if (isOverwork) {
    emotionalThemes.push({ emotion: "Depletion", context: "Mental and physical stamina feeling stretched thin" });
    emotionalThemes.push({ emotion: "Duty or Obligation", context: "Continuing forward despite clear signals of fatigue" });
  } else if (isRelationship) {
    emotionalThemes.push({ emotion: "Disconnection", context: "Wishing communication had felt warmer or more collaborative" });
    emotionalThemes.push({ emotion: "Apprehension", context: "Uncertainty about how you are perceived by someone who matters" });
  } else {
    emotionalThemes.push({ emotion: "Reflective Awareness", context: "Observing your day with openness and curiosity" });
    emotionalThemes.push({ emotion: "Settling", context: "Allowing the rush of daily tasks to find equilibrium" });
  }

  // 4. Maintaining Cycle
  let maintainingCycle = null;
  if (isPositive) {
    maintainingCycle = {
      steps: [
        "Notice a positive moment",
        "Give yourself permission to fully feel it",
        "Savor what contributed to the good rhythm",
        "Anchor the memory as proof of your capability and peace"
      ],
      summary: "Savoring good moments without bracing for what might go wrong next trains your nervous system to trust ease."
    };
  } else if (isSadness) {
    maintainingCycle = {
      steps: [
        "Feel emotional sadness",
        "Judge yourself for feeling down",
        "Isolate and pull back from connection",
        "The sadness feels heavier in silence"
      ],
      summary: "When we try to force sadness away quickly, it often lingers. Giving it compassionate room allows it to naturally soften."
    };
  } else if (isAnxiety) {
    maintainingCycle = {
      steps: [
        "Notice a 'what-if' thought",
        "Body tenses up in response",
        "Search frantically for absolute certainty",
        "Anxiety spikes even higher"
      ],
      summary: "Trying to solve every hypothetical future outcome feeds the alarm loop rather than soothing it."
    };
  } else if (isAnger) {
    maintainingCycle = {
      steps: [
        "Perceive an unfair situation",
        "Replay the scenario repeatedly",
        "Anger builds with each replay",
        "Physical tension and irritability stay high"
      ],
      summary: "Mentally arguing with past events keeps the adrenaline active long after the actual moment has passed."
    };
  } else if (isComparison) {
    maintainingCycle = {
      steps: [
        "Notice someone else's highlight",
        "Assume their progress came with ease",
        "Diminish your own steady efforts",
        "Feel behind and check for more updates"
      ],
      summary: "Comparing someone else's external milestone with your internal uncertainty sustains an unfair loop."
    };
  } else if (isLowMotivation) {
    maintainingCycle = {
      steps: [
        "Feel low energy",
        "Procrastinate on large tasks",
        "Criticize yourself for not doing them",
        "Emotional energy drops even lower"
      ],
      summary: "Treating low energy as a personal defect creates guilt that drains the very motivation needed to begin."
    };
  } else if (isOverwork) {
    maintainingCycle = {
      steps: [
        "Feel overloaded with demands",
        "Skip breaks to gain time",
        "Fatigue impairs mental focus",
        "Tasks take longer, extending the work"
      ],
      summary: "Pushing through fatigue without micro-recovery creates diminishing returns where effort increases but clarity drops."
    };
  } else if (isRelationship) {
    maintainingCycle = {
      steps: [
        "Experience awkward interaction",
        "Re-read words or analyze body language",
        "Predict negative future reactions",
        "Act with guarded tension next time"
      ],
      summary: "Attempting to mind-read what others are thinking turns personal assumptions into emotional friction."
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
      summary: "Treating every detail as make-or-break leads to decision fatigue, where delaying feels protective but prolongs tension."
    };
  }

  // 5. Practical Next Steps (Your Next Move)
  const nextMoves = [];
  if (isPositive) {
    nextMoves.push({
      title: "Savor what sparked this good feeling",
      whyItHelps: "Identifying the specific ingredients of a good day helps you intentionally weave them into future routines.",
      smallStart: "Write down 1 or 2 specific elements that made today feel light (e.g. good rest, a conversation, a finished task).",
      timeEstimate: "3 mins",
      completed: false
    });
    nextMoves.push({
      title: "Carry the light energy forward guilt-free",
      whyItHelps: "Enjoying positive momentum without anticipating future stress strengthens your capacity for contentment.",
      smallStart: "Send a quick kind note to someone you appreciate, or do an activity you genuinely enjoy this evening.",
      timeEstimate: "5 mins",
      completed: false
    });
  } else if (isSadness) {
    nextMoves.push({
      title: "Offer yourself gentle sensory comfort",
      whyItHelps: "Warmth and physical soothing directly signal safety to the nervous system when feeling down.",
      smallStart: "Wrap up in a warm blanket, hold a hot cup of tea, or listen to a calming track without multitasking.",
      timeEstimate: "5 mins",
      completed: false
    });
    nextMoves.push({
      title: "Lower the bar on productivity for today",
      whyItHelps: "Releasing unnecessary demands gives your emotional batteries space to recharge.",
      smallStart: "Pick one non-essential task and officially move it to tomorrow with zero guilt.",
      timeEstimate: "2 mins",
      completed: false
    });
  } else if (isAnxiety) {
    nextMoves.push({
      title: "Ground your physical senses (3-3-3 rule)",
      whyItHelps: "Brings your awareness out of future catastrophes and back into the physically safe present.",
      smallStart: "Look around you: name 3 things you see, 3 sounds you hear, and move 3 parts of your body.",
      timeEstimate: "2 mins",
      completed: false
    });
    nextMoves.push({
      title: "Contain the worry on paper",
      whyItHelps: "Externalizing fearful thoughts stops them from echoing repeatedly in working memory.",
      smallStart: "Write down the single main worry in one sentence, then write next to it: 'I will handle this one step at a time.'",
      timeEstimate: "5 mins",
      completed: false
    });
  } else if (isAnger) {
    nextMoves.push({
      title: "Discharge physical tension before responding",
      whyItHelps: "Anger triggers physical adrenaline; moving the body clears the impulse to react sharply.",
      smallStart: "Take a brisk 5-minute walk, shake out your arms and shoulders, or splash cold water on your wrists.",
      timeEstimate: "5 mins",
      completed: false
    });
    nextMoves.push({
      title: "Clarify the core boundary on paper",
      whyItHelps: "Translates reactive frustration into constructive self-respect.",
      smallStart: "Finish this sentence in your notebook: 'What I actually needed in that moment was...'",
      timeEstimate: "4 mins",
      completed: false
    });
  } else if (isComparison) {
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
  } else if (isLowMotivation) {
    nextMoves.push({
      title: "The 2-Minute Micro-Start",
      whyItHelps: "Action precedes motivation. Shrinking the task to almost zero overcomes inertia.",
      smallStart: "Open the file or put on your walking shoes—commit to just 120 seconds of effort.",
      timeEstimate: "2 mins",
      completed: false
    });
    nextMoves.push({
      title: "Release guilt over having an off-peak day",
      whyItHelps: "Self-criticism burns energy that could otherwise go into simple recovery.",
      smallStart: "Tell yourself: 'Human beings are not machines. It is safe for me to move slowly today.'",
      timeEstimate: "1 min",
      completed: false
    });
  } else if (isOverwork) {
    nextMoves.push({
      title: "Define an official stopping point for today",
      whyItHelps: "Gives your nervous system permission to transition from performance to recovery.",
      smallStart: "Choose one task to finish, then close the laptop or notebook completely.",
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
  } else if (isRelationship) {
    nextMoves.push({
      title: "Separate observable facts from assumptions",
      whyItHelps: "Prevents anxiety from filling in the gaps of another person's thoughts.",
      smallStart: "Write down only what was literally said or done, leaving out what you fear they meant.",
      timeEstimate: "4 mins",
      completed: false
    });
    nextMoves.push({
      title: "Allow a pause before following up",
      whyItHelps: "Giving emotional dust time to settle almost always leads to a clearer conversation.",
      smallStart: "Wait until tomorrow morning before sending an explanatory text or message.",
      timeEstimate: "1 min",
      completed: false
    });
  } else {
    nextMoves.push({
      title: "Identify one thing that brought you groundedness",
      whyItHelps: "Anchors positive or neutral observations into your daily perspective.",
      smallStart: "Write down one moment from today that felt quiet, clear, or steady.",
      timeEstimate: "3 mins",
      completed: false
    });
    nextMoves.push({
      title: "Choose one simple intention for tonight",
      whyItHelps: "Bridges today's reflection into a restful, smooth transition into tomorrow.",
      smallStart: "Decide on one enjoyable or relaxing thing to do before sleep.",
      timeEstimate: "2 mins",
      completed: false
    });
  }

  // 6. Reflection Question
  let reflectionQuestion = "";
  if (isPositive) {
    reflectionQuestion = "What specifically contributed most to feeling happy today, and how can you give yourself permission to fully soak it in without rushing to what's next?";
  } else if (isSadness) {
    reflectionQuestion = "If you didn't have to put on a brave face for anyone right now, what is the softest, kindest thing you could offer yourself?";
  } else if (isAnxiety) {
    reflectionQuestion = "What is one concrete fact about your current safety or capability that your anxiety is currently overlooking?";
  } else if (isAnger) {
    reflectionQuestion = "What boundary or value is this anger trying to protect, and what is the cleanest, most constructive way to honor that boundary?";
  } else if (isComparison) {
    reflectionQuestion = "If you had no visibility into what anyone else was building or achieving, what would feel like meaningful progress to you this week?";
  } else if (isLowMotivation) {
    reflectionQuestion = "If this low motivation is actually a sign of tiredness rather than laziness, what kind of genuine rest do you most need today?";
  } else if (isOverwork) {
    reflectionQuestion = "What is one thing on your to-do list that feels urgent, but could realistically wait until tomorrow without any true harm?";
  } else if (isRelationship) {
    reflectionQuestion = "Is the outcome you're worried about something the other person directly confirmed, or something you are predicting they might think?";
  } else if (isDecisionFriction) {
    reflectionQuestion = "What would you choose if you trusted that a reversible 'good enough' decision is better than no decision at all?";
  } else {
    reflectionQuestion = "Looking at what you experienced today, what is one thing you want to give yourself credit for?";
  }

  // 7. Gentle Closing
  let gentleClosing = "";
  if (isPositive) {
    gentleClosing = "Let this good feeling linger. You deserve to experience ease and joy today.";
  } else if (isSadness) {
    gentleClosing = "Your feelings are valid. Be extraordinarily gentle with yourself as this moves through.";
  } else if (isAnxiety) {
    gentleClosing = "You are not your anxiety. Take one slow, full breath and let your shoulders drop.";
  } else if (isAnger) {
    gentleClosing = "Anger is natural information about your boundaries. Give it space to settle before you act.";
  } else if (isComparison) {
    gentleClosing = "Your timeline belongs to you. Keep your eyes on your own paper.";
  } else if (isLowMotivation) {
    gentleClosing = "You don't have to be in top gear every single day. A quiet, low-demand rhythm is completely okay.";
  } else if (isOverwork) {
    gentleClosing = "Rest is not a reward for finished work; it is a requirement for being human.";
  } else {
    gentleClosing = "Take things one grounded step at a time today.";
  }

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
1. Ground your reflection directly in the user's specific text. If they are happy, acknowledge happiness and savoring; if they are anxious, validate anxiety; if sad, offer warmth. NEVER give a canned generic response.
2. NEVER diagnose mental illnesses or assign psychiatric labels (no clinical terminology).
3. Distinguish explicit statements from uncertain interpretations. Use phrases like "One possibility is...", "This may be connected to...".
4. Avoid generic motivational fluff, toxic positivity, or patronizing reassurances.
5. Offer 2 or 3 manageable, concrete actions in 'nextMoves' with time estimates and a small way to start today.
6. If historical entries are provided, note genuine recurring themes ONLY if backed by evidence. If not supported, leave 'recurringThemes' empty.
7. Return ONLY valid JSON adhering strictly to the schema provided.

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
    if (/happy|joy|good|great|proud|grateful/i.test(lower)) {
      reply = "It's wonderful to hear you lean into that. Acknowledging what feels good is just as important as working through hard days. Carry this light feeling with you and let it fuel whatever you choose to do next.";
    } else if (/internship|job|career|hiring|recruit/i.test(lower)) {
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
  const positiveDates = [];

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
    if (/happy|joy|grateful|proud|peaceful|good day|progress/i.test(text)) {
      if (dateStr && !positiveDates.includes(dateStr)) positiveDates.push(dateStr);
    }
  }

  if (positiveDates.length >= 2) {
    themes.push({
      theme: "Moments of Grounded Joy & Ease",
      observation: "Reflections frequently record genuine contentment and gratitude during steady periods.",
      datesOrParaphrase: `Captured in entries from ${positiveDates.slice(0, 3).join(", ")}.`
    });
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
