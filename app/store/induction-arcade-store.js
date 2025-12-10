// store/induction-arcade-store.js
import { getArcadeScene, onArcadeReady } from "../phaser/induction-arcade-game.js";
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
export default function inductionArcadeStore(state, emitter) {
  state.inductionArcade = state.inductionArcade || {
    active: false,
    phase: "headphones",
    env: {
      depthLevel: 0,
      spiralIntensity: BASE_SPIRAL_INTENSITY,
      beatIntensity: 0.3,
    },
    lastAffirmation: "",
    affirmationTimeoutId: null,
    binauralBeat: {
      leftFrequency: DEFAULT_LEFT_FREQUENCY,
      rightFrequency: DEFAULT_RIGHT_FREQUENCY,
      playing: false,
    },
  };

  emitter.on("inductionArcade/gameEvent", (evt) => {
    const { type, payload } = evt;
    console.log("Game event from Phaser:", type, payload);

    if (type === "minigame/success") {
      const depth = state.inductionArcade.env.depthLevel;
      const newDepth = Math.min(1, depth + 0.005);

      state.inductionArcade.env = {
        ...state.inductionArcade.env,
        depthLevel: newDepth,
        spiralIntensity: BASE_SPIRAL_INTENSITY + newDepth * 0.8,
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

      // set a new affirmation
      state.inductionArcade.lastAffirmation = pickRandom(affirmations);

      // clear any previous hide-timer
      if (state.inductionArcade.affirmationTimeoutId) {
        clearTimeout(state.inductionArcade.affirmationTimeoutId);
      }

      // hide it again after ~900ms
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
      state.inductionArcade.phase = "complete";
      state.inductionArcade.lastAffirmation = "";
      stopBinauralBeat();
      resetBeatState(state);
      emitter.emit("render");
    }
  });


  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;
    state.inductionArcade.active = true;
    state.inductionArcade.phase = "headphones";
    state.inductionArcade.lastAffirmation = "";

    // make sure scene exists and is in idle
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

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });

  // user presses "I am ready to begin"
  emitter.on("inductionArcade/startGame", () => {
    state.inductionArcade.phase = "game";
    state.inductionArcade.lastAffirmation = "";

    // reset env if you want
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
        // later: minigame id config etc
        spiralOpacity: state.inductionArcade.env.spiralIntensity,
        spiralFadeIn: true,
        spiralFadeDuration: 1200,
      });
    });

    emitter.emit("render");
  });

  emitter.on("inductionArcade/confirmHeadphones", () => {
    state.inductionArcade.phase = "intro";
    state.inductionArcade.lastAffirmation = "";
    stopBinauralBeat();
    resetBeatState(state);

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });
}
