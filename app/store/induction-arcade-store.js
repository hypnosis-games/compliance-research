/*
/app/store/induction-arcade-store.js
Handles game lifecycle state and user progress for the induction arcade experience.
*/
// store/induction-arcade-store.js
import {
  initArcadeGame,
  ensureArcadeSceneReady,
  setArcadeExternalEventHandler,
} from "../phaser/induction-arcade-game.js";
import {
  DEFAULT_LEFT_FREQUENCY,
  startBinauralBeat,
  stopBinauralBeat,
  updateBinauralBeat,
  warmBinauralBeatContext,
} from "../audio/binaural-beat.js";
import {
  complianceInstructions,
  complianceLikertLabels,
  complianceLikertOptions,
} from "../data/affirmation-and-question-strings.js";
import {
  BASE_SPIRAL_INTENSITY,
  BEAT_INTENSITY_BASE,
  BEAT_INTENSITY_SCALE,
  DEFAULT_STARTING_GAME,
  DEPTH_INCREMENT_PER_SUCCESS,
  DEPTH_INCREMENT_PER_POSITIVE_SURVEY,
  DEPTH_INCREMENT_PER_RELAXATION_MS,
  GAME_IDS,
  MAX_DEPTH_LEVEL,
  PHASES,
  SPIRAL_SCALE_PER_DEPTH,
  TIMING,
} from "../data/induction-arcade-constants.js";
import { ContentDirector } from "../directors/content-director.js";

// ----------------- Helpers -----------------

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

function clampDepthToRange(rawDepth = 0) {
  const numericDepth = Number.isFinite(rawDepth) ? rawDepth : 0;
  const clampedDepth = Math.max(0, Math.min(MAX_DEPTH_LEVEL, numericDepth));
  return clampedDepth;
}

function calculateBeatFrequencies(depthLevel = 0) {
  const clampedDepth = clampDepthToRange(depthLevel);
  const depthProgress = clampedDepth / MAX_DEPTH_LEVEL;
  const startingDifference = 11;
  const targetDifference = 1.5;
  const beatDifference =
    startingDifference - (startingDifference - targetDifference) * depthProgress;
  return {
    leftFrequency: DEFAULT_LEFT_FREQUENCY,
    rightFrequency: DEFAULT_LEFT_FREQUENCY + beatDifference,
  };
}

function deriveEnvironmentFromDepth(depthLevel = 0) {
  const clampedDepth = clampDepthToRange(depthLevel);
  return {
    depthLevel: clampedDepth,
    spiralIntensity:
      BASE_SPIRAL_INTENSITY + clampedDepth * SPIRAL_SCALE_PER_DEPTH,
    beatIntensity: BEAT_INTENSITY_BASE + clampedDepth * BEAT_INTENSITY_SCALE,
  };
}

function applyDepthDelta(state, depthDelta = 0) {
  const currentDepth = clampDepthToRange(state.conditioning?.depth || 0);
  const nextDepth = clampDepthToRange(currentDepth + depthDelta);

  state.conditioning.depth = nextDepth;
  state.inductionArcade.env = {
    ...state.inductionArcade.env,
    ...deriveEnvironmentFromDepth(nextDepth),
  };

  if (state.inductionArcade.binauralBeat.playing) {
    const frequencies = calculateBeatFrequencies(nextDepth);
    state.inductionArcade.binauralBeat = {
      ...state.inductionArcade.binauralBeat,
      ...frequencies,
    };
    updateBinauralBeat(frequencies);
  }

  return nextDepth;
}

function stopRelaxationDepthTimer(state) {
  if (state.inductionArcade?.relaxationDepthIntervalId) {
    clearInterval(state.inductionArcade.relaxationDepthIntervalId);
  }

  state.inductionArcade.relaxationDepthIntervalId = null;
  state.inductionArcade.relaxationDepthLastTick = null;
}

