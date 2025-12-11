// store/induction-arcade-store.js
import { onArcadeReady } from "../phaser/induction-arcade-game.js";
import {
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY,
  startBinauralBeat,
  stopBinauralBeat,
  updateBinauralBeat,
} from "../audio/binaural-beat.js";

const BASE_SPIRAL_INTENSITY = 0.01;

const affirmations = [
  "So focused.",
  "Very good.",
  "So good.",
  "Keep watching.",
  "Nice.",
  "Exactly right.",
];

// ----------------- Helpers -----------------

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateBeatFrequencies(depthLevel = 0) {
  const adjustment = depthLevel * 2;
  return {
    leftFrequency: DEFAULT_LEFT_FREQUENCY + adjustment,
    rightFrequency: DEFAULT_RIGHT_FREQUENCY + adjustment,
  };
}

function resetBeatState(state) {
  state.inductionArcade.binauralBeat = {
    leftFrequency: DEFAULT_LEFT_FREQUENCY,
    rightFrequency: DEFAULT_RIGHT_FREQUENCY,
    playing: false,
  };
}

function normalizeGameId(raw) {
  if (!raw) return null;

  const str = `${raw}`.trim();

  // Already-normalized IDs
  if (str === "tapWhenWhite" || str === "followTheFade") {
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

  if (start === "followTheFade") {
    return ["followTheFade", "tapWhenWhite"];
  }

  // Default: tapWhenWhite first, then followTheFade
  return ["tapWhenWhite", "followTheFade"];
}

// ----------------- Store -----------------

export default function inductionArcadeStore(state, emitter) {
  const startingFromHash = parseStartingGameFromHash();

  state.inductionArcade = state.inductionArcade || {
    active: false,
    // Phases: 'headphones' → 'intro' → 'instructions' → 'game' → 'complete'
    phase: "headphones",
    env: {
      depthLevel: 0,
      spiralIntensity: BASE_SPIRAL_INTENSITY,
      beatIntensity: 0.3,
    },
    startingGame: startingFromHash || "tapWhenWhite",
    gameOrder: getGameOrder(startingFromHash || "tapWhenWhite"),
    currentGameId: null, // currently running minigame
    nextGameId: null,    // minigame shown in the instructions card
    lastAffirmation: "",
    affirmationTimeoutId: null,
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
      const newDepth = Math.min(1, depth + 0.005);

      state.inductionArcade.env = {
        ...state.inductionArcade.env,
        depthLevel: newDepth,
        spiralIntensity: BASE_SPIRAL_INTENSITY + newDepth * 0.2,
        beatIntensity: 0.3 + newDepth * 0.5,
      };

      if (state.inductionArcade.binauralBeat.playing) {
        const frequencies = calculateBeatFrequencies(newDepth);
        state.inductionArcade.binauralBeat = {
          ...state.inductionArcade.binauralBeat,
          ...frequencies,
        };
        updateBinauralBeat(frequencies);
      }

      state.inductionArcade.lastAffirmation = pickRandom(affirmations);

      if (state.inductionArcade.affirmationTimeoutId) {
        clearTimeout(state.inductionArcade.affirmationTimeoutId);
      }

      state.inductionArcade.affirmationTimeoutId = setTimeout(() => {
        state.inductionArcade.lastAffirmation = "";
        state.inductionArcade.affirmationTimeoutId = null;
        emitter.emit("render");
      }, 900);

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
        // End of whole sequence
        state.inductionArcade.phase = "complete";
        state.inductionArcade.lastAffirmation = "";
        state.inductionArcade.currentGameId = null;
        state.inductionArcade.nextGameId = null;
        stopBinauralBeat();
        resetBeatState(state);
      } else {
        // Move to next game in the order, keep env.spiralIntensity
        const currentIndex = state.inductionArcade.gameOrder.indexOf(
          state.inductionArcade.currentGameId
        );
        const nextIndex = currentIndex + 1;
        const nextGame = state.inductionArcade.gameOrder[nextIndex] || null;

        state.inductionArcade.currentGameId = null;
        state.inductionArcade.nextGameId = nextGame;
        state.inductionArcade.phase = nextGame ? "instructions" : "complete";

        // Re-assert spiral at current env intensity while showing instructions
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

  // ---- Lifecycle / navigation ----

  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;

    const startingFromHashNow = parseStartingGameFromHash();
    state.inductionArcade.active = true;
    state.inductionArcade.phase = "headphones";
    state.inductionArcade.lastAffirmation = "";
    state.inductionArcade.currentGameId = null;
    state.inductionArcade.nextGameId = null;

    // Recompute order each time you enter, in case URL changed
    state.inductionArcade.startingGame = startingFromHashNow || "tapWhenWhite";
    state.inductionArcade.gameOrder = getGameOrder(
      state.inductionArcade.startingGame
    );

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });

  emitter.on("inductionArcade/exit", () => {
    if (!state.inductionArcade.active) return;

    state.inductionArcade.active = false;
    state.inductionArcade.phase = "headphones";
    stopBinauralBeat();
    resetBeatState(state);
    state.inductionArcade.currentGameId = null;
    state.inductionArcade.nextGameId = null;

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });

  // First: headphones → intro
  emitter.on("inductionArcade/confirmHeadphones", () => {
    state.inductionArcade.phase = "intro";
    state.inductionArcade.lastAffirmation = "";
    state.inductionArcade.currentGameId = null;
    state.inductionArcade.nextGameId = null;
    stopBinauralBeat();
    resetBeatState(state);

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });

  // User presses "I am ready to begin" on the *intro* card
  emitter.on("inductionArcade/startGame", () => {
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
    state.inductionArcade.currentGameId = null;
    state.inductionArcade.nextGameId = state.inductionArcade.gameOrder[0];
    state.inductionArcade.phase = "instructions";
    state.inductionArcade.lastAffirmation = "";

    // Reset env (and thus spiral) only once at the start of the sequence
    state.inductionArcade.env = {
      depthLevel: 0,
      spiralIntensity: BASE_SPIRAL_INTENSITY,
      beatIntensity: 0.3,
    };

    const frequencies = calculateBeatFrequencies(
      state.inductionArcade.env.depthLevel
    );
    state.inductionArcade.binauralBeat = {
      ...state.inductionArcade.binauralBeat,
      ...frequencies,
      playing: true,
    };
    startBinauralBeat(frequencies);

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

    state.inductionArcade.currentGameId = nextGameId;
    state.inductionArcade.phase = "game";
    state.inductionArcade.lastAffirmation = "";

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

    emitter.emit("render");
  });
}
