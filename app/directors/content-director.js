/*
/app/directors/content-director.js
Orchestrates content transitions and messaging between different app states.
*/
import {
  surveyAffirmationsByTone,
  surveyStatementsByDepth,
  taskAffirmationsByOutcome,
} from "../data/affirmation-and-question-strings.js";

const MAX_DEPTH = 3;

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

function getTaskAffirmation({ depth = 0, outcome = "neutral" } = {}) {
  const normalizedDepth = normalizeDepth(depth);
  const outcomeKey = outcome === "success" ? "success" : "neutral";
  const bank = taskAffirmationsByOutcome[outcomeKey][normalizedDepth]
    ? taskAffirmationsByOutcome[outcomeKey][normalizedDepth]
    : taskAffirmationsByOutcome[outcomeKey][0];
  return pickRandom(bank);
}

function getSurveyAffirmation({ depth = 0, isPositive = false } = {}) {
  const normalizedDepth = normalizeDepth(depth);
  const toneKey = isPositive ? "positive" : "neutral";
  const bank = surveyAffirmationsByTone[toneKey][normalizedDepth]
    ? surveyAffirmationsByTone[toneKey][normalizedDepth]
    : surveyAffirmationsByTone[toneKey][0];
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
  getTaskAffirmation,
  getSurveyAffirmation,
  getSurvey,
  getInterjection,
  normalizeDepth,
});

export default ContentDirector;
