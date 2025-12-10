// store/induction-arcade-store.js
import { getArcadeScene, onArcadeReady } from "../phaser/induction-arcade-game.js";

const neutralAffirmations = [
  "Good.",
  "Nice.",
  "You’re doing well.",
  "Next.",
  "Keep going.",
];

const praiseAffirmations = [
  "Very good.",
  "That’s right.",
  "Excellent.",
  "Perfect.",
  "Exactly.",
  "Nicely done.",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function inductionArcadeStore(state, emitter) {
  state.inductionArcade = state.inductionArcade || {
    active: false,
    env: {
      depthLevel: 0,
      spiralIntensity: 0.2,
      beatIntensity: 0.3,
    },
    lastAffirmation: "",
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

      state.inductionArcade.lastAffirmation =
        newDepth > 0.4 ? pickRandom(praiseAffirmations) : pickRandom(neutralAffirmations);

      emitter.emit("render");

      const scene = getArcadeScene();
      if (scene && scene.setEnv) {
        scene.setEnv(state.inductionArcade.env);
      }
    }

    if (type === "minigame/complete") {
      console.log("Minigame complete:", payload);
      // For now, just restart the arcade:
      onArcadeReady((scene) => {
        scene.setMode("inductionArcade");
      });
    }
  });

  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;
    state.inductionArcade.active = true;

    // no matter when this runs, the callback will fire once the scene is ready
    onArcadeReady((scene) => {
      scene.setMode("inductionArcade", {
        // future: mini-game config
      });
    });

    emitter.emit("render");
  });

  emitter.on("inductionArcade/exit", () => {
    if (!state.inductionArcade.active) return;
    state.inductionArcade.active = false;

    onArcadeReady((scene) => {
      scene.setMode("idle");
    });

    emitter.emit("render");
  });
}