function startRelaxationDepthTimer(state, emitter) {
  stopRelaxationDepthTimer(state);

  state.inductionArcade.relaxationDepthLastTick = Date.now();
  state.inductionArcade.relaxationDepthIntervalId = setInterval(() => {
    const now = Date.now();
    const lastTick = state.inductionArcade.relaxationDepthLastTick || now;
    const elapsedMs = Math.max(0, now - lastTick);
    state.inductionArcade.relaxationDepthLastTick = now;

    if (elapsedMs === 0) return;

    const beforeDepth = clampDepthToRange(state.conditioning?.depth || 0);
    const afterDepth = applyDepthDelta(
      state,
      elapsedMs * DEPTH_INCREMENT_PER_RELAXATION_MS
    );

    if (afterDepth !== beforeDepth) {
      emitter.emit("render");
    }
  }, 200);
}

function createIntermissionSurveyState({ active = false, depth = 0 } = {}) {
  return {
    instructions: complianceInstructions,
    likertOptions: complianceLikertOptions,
    likertLabels: complianceLikertLabels,
    questions: ContentDirector.getSurvey({ depth, count: 5 }),
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
    ...calculateBeatFrequencies(0),
    playing: false,
  };
}

function resetIntermissionSurvey(state, { active = false } = {}) {
  clearIntermissionSurveyTimeouts(state);
  const depth = ContentDirector.normalizeDepth(state.conditioning?.depth || 0);
  state.inductionArcade.survey = createIntermissionSurveyState({
    active,
    depth,
  });
}

function createInterjectionState() {
  return {
    active: false,
    type: null,
    steps: [],
    currentIndex: 0,
    nextType: "focus",
  };
}

function resetInterjection(state) {
  state.inductionArcade.interjection = createInterjectionState();
}

function getDepth(state) {
  const currentDepth = state.conditioning?.depth ?? state.inductionArcade?.env?.depthLevel;
  return clampDepthToRange(currentDepth || 0);
}

function normalizeGameId(raw) {
  if (!raw) return null;

  const str = `${raw}`.trim();

  // Already-normalized IDs
  if (
    str === GAME_IDS.TAP_WHEN_WHITE ||
    str === GAME_IDS.FOLLOW_THE_FADE ||
    str === GAME_IDS.FOCUS_EXERCISE
  ) {
    return str;
  }

  const normalized = str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");

  if (normalized === "tap-when-white") return "tapWhenWhite";
  if (normalized === "follow-the-fade") return "followTheFade";
  if (normalized === "focus-exercise") return "focusExercise";

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

  const baseOrder = [
    GAME_IDS.TAP_WHEN_WHITE,
    GAME_IDS.FOLLOW_THE_FADE,
    GAME_IDS.FOCUS_EXERCISE,
  ];

  if (start === GAME_IDS.FOLLOW_THE_FADE) {
    return [
      GAME_IDS.FOLLOW_THE_FADE,
      GAME_IDS.FOCUS_EXERCISE,
      GAME_IDS.TAP_WHEN_WHITE,
    ];
  }

  if (start === GAME_IDS.FOCUS_EXERCISE) {
    return [GAME_IDS.FOCUS_EXERCISE];
  }

  // Default: tapWhenWhite first, then followTheFade, then focusExercise
  return baseOrder;
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
    resetInterjection(state);
    state.conditioning.depth = 0;
    phaseSpecificPatch = {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
      env: deriveEnvironmentFromDepth(state.conditioning.depth),
    };
  }

  if (nextPhase === PHASES.INSTRUCTIONS) {
    resetIntermissionSurvey(state, { active: false });
  }

  if (nextPhase === PHASES.SURVEY) {
    resetIntermissionSurvey(state, { active: true });
  }

  if (nextPhase === PHASES.INTERJECTION) {
    resetIntermissionSurvey(state, { active: false });
  }

  if (nextPhase === PHASES.COMPLETE) {
    stopBinauralBeat();
    resetBeatState(state);
    resetIntermissionSurvey(state);
    resetInterjection(state);
    state.conditioning.depth = 0;
    phaseSpecificPatch = {
      lastAffirmation: "",
      currentGameId: null,
      nextGameId: null,
      env: deriveEnvironmentFromDepth(state.conditioning.depth),
    };
  }

  state.inductionArcade = {
    ...state.inductionArcade,
    ...phaseSpecificPatch,
    ...patch,
    phase: nextPhase,
  };

  const interjectionType =
    nextPhase === PHASES.INTERJECTION
      ? (state.inductionArcade.interjection?.type || null)
      : null;

  if (interjectionType === "relaxation") {
    startRelaxationDepthTimer(state, emitter);
  } else {
    stopRelaxationDepthTimer(state);
  }

  emitter.emit("render");
}

