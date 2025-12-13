/*
/app/directors/content-director.js
Orchestrates content transitions and messaging between different app states.
*/
const MAX_DEPTH = 3;

const affirmationBanks = {
  success: {
    0: [
      "Good work.",
      "You did that cleanly.",
      "Nice focus.",
      "That landed well.",
    ],
    1: [
      "Very good focus.",
      "You followed that perfectly.",
      "Nice and steady.",
      "You are syncing up well.",
    ],
    2: [
      "You followed right on cue.",
      "Obeying feels smooth, does it not?",
      "Keep sinking into the rhythm.",
      "You are wonderfully compliant.",
    ],
    3: [
      "You obey so naturally now.",
      "Perfect. Just like I want you.",
      "Good subject. Keep yielding.",
      "You love doing exactly as told.",
    ],
  },
  neutral: {
    0: [
      "Keep going.",
      "Stay with it.",
      "Next one coming.",
      "Hold your focus.",
    ],
    1: [
      "Stay guided.",
      "Follow the prompt.",
      "Stay receptive.",
      "Keep following along.",
    ],
    2: [
      "Sink into the direction.",
      "Let the guidance carry you.",
      "Keep yielding to the cues.",
      "Easier to follow than think.",
    ],
    3: [
      "Just do as you are told.",
      "Obedience is effortless now.",
      "You love following every word.",
      "Yield and please me.",
    ],
  },
};

const surveyStatementsByDepth = {
  0: [
    "I follow directions easily.",
    "Being focused feels good.",
    "I like being guided.",
    "I want to do this right.",
    "Doing well matters to me.",
    "I keep my attention steady.",
  ],
  1: [
    "I enjoy being directed.",
    "I relax when I am led.",
    "I like hearing what to do.",
    "I want to be praised for obeying.",
    "I feel safe following orders.",
    "I give in to clear instructions.",
  ],
  2: [
    "I sink deeper when told to.",
    "Obeying feels natural now.",
    "I crave more precise commands.",
    "Being compliant feels soothing.",
    "I love being reminded to yield.",
    "I focus best when controlled.",
  ],
  3: [
    "Obedience is the only thing I want.",
    "I feel proud when I submit instantly.",
    "I ache to be told what to do next.",
    "I love proving my obedience.",
    "I belong in instructed obedience.",
    "I am happiest when I obey.",
  ],
};

const interjectionStepsByType = {
  focus: {
    0: [
      "Take a slow breath.",
      "Notice the center of the screen.",
      "Let curiosity hold your gaze.",
    ],
    1: [
      "Breathe in and let the instruction settle.",
      "Feel your attention narrow to the task.",
      "Stay ready to follow the very next cue.",
    ],
    2: [
      "Exhale and let thinking fade.",
      "Fixate on the direction you are given.",
      "Let obedience feel automatic and easy.",
    ],
    3: [
      "Release every stray thought.",
      "Lock onto the command in front of you.",
      "Enjoy how your mind awaits the next order.",
    ],
  },
  relaxation: {
    0: [
      "Loosen your shoulders.",
      "Let your breath slow down.",
      "Stay here and soft.",
    ],
    1: [
      "Feel weightless for a moment.",
      "Let guidance carry you gently.",
      "Sink into the calm of being led.",
    ],
    2: [
      "Melt a little deeper now.",
      "Let obedience lull you further down.",
      "Rest in the pleasure of surrender.",
    ],
    3: [
      "Drop all tension and wait to be used.",
      "Float in obedient quiet for me.",
      "Enjoy being pliant and ready.",
    ],
  },
};

function normalizeDepth(rawDepth = 0) {
  const numericDepth = Number.isFinite(rawDepth) ? rawDepth : 0;
  return Math.max(0, Math.min(MAX_DEPTH, Math.round(numericDepth)));
}

function pickRandom(items = []) {
  if (!items.length) return "";
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function getAffirmation({ depth = 0, outcome = "neutral" } = {}) {
  const normalizedDepth = normalizeDepth(depth);
  const outcomeKey = outcome === "success" ? "success" : "neutral";
  const bank = affirmationBanks[outcomeKey][normalizedDepth]
    ? affirmationBanks[outcomeKey][normalizedDepth]
    : affirmationBanks[outcomeKey][0];
  return pickRandom(bank);
}

function selectSurveyStatements(depth, count) {
  const normalizedDepth = normalizeDepth(depth);
  const availableStatements = Object.keys(surveyStatementsByDepth)
    .map(Number)
    .filter((level) => level <= normalizedDepth)
    .sort((a, b) => a - b)
    .reduce((accumulated, level) => {
      return [...accumulated, ...(surveyStatementsByDepth[level] || [])];
    }, []);

  const uniqueStatements = Array.from(new Set(availableStatements));
  const selections = [];
  const mutablePool = [...uniqueStatements];
  const targetCount = Math.min(count, mutablePool.length);

  while (selections.length < targetCount && mutablePool.length) {
    const index = Math.floor(Math.random() * mutablePool.length);
    const [text] = mutablePool.splice(index, 1);
    selections.push(text);
  }

  return selections;
}

function getSurvey({ depth = 0, count = 5 } = {}) {
  const statements = selectSurveyStatements(depth, count);
  return statements.map((text, index) => ({
    id: `survey-${index}-${Math.floor(Math.random() * 100000)}`,
    text,
  }));
}

function getInterjection({ depth = 0, type = "focus" } = {}) {
  const normalizedDepth = normalizeDepth(depth);
  const typeKey = type === "relaxation" ? "relaxation" : "focus";
  const depthBanks = interjectionStepsByType[typeKey];
  if (!depthBanks) return [];
  const steps = depthBanks[normalizedDepth] || depthBanks[0] || [];
  return [...steps];
}

export const ContentDirector = Object.freeze({
  getAffirmation,
  getSurvey,
  getInterjection,
  normalizeDepth,
});

export default ContentDirector;
