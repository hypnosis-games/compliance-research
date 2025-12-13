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

let resolveArcadeSceneReady = null;
let arcadeSceneReadyPromise = null;

function getOrCreateArcadeSceneReadyPromise() {
  if (arcadeSceneReadyPromise) return arcadeSceneReadyPromise;

  arcadeSceneReadyPromise = new Promise((resolve) => {
    resolveArcadeSceneReady = resolve;
  });

  return arcadeSceneReadyPromise;
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

export function initArcadeGame() {
  if (arcadeGame) return { game: arcadeGame, scene: arcadeScene };

  // create the promise *before* Phaser boots, so any awaiters are safe
  getOrCreateArcadeSceneReadyPromise();

  const { width, height } = calculateGameDimensions();

  const config = {
    type: Phaser.AUTO,
    width,
    height,
    parent: "game",
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.NONE },
    pipeline: {
      [SPIRAL_PIPELINE_KEY]: SpiralPostFXPipeline,
    },
    scene: [InductionArcadeScene],
  };

  arcadeGame = new Phaser.Game(config);
  resizeCanvas(arcadeGame);

  window.addEventListener("resize", () => resizeCanvas(arcadeGame));

  return { game: arcadeGame, scene: arcadeScene };
}

/**
 * Called exactly once by InductionArcadeScene.create().
 * This is the only "bridge" we need.
 */
export function registerArcadeScene(sceneInstance) {
  arcadeScene = sceneInstance;

  if (resolveArcadeSceneReady) {
    const resolveNow = resolveArcadeSceneReady;
    resolveArcadeSceneReady = null;
    resolveNow(sceneInstance);
  }
}

export function getArcadeScene() {
  return arcadeScene;
}

/**
 * Deterministic: if the scene exists, returns immediately;
 * otherwise waits until the scene calls registerArcadeScene().
 */
export async function ensureArcadeSceneReady() {
  if (arcadeScene) return arcadeScene;

  initArcadeGame();
  const promise = getOrCreateArcadeSceneReadyPromise();
  return promise;
}

/**
 * Optional helper: set / replace the event handler whenever you want.
 */
export function setArcadeExternalEventHandler(onGameEvent) {
  if (arcadeScene) {
    arcadeScene.externalEventHandler = onGameEvent || null;
  }
}
