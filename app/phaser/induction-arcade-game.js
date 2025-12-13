/*
/app/phaser/induction-arcade-game.js
Coordinates initialization of Phaser scenes and audio for the induction arcade.
*/
// phaser/induction-arcade-game.js
import InductionArcadeScene from "./induction-arcade-scene.js";
import SpiralPostFXPipeline, {
  SPIRAL_PIPELINE_KEY,
} from "./spiral-postfx-pipeline.js";

let arcadeGame = null;
let arcadeScene = null;
let readyCallbacks = [];

function handleSceneReady(sceneInstance, onGameEvent) {
  arcadeScene = sceneInstance;

  if (arcadeScene && onGameEvent) {
    arcadeScene.externalEventHandler = onGameEvent;
  }

  if (arcadeScene && readyCallbacks.length) {
    readyCallbacks.forEach((cb) => cb(arcadeScene));
    readyCallbacks = [];
  }
}

function listenForSceneReady(onGameEvent) {
  const sceneInstance = arcadeGame?.scene?.keys?.["InductionArcadeScene"];

  if (!sceneInstance) return;

  const scenePlugin = sceneInstance.scene;
  const sceneIsActive =
    scenePlugin && typeof scenePlugin.isActive === "function"
      ? scenePlugin.isActive()
      : false;

  if (sceneIsActive) {
    handleSceneReady(sceneInstance, onGameEvent);
    return;
  }

  sceneInstance.events.once("ready", () => {
    handleSceneReady(sceneInstance, onGameEvent);
  });
}

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
    canvas.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    canvas.style.maxHeight = "100vh";
    canvas.style.maxWidth = "100vw";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
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
    // Register the spiral as a PostFX pipeline so the scene can use camera.setPostPipeline(SPIRAL_PIPELINE_KEY)
    pipeline: {
      [SPIRAL_PIPELINE_KEY]: SpiralPostFXPipeline,
    },
    scene: [InductionArcadeScene],
  };

  arcadeGame = new Phaser.Game(config);
  resizeCanvas(arcadeGame);

  listenForSceneReady(onGameEvent);

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
