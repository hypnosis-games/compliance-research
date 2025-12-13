/*
/app/data/induction-arcade-constants.js
Defines constants and configuration values shared across induction arcade components.
*/
export const PHASES = Object.freeze({
  HEADPHONES: "headphones",
  INTRO: "intro",
  INSTRUCTIONS: "instructions",
  GAME: "game",
  SURVEY: "survey",
  INTERJECTION: "interjection",
  COMPLETE: "complete",
});

export const GAME_IDS = Object.freeze({
  TAP_WHEN_WHITE: "tapWhenWhite",
  FOLLOW_THE_FADE: "followTheFade",
  FOCUS_EXERCISE: "focusExercise",
});

export const BASE_SPIRAL_INTENSITY = 0.01;
export const DEPTH_INCREMENT_PER_SUCCESS = 0.1;
export const DEPTH_INCREMENT_PER_POSITIVE_SURVEY = 0.05;
export const DEPTH_INCREMENT_PER_RELAXATION_MS = 0.00002;
export const MAX_DEPTH_LEVEL = 5;
export const SPIRAL_SCALE_PER_DEPTH = 0.1;
export const BEAT_INTENSITY_BASE = 0.3;
export const BEAT_INTENSITY_SCALE = 0.2;

export const TIMING = Object.freeze({
  AFFIRMATION_CLEAR_MS: 900,
  SURVEY_FADE_MS: 500,
  SURVEY_ADVANCE_MS: 900,
});

export const DEFAULT_ENV = Object.freeze({
  depthLevel: 0,
  spiralIntensity: BASE_SPIRAL_INTENSITY,
  beatIntensity: BEAT_INTENSITY_BASE,
});

export const DEFAULT_STARTING_GAME = GAME_IDS.TAP_WHEN_WHITE;
