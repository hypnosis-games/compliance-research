// phaser/induction-arcade-game.js
import InductionArcadeScene from "./induction-arcade-scene.js";

let arcadeGame = null;
let arcadeScene = null;

export function initArcadeGame({ onGameEvent } = {}) {
  if (arcadeGame) return { game: arcadeGame, scene: arcadeScene };

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game",
    backgroundColor: "#000000",
    scene: [InductionArcadeScene],
  };

  arcadeGame = new Phaser.Game(config);

  // wait until the scene has been created
  arcadeGame.events.on("ready", () => {
    arcadeScene = arcadeGame.scene.keys["InductionArcadeScene"];
    if (arcadeScene && onGameEvent) {
      arcadeScene.externalEventHandler = onGameEvent;
    }
  });

  return { game: arcadeGame, scene: arcadeScene };
}

export function getArcadeScene() {
  return arcadeScene;
}
