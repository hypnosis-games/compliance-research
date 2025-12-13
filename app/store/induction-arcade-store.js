// store/induction-arcade-store.js
import { onArcadeReady } from "../phaser/induction-arcade-game.js";
import {
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY,
  startBinauralBeat,
  stopBinauralBeat,
  updateBinauralBeat,
  warmBinauralBeatContext,
} from "../audio/binaural-beat.js";
import {
  complianceInstructions,
  complianceLikertLabels,
  complianceLikertOptions,
  sampleComplianceQuestions,
} from "../data/compliance-questions.js";
import {
  AFFIRMATIONS,
  BASE_SPIRAL_INTENSITY,
  BEAT_INTENSITY_BASE,
  BEAT_INTENSITY_SCALE,
  DEFAULT_ENV,
  DEFAULT_STARTING_GAME,
  DEPTH_INCREMENT_PER_SUCCESS,
  GAME_IDS,
  MAX_DEPTH_LEVEL,
  PHASES,
  SPIRAL_SCALE_PER_DEPTH,
  TIMING,
} from "../data/induction-arcade-constants.js";

// ----------------- Helpers -----------------

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clearIntermissionSurveyTimeouts(state) {
  const timeoutIds = state.inductionArcade?.surveyTimeoutIds || [];
  timeoutIds.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  state.inductionArcade.surveyTimeoutIds = [];
}

function trackIntermissionSurveyTimeout(state, timeoutId) {
  state.inductionArcade.surveyTimeoutIds = [
    ...(state.inductionArcade.surveyTimeoutIds || []),
    timeoutId,
  ];
}

function removeIntermissionSurveyTimeout(state, timeoutId) {
  state.inductionArcade.surveyTimeoutIds = (
    state.inductionArcade.surveyTimeoutIds || []
  ).filter((id) => id !== timeoutId);
}

function clearAffirmationTimeout(state) {
  if (!state.inductionArcade?.affirmationTimeoutId) return;

  clearTimeout(state.inductionArcade.affirmationTimeoutId);
  state.inductionArcade.affirmationTimeoutId = null;
}

function calculateBeatFrequencies(depthLevel = 0) {
  const adjustment = depthLevel * 2;
  return {
    leftFrequency: DEFAULT_LEFT_FREQUENCY + adjustment,
    rightFrequency: DEFAULT_RIGHT_FREQUENCY + adjustment,
  };
}

function createIntermissionSurveyState({ active = false } = {}) {
  return {
    instructions: complianceInstructions,
    likertOptions: complianceLikertOptions,
    likertLabels: complianceLikertLabels,
    questions: sampleComplianceQuestions(5),
    currentIndex: 0,
    responses: {},
    lastAffirmation: "",
    animPhase: "idle",
    selectedValue: null,
    selectedQuestionId: null,
    active,
  };
}

function resetBeatState(state) {
  state.inductionArcade.binauralBeat = {
    leftFrequency: DEFAULT_LEFT_FREQUENCY,
    rightFrequency: DEFAULT_RIGHT_FREQUENCY,
    playing: false,
  };
}

function resetIntermissionSurvey(state, { active = false } = {}) {
  clearIntermissionSurveyTimeouts(state);
  state.inductionArcade.survey = createIntermissionSurveyState({ active });
}

function normalizeGameId(raw) {
  if (!raw) return null;

  const str = `${raw}`.trim();

  // Already-normalized IDs
  if (str === GAME_IDS.TAP_WHEN_WHITE || str === GAME_IDS.FOLLOW_THE_FADE) {
    return str;
  }

  const normalized = str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");

  if (normalized === "tap-when-white") return "tapWhenWhite";
  if (normalized === "follow-the-fade") return "followTheFade";

  return null;
}

/**
 * Read the starting game from the URL hash, e.g.:
 *   #induction-arcade?game=follow-the-fade
 */
function parseStartingGameFromHash() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash || "";
  const hashParamsString = hash.includes("?") ? hash.split("?")[1] : "";
  const hashParams = new URLSearchParams(hashParamsString);
  const gameParam = hashParams.get("game");

  return normalizeGameId(gameParam);
}

