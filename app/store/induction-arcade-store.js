// store/induction-arcade-store.js
import { getArcadeScene, onArcadeReady } from "../phaser/induction-arcade-game.js";

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
export default function inductionArcadeStore(state, emitter) {
  state.inductionArcade = state.inductionArcade || {
    active: false,
    gameStarted: false,
    gameCompleted: false,
    env: {
      depthLevel: 0,
      spiralIntensity: 0.2,
      beatIntensity: 0.3,
    },
    lastAffirmation: "",
    affirmationTimeoutId: null,
  };

  emitter.on("inductionArcade/gameEvent", (evt) => {
    const { type, payload } = evt;
    console.log("Game event from Phaser:", type, payload);

    if (type === "minigame/success") {
      const depth = state.inductionArcade.env.depthLevel;
      const newDepth = Math.min(1, depth + 0.05);

      state.inductionArcade.env = {
        ...state.inductionArcade.env,
        depthLevel: newDepth,
        spiralIntensity: 0.2 + newDepth * 0.8,
        beatIntensity: 0.3 + newDepth * 0.5,
      };

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

      emitter.emit("render");
    }

    if (type === "minigame/complete") {
      state.inductionArcade.gameCompleted = true;
      state.inductionArcade.gameStarted = false;
      emitter.emit("render");
    }
  });


  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;
    state.inductionArcade.active = true;
    state.inductionArcade.gameStarted = false;
    state.inductionArcade.gameCompleted = false;
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
    state.inductionArcade.gameStarted = false;
    state.inductionArcade.gameCompleted = false;

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });

  // user presses "I am ready to begin"
  emitter.on("inductionArcade/startGame", () => {
    state.inductionArcade.gameStarted = true;
    state.inductionArcade.gameCompleted = false;
    state.inductionArcade.lastAffirmation = "";

    // reset env if you want
    state.inductionArcade.env = {
      depthLevel: 0,
      spiralIntensity: 0.2,
      beatIntensity: 0.3,
    };

    onArcadeReady((scene) => {
      scene.setMode("inductionArcade", {
        // later: minigame id config etc
      });
    });

    emitter.emit("render");
  });
}
