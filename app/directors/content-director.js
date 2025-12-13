/*
/app/directors/content-director.js
Orchestrates content transitions and messaging between different app states.
*/
import {
  surveyAffirmationsByTone,
  surveyStatementsByDepth,
  taskAffirmationsByOutcome,
  interjectionStepsByType,
} from "../data/affirmation-and-question-strings.js";

const MAX_DEPTH = 5;

function clampDepth(rawDepth = 0) {
  const numericDepth = Number.isFinite(rawDepth) ? rawDepth : 0;
  const clampedDepth = Math.max(0, Math.min(MAX_DEPTH, numericDepth));
  return clampedDepth;
}

function getDepthBucket(rawDepth = 0) {
  const clampedDepth = clampDepth(rawDepth);
  return Math.round(clampedDepth);
}

function pickRandom(items = []) {
  if (!items.length) return "";
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function getTaskAffirmation({ depth = 0 } = {}) {
  const normalizedDepth = getDepthBucket(depth);
  const bank = taskAffirmationsByOutcome.success[normalizedDepth]
    ? taskAffirmationsByOutcome.success[normalizedDepth]
    : taskAffirmationsByOutcome.success[0];
  return pickRandom(bank);
}

function getSurveyAffirmation({ depth = 0, isPositive = false } = {}) {
  const normalizedDepth = getDepthBucket(depth);
  const toneKey = isPositive ? "positive" : "neutral";
  const bank = surveyAffirmationsByTone[toneKey][normalizedDepth]
    ? surveyAffirmationsByTone[toneKey][normalizedDepth]
    : surveyAffirmationsByTone[toneKey][0];
  return pickRandom(bank);
}

function selectSurveyStatements(depth, count) {
  const normalizedDepth = getDepthBucket(depth);
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
  const normalizedDepth = getDepthBucket(depth);
  const typeKey = type === "relaxation" ? "relaxation" : "focus";
  const depthBanks = interjectionStepsByType[typeKey];
  if (!depthBanks) return [];
  const sortedDepths = Object.keys(depthBanks)
    .map(Number)
    .filter(Number.isFinite)
    .sort((first, second) => first - second);
  const eligibleDepth = sortedDepths
    .filter((level) => level <= normalizedDepth)
    .pop();
  const bestDepth = Number.isFinite(eligibleDepth) ? eligibleDepth : sortedDepths[0];
  const steps = depthBanks[bestDepth] || [];
  return [...steps];
}

export const ContentDirector = Object.freeze({
  getTaskAffirmation,
  getSurveyAffirmation,
  getSurvey,
  getInterjection,
  normalizeDepth: getDepthBucket,
  clampDepth,
  getDepthBucket,
});

export default ContentDirector;