function getGameOrder(startingGame) {
  const start = normalizeGameId(startingGame);

  if (start === GAME_IDS.FOLLOW_THE_FADE) {
    return [GAME_IDS.FOLLOW_THE_FADE, GAME_IDS.TAP_WHEN_WHITE];
  }

  // Default: tapWhenWhite first, then followTheFade
  return [GAME_IDS.TAP_WHEN_WHITE, GAME_IDS.FOLLOW_THE_FADE];
}

function setInductionArcadePhase(state, emitter, nextPhase, patch = {}) {
  clearAffirmationTimeout(state);
  if (nextPhase !== PHASES.SURVEY) {
    clearIntermissionSurveyTimeouts(state);
  }

  let phaseSpecificPatch = {};

  if (
    nextPhase === PHASES.HEADPHONES ||
    nextPhase === PHASES.INTRO
  ) {
    stopBinauralBeat();
    resetBeatState(state);
    resetIntermissionSurvey(state);
    phaseSpecificPatch = {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
      env: { ...DEFAULT_ENV },
    };
  }

  if (nextPhase === PHASES.INSTRUCTIONS) {
    resetIntermissionSurvey(state, { active: false });
  }

  if (nextPhase === PHASES.SURVEY) {
    resetIntermissionSurvey(state, { active: true });
  }

  if (nextPhase === PHASES.COMPLETE) {
    stopBinauralBeat();
    resetBeatState(state);
    resetIntermissionSurvey(state);
    phaseSpecificPatch = {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
      env: { ...DEFAULT_ENV },
    };
  }

  state.inductionArcade = {
    ...state.inductionArcade,
    ...phaseSpecificPatch,
    ...patch,
    phase: nextPhase,
  };

  emitter.emit("render");
}

// ----------------- Store -----------------

