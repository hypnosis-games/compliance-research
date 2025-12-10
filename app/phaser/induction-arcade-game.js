// phaser/induction-arcade-game.js
import InductionArcadeScene from "./induction-arcade-scene.js";
import SpiralPostFXPipeline from "./spiral-postfx-pipeline.js";

let arcadeGame = null;
let arcadeScene = null;
let readyCallbacks = [];

// ----------------- Sizing helpers -----------------

function calculateGameDimensions() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const maxHeight = 720;
  const targetHeight = Math.min(viewportHeight, maxHeight);

  const windowAspect = viewportWidth / viewportHeight;
  const maxAspect = 1; // always taller than wide
  const targetAspect = Math.min(windowAspect, maxAspect);

  const targetWidth = Math.round(targetHeight * targetAspect);

  return { width: targetWidth, height: targetHeight };
}

function resizeCanvas(game) {
  if (!game) return;

  const { width, height } = calculateGameDimensions();
  game.scale.resize(width, height);

  const canvas = game.canvas;
  if (canvas) {
    canvas.style.height = "100vh";
    canvas.style.width = "auto";
    canvas.style.maxHeight = "100vh";
    canvas.style.maxWidth = "calc(100vh)";
  }
}

// ----------------- Arcade init / accessors -----------------

export function initArcadeGame({ onGameEvent } = {}) {
  if (arcadeGame) {
    // already created
    if (arcadeScene && onGameEvent) {
      arcadeScene.externalEventHandler = onGameEvent;
    }
    return { game: arcadeGame, scene: arcadeScene };
  }

  const { width, height } = calculateGameDimensions();

  const config = {
    type: Phaser.AUTO,
    width,
    height,
    parent: "game",
    backgroundColor: "#000000",
    scale: {
      mode: Phaser.Scale.NONE,
    },
    // Register the spiral as a PostFX pipeline so the scene can use camera.setPostPipeline("SpiralPostFX")
    pipeline: {
      SpiralPostFX: SpiralPostFXPipeline,
    },
    scene: [InductionArcadeScene],
  };

  arcadeGame = new Phaser.Game(config);
  resizeCanvas(arcadeGame);

  // wait until the scene has been created
  arcadeGame.events.on("ready", () => {
    arcadeScene = arcadeGame.scene.keys["InductionArcadeScene"];

    if (arcadeScene && onGameEvent) {
      arcadeScene.externalEventHandler = onGameEvent;
    }

    if (arcadeScene && readyCallbacks.length) {
      readyCallbacks.forEach((cb) => cb(arcadeScene));
      readyCallbacks = [];
    }
  });

  window.addEventListener("resize", () => resizeCanvas(arcadeGame));

  return { game: arcadeGame, scene: arcadeScene };
}

export function getArcadeScene() {
  return arcadeScene;
}

export function onArcadeReady(cb) {
  if (arcadeScene) {
    cb(arcadeScene);
  } else {
    readyCallbacks.push(cb);
  }
}