function advanceConditioningLoop(
  state,
  emitter,
  { nextGameId = null, allowInterjection = true } = {}
) {
  const depth = getDepth(state);
  const prospectiveInterjectionType =
    state.inductionArcade.interjection?.nextType || "focus";
  const shouldInsertInterjection = depth >= 1 && nextGameId !== null;

  if (allowInterjection && shouldInsertInterjection) {
    const interjectionSteps = ContentDirector.getInterjection({
      depth,
      type: prospectiveInterjectionType,
    });

    if (interjectionSteps.length) {
      const nextTypeAfterThis =
        prospectiveInterjectionType === "focus" ? "relaxation" : "focus";
      state.inductionArcade.interjection = {
        active: true,
        type: prospectiveInterjectionType,
        steps: interjectionSteps,
        currentIndex: 0,
        nextType: nextTypeAfterThis,
      };

      setInductionArcadePhase(state, emitter, PHASES.INTERJECTION, {
        interjection: state.inductionArcade.interjection,
      });
      return;
    }
  }

  setInductionArcadePhase(
    state,
    emitter,
    nextGameId ? PHASES.INSTRUCTIONS : PHASES.COMPLETE,
    {
      currentGameId: null,
      nextGameId,
    }
  );
}

// ----------------- Store -----------------