export default function inductionArcadeStore(state, emitter) {
  const startingFromHash = parseStartingGameFromHash();

  state.inductionArcade = state.inductionArcade || {
    active: false,
    phase: PHASES.HEADPHONES,
    env: { ...DEFAULT_ENV },
    startingGame: startingFromHash || DEFAULT_STARTING_GAME,
    gameOrder: getGameOrder(startingFromHash || DEFAULT_STARTING_GAME),
    currentGameId: null,
    nextGameId: null,
    lastAffirmation: "",
    affirmationTimeoutId: null,
    surveyTimeoutIds: [],
    survey: createIntermissionSurveyState(),
    binauralBeat: {
      leftFrequency: DEFAULT_LEFT_FREQUENCY,
      rightFrequency: DEFAULT_RIGHT_FREQUENCY,
      playing: false,
    },
  };

  // ---- Game events coming from Phaser ----

  emitter.on("inductionArcade/gameEvent", (evt) => {
    const { type, payload } = evt;
    console.log("Game event from Phaser:", type, payload);

    if (type === "minigame/success") {
      const depth = state.inductionArcade.env.depthLevel;
      const newDepth = Math.min(
        MAX_DEPTH_LEVEL,
        depth + DEPTH_INCREMENT_PER_SUCCESS
      );

      state.inductionArcade.env = {
        ...state.inductionArcade.env,
        depthLevel: newDepth,
        spiralIntensity:
          BASE_SPIRAL_INTENSITY + newDepth * SPIRAL_SCALE_PER_DEPTH,
        beatIntensity: BEAT_INTENSITY_BASE + newDepth * BEAT_INTENSITY_SCALE,
      };

      if (state.inductionArcade.binauralBeat.playing) {
        const frequencies = calculateBeatFrequencies(newDepth);
        state.inductionArcade.binauralBeat = {
          ...state.inductionArcade.binauralBeat,
          ...frequencies,
        };
        updateBinauralBeat(frequencies);
      }

      state.inductionArcade.lastAffirmation = pickRandom(
        AFFIRMATIONS.GAMEPLAY
      );

      clearAffirmationTimeout(state);

      state.inductionArcade.affirmationTimeoutId = setTimeout(() => {
        state.inductionArcade.lastAffirmation = "";
        state.inductionArcade.affirmationTimeoutId = null;
        emitter.emit("render");
      }, TIMING.AFFIRMATION_CLEAR_MS);

      onArcadeReady((scene) => {
        if (scene.setSpiralOpacity) {
          scene.setSpiralOpacity(state.inductionArcade.env.spiralIntensity, {
            duration: 600,
          });
        }
      });

      emitter.emit("render");
    }

    if (type === "minigame/complete") {
      const { final = true } = payload || {};

      if (final) {
        setInductionArcadePhase(state, emitter, PHASES.COMPLETE, {
          currentGameId: null,
          nextGameId: null,
        });
      } else {
        // Move to next game in the order, keep env.spiralIntensity
        const currentIndex = state.inductionArcade.gameOrder.indexOf(
          state.inductionArcade.currentGameId
        );
        const nextIndex = currentIndex + 1;
        const nextGame = state.inductionArcade.gameOrder[nextIndex] || null;

        setInductionArcadePhase(
          state,
          emitter,
          nextGame ? PHASES.SURVEY : PHASES.COMPLETE,
          {
            currentGameId: null,
            nextGameId: nextGame,
          }
        );

        // Re-assert spiral at current env intensity while showing survey/instructions
        onArcadeReady((scene) => {
          if (scene.setSpiralOpacity) {
            scene.setSpiralOpacity(state.inductionArcade.env.spiralIntensity, {
              duration: 800,
            });
          }
        });
      }

      emitter.emit("render");
    }
  });

  // ---- Intermission survey between minigames ----

  emitter.on("inductionArcade/answerSurveyQuestion", (value) => {
    const survey = state.inductionArcade.survey;
    if (!survey?.active) return;
    if (survey.animPhase !== "idle") return;

    clearIntermissionSurveyTimeouts(state);

    const question = survey.questions?.[survey.currentIndex];
    if (!question) return;

    const numeric = Number(value);
    const newResponses = {
      ...survey.responses,
      [question.id]: numeric,
    };

    const isPraise = numeric >= 4;
    const fullAffirmation = isPraise
      ? pickRandom(AFFIRMATIONS.SURVEY_PRAISE)
      : pickRandom(AFFIRMATIONS.SURVEY_NEUTRAL);

    const nextIndex = survey.currentIndex + 1;
    const isLast = nextIndex >= (survey.questions?.length || 0);

    state.inductionArcade.survey = {
      ...survey,
      responses: newResponses,
      lastAffirmation: fullAffirmation,
      animPhase: "affirm",
      selectedValue: numeric,
      selectedQuestionId: question.id,
    };
    emitter.emit("render");

    const fadeTimeoutId = setTimeout(() => {
      removeIntermissionSurveyTimeout(state, fadeTimeoutId);
      state.inductionArcade.survey = {
        ...state.inductionArcade.survey,
        animPhase: "out",
      };
      emitter.emit("render");
    }, TIMING.SURVEY_FADE_MS);

    trackIntermissionSurveyTimeout(state, fadeTimeoutId);

    const advanceTimeoutId = setTimeout(() => {
      removeIntermissionSurveyTimeout(state, advanceTimeoutId);
      if (isLast) {
        setInductionArcadePhase(
          state,
          emitter,
          state.inductionArcade.nextGameId
            ? PHASES.INSTRUCTIONS
            : PHASES.COMPLETE
        );
      } else {
        state.inductionArcade.survey = {
          ...state.inductionArcade.survey,
          currentIndex: nextIndex,
          animPhase: "idle",
          lastAffirmation: "",
          selectedValue: null,
          selectedQuestionId: null,
        };
      }

      emitter.emit("render");
    }, TIMING.SURVEY_ADVANCE_MS);

    trackIntermissionSurveyTimeout(state, advanceTimeoutId);
  });

  // ---- Lifecycle / navigation ----

  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;

    const startingFromHashNow = parseStartingGameFromHash();
    state.inductionArcade.active = true;
    state.inductionArcade.startingGame =
      startingFromHashNow || DEFAULT_STARTING_GAME;
    state.inductionArcade.gameOrder = getGameOrder(
      state.inductionArcade.startingGame
    );

    setInductionArcadePhase(state, emitter, PHASES.HEADPHONES, {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
    });

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });
  });

  emitter.on("inductionArcade/exit", () => {
    if (!state.inductionArcade.active) return;

    state.inductionArcade.active = false;
    setInductionArcadePhase(state, emitter, PHASES.HEADPHONES, {
      currentGameId: null,
      nextGameId: null,
    });

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });
  });

  // First: headphones → intro
  emitter.on("inductionArcade/confirmHeadphones", async () => {
    setInductionArcadePhase(state, emitter, PHASES.INTRO, {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
    });

    // Prime Tone.js while we still have a user gesture so iOS Safari will
    // allow audio playback when the game starts.
    await warmBinauralBeatContext();

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });
  });

  // User presses "I am ready to begin" on the *intro* card
  emitter.on("inductionArcade/startGame", async () => {
    // If we already have a queued game, treat this as "beginCurrentGame"
    // so we don't reset spiralIntensity mid-session.
    if (
      state.inductionArcade.currentGameId !== null ||
      state.inductionArcade.nextGameId !== null
    ) {
      console.log(
        "inductionArcade/startGame called mid-session; delegating to beginCurrentGame"
      );
      emitter.emit("inductionArcade/beginCurrentGame");
      return;
    }

    const fromUrl = parseStartingGameFromHash();
    if (fromUrl) {
      state.inductionArcade.startingGame = fromUrl;
    }

    state.inductionArcade.gameOrder = getGameOrder(
      state.inductionArcade.startingGame
    );
    const nextGameId = state.inductionArcade.gameOrder[0];

    setInductionArcadePhase(state, emitter, PHASES.INSTRUCTIONS, {
      currentGameId: null,
      nextGameId,
      lastAffirmation: "",
      env: { ...DEFAULT_ENV },
    });

    const frequencies = calculateBeatFrequencies(
      state.inductionArcade.env.depthLevel
    );
    state.inductionArcade.binauralBeat = {
      ...state.inductionArcade.binauralBeat,
      ...frequencies,
      playing: true,
    };
    const started = await startBinauralBeat(frequencies);
    if (!started) {
      state.inductionArcade.binauralBeat = {
        ...state.inductionArcade.binauralBeat,
        playing: false,
      };
    }

    onArcadeReady((scene) => {
      scene.setMode("inductionArcade", {
        spiralOpacity: state.inductionArcade.env.spiralIntensity,
        spiralFadeIn: false,
        spiralFadeDuration: 1200,
        autoStart: false,
        initialGame: state.inductionArcade.nextGameId,
        final: state.inductionArcade.gameOrder.length === 1,
      });
    });

    emitter.emit("render");
  });

  // User presses "Start round X" for the current game
  emitter.on("inductionArcade/beginCurrentGame", () => {
    const { nextGameId, gameOrder } = state.inductionArcade;
    if (!nextGameId) return;

    const isFinal = gameOrder[gameOrder.length - 1] === nextGameId;

    setInductionArcadePhase(state, emitter, PHASES.GAME, {
      currentGameId: nextGameId,
      nextGameId,
      lastAffirmation: "",
    });

    onArcadeReady((scene) => {
      if (scene.mode !== "inductionArcade") {
        scene.setMode("inductionArcade", {
          spiralOpacity: state.inductionArcade.env.spiralIntensity,
          spiralFadeIn: true,
          spiralFadeDuration: 1200,
          autoStart: false,
          initialGame: nextGameId,
          final: isFinal,
        });
      }
      if (scene.startMinigame) {
        scene.startMinigame(nextGameId, { final: isFinal });
      }
    });
  });
}
