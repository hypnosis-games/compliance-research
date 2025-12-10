import { getArcadeScene } from "../phaser/induction-arcade-game.js";

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
    // later: respond to minigame success, mode complete, etc.
    console.log("Game event from Phaser:", type, payload);
  });

  emitter.on("inductionArcade/enter", () => {
    if (state.inductionArcade.active) return;
    state.inductionArcade.active = true;

    const scene = getArcadeScene();
    if (scene) {
      scene.setMode("inductionArcade", {
        // mini-game config, etc.
      });
    }

    emitter.emit("render");
  });

  emitter.on("inductionArcade/exit", () => {
    if (!state.inductionArcade.active) return;
    state.inductionArcade.active = false;

    const scene = getArcadeScene();
    if (scene) {
      scene.setMode("idle");
    }

    emitter.emit("render");
  });
}