export default function inductionArcadeStore(state, emitter) {
  const startingFromHash = parseStartingGameFromHash();

  state.conditioning = state.conditioning || { depth: 0 };

  state.inductionArcade = state.inductionArcade || {
    active: false,
    phase: PHASES.HEADPHONES,
    env: deriveEnvironmentFromDepth(state.conditioning.depth || 0),
    startingGame: startingFromHash || DEFAULT_STARTING_GAME,
    gameOrder: getGameOrder(startingFromHash || DEFAULT_STARTING_GAME),
    currentGameId: null,
    nextGameId: null,
    lastAffirmation: "",
    affirmationTimeoutId: null,
    surveyTimeoutIds: [],
    survey: createIntermissionSurveyState({ depth: state.conditioning.depth || 0 }),
    interjection: createInterjectionState(),
    binauralBeat: {
      ...calculateBeatFrequencies(state.conditioning.depth || 0),
      playing: false,
    },
    relaxationDepthIntervalId: null,
    relaxationDepthLastTick: null,
  };

  // ---- Game events coming from Phaser ----

  emitter.on("inductionArcade/gameEvent", async (evt) => {
    const { type, payload } = evt;
    console.log("Game event from Phaser:", type, payload);

    if (type === "minigame/success") {
      const gameId = payload?.id;
      const isRelaxationGame = gameId === GAME_IDS.FOCUS_EXERCISE;
      const newDepth = applyDepthDelta(state, DEPTH_INCREMENT_PER_SUCCESS);

      const affirmation = isRelaxationGame && payload?.instruction
        ? payload.instruction
        : ContentDirector.getTaskAffirmation({
            depth: ContentDirector.getDepthBucket(newDepth),
            outcome: "success",
          });

      state.inductionArcade.lastAffirmation = affirmation;

      clearAffirmationTimeout(state);

      state.inductionArcade.affirmationTimeoutId = setTimeout(() => {
        state.inductionArcade.lastAffirmation = "";
        state.inductionArcade.affirmationTimeoutId = null;
        emitter.emit("render");
      }, TIMING.AFFIRMATION_CLEAR_MS);

      const scene = await ensureArcadeSceneReady();
      if (scene.setSpiralOpacity) {
        scene.setSpiralOpacity(state.inductionArcade.env.spiralIntensity, {
          duration: 600,
        });
      }

      emitter.emit("render");
    }

    if (type === "minigame/complete") {
      const { final = true, id: completedGameId } = payload || {};
      const isRelaxation = completedGameId === GAME_IDS.FOCUS_EXERCISE;
      const effectiveFinal = isRelaxation ? false : final;

      if (effectiveFinal) {
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
        let nextGame = state.inductionArcade.gameOrder[nextIndex] || null;

        if (isRelaxation) {
          state.inductionArcade.gameOrder = [
            GAME_IDS.TAP_WHEN_WHITE,
            GAME_IDS.FOLLOW_THE_FADE,
            GAME_IDS.FOCUS_EXERCISE,
          ];
          nextGame = GAME_IDS.TAP_WHEN_WHITE;
        }

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
        const scene = await ensureArcadeSceneReady();
        if (scene.setSpiralOpacity) {
          scene.setSpiralOpacity(state.inductionArcade.env.spiralIntensity, {
            duration: 800,
          });
        }
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

    let depthAfterSurvey = getDepth(state);
    if (isPraise) {
      depthAfterSurvey = applyDepthDelta(
        state,
        DEPTH_INCREMENT_PER_POSITIVE_SURVEY
      );
    }

    const fullAffirmation = ContentDirector.getSurveyAffirmation({
      depth: ContentDirector.getDepthBucket(depthAfterSurvey),
      isPositive: isPraise,
    });

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
        advanceConditioningLoop(state, emitter, {
          nextGameId: state.inductionArcade.nextGameId,
        });
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

  emitter.on("inductionArcade/advanceInterjection", () => {
    const interjection = state.inductionArcade.interjection;
    if (!interjection?.active) return;

    const nextIndex = interjection.currentIndex + 1;
    if (nextIndex >= interjection.steps.length) {
      const nextGameId = state.inductionArcade.nextGameId;
      const resetState = createInterjectionState();
      resetState.nextType = interjection.nextType || resetState.nextType;
      state.inductionArcade.interjection = resetState;
      advanceConditioningLoop(state, emitter, {
        nextGameId,
        allowInterjection: false,
      });
    } else {
      state.inductionArcade.interjection = {
        ...interjection,
        currentIndex: nextIndex,
      };
      emitter.emit("render");
    }
  });

  // ---- Lifecycle / navigation ----

  emitter.on("inductionArcade/enter", async () => {
    if (state.inductionArcade.active) return;

    // create game if needed + wire Phaser → store events
    initArcadeGame();

    const onGameEvent = (evt) => emitter.emit("inductionArcade/gameEvent", evt);

    // set immediately if ready, otherwise when the scene registers itself
    setArcadeExternalEventHandler(onGameEvent);

    const scene = await ensureArcadeSceneReady();
    scene.externalEventHandler = onGameEvent;

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

    console.log("STORE: inductionArcade/enter scene ready");
    scene.setMode("idle");
  });

  emitter.on("inductionArcade/exit", async () => {
    if (!state.inductionArcade.active) return;

    state.inductionArcade.active = false;
    setInductionArcadePhase(state, emitter, PHASES.HEADPHONES, {
      currentGameId: null,
      nextGameId: null,
    });

    const scene = await ensureArcadeSceneReady();
    scene.setMode("idle");
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

    const scene = await ensureArcadeSceneReady();
    scene.setMode("idle");
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
      env: deriveEnvironmentFromDepth(state.conditioning.depth),
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

    const scene = await ensureArcadeSceneReady();
    scene.setMode("inductionArcade", {
      spiralOpacity: state.inductionArcade.env.spiralIntensity,
      spiralFadeIn: false,
      spiralFadeDuration: 1200,
      autoStart: false,
      initialGame: state.inductionArcade.nextGameId,
      final: state.inductionArcade.gameOrder.length === 1,
    });

    emitter.emit("inductionArcade/beginCurrentGame");
    emitter.emit("render");
  });

  // User presses "Start round X" for the current game
  emitter.on("inductionArcade/beginCurrentGame", async () => {
    const { nextGameId, gameOrder } = state.inductionArcade;
    if (!nextGameId) return;

    const isFinal = gameOrder[gameOrder.length - 1] === nextGameId;

    setInductionArcadePhase(state, emitter, PHASES.GAME, {
      currentGameId: nextGameId,
      nextGameId,
      lastAffirmation: "",
    });

    const scene = await ensureArcadeSceneReady();
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
}
