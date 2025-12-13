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
});

export const BASE_SPIRAL_INTENSITY = 0.01;
export const DEPTH_INCREMENT_PER_SUCCESS = 1;
export const MAX_DEPTH_LEVEL = 3;
export const SPIRAL_SCALE_PER_DEPTH = 0.2;
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
