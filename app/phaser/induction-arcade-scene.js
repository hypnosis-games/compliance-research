/*
/app/phaser/induction-arcade-scene.js
Defines the primary Phaser scene orchestrating visual effects and game progression.
*/
// phaser/induction-arcade-scene.js
import TapWhenWhiteGame from "./games/tap-when-white-game.js";
import FollowTheFadeGame from "./games/follow-the-fade-game.js";
import FocusExerciseGame from "./games/focus-exercise-game.js";
import { SPIRAL_PIPELINE_KEY } from "./spiral-postfx-pipeline.js";
import { registerArcadeScene } from "./induction-arcade-game.js";

export default class InductionArcadeScene extends Phaser.Scene {
  constructor() {
    super({ key: "InductionArcadeScene" });
    this.mode = "idle"; // 'idle' | 'inductionArcade'
    this.externalEventHandler = null;
    this.currentMinigame = null;
    this.spiralTween = null;
    this.sequenceStage = 0;
  }

  preload() {}

  create() {
    this.bgLayer = this.add.container(0, 0);
    this.gameLayer = this.add.container(0, 0);

    this.createIdleBackground();

    registerArcadeScene(this);
    console.log("InductionArcadeScene created");
  }

  createIdleBackground() {
    // Simple black bg; spiral is handled by postFX
    this.bgLayer.removeAll(true);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.bgLayer.add(g);

    // Idle spiral: very subtle
    this.setSpiralOpacity(0.01, { duration: 0 });
  }

  getSpiralPipeline() {
    if (!this.cameras || !this.cameras.main) return null;

    const cam = this.cameras.main;
    let pipeline = cam.getPostPipeline(SPIRAL_PIPELINE_KEY);

    if (Array.isArray(pipeline)) {
      pipeline = pipeline[0];
    }

    if (!pipeline) {
      cam.setPostPipeline(SPIRAL_PIPELINE_KEY);
      pipeline = cam.getPostPipeline(SPIRAL_PIPELINE_KEY);
      if (Array.isArray(pipeline)) {
        pipeline = pipeline[0];
      }
    }

    return pipeline || null;
  }

  setSpiralOpacity(targetOpacity, { duration = 0 } = {}) {
    const pipeline = this.getSpiralPipeline();
    if (!pipeline) return;

    const clamped = Phaser.Math.Clamp(targetOpacity, 0, 1);

    if (this.spiralTween) {
      this.spiralTween.stop();
      this.spiralTween = null;
    }

    if (duration > 0) {
      this.spiralTween = this.tweens.add({
        targets: pipeline,
        overlay: clamped,
        duration,
        ease: "Sine.easeInOut",
        onComplete: () => {
          pipeline.setOverlay(clamped);
          this.spiralTween = null;
        },
      });
    } else {
      pipeline.setOverlay(clamped);
    }
  }

  setMode(mode, config = {}) {
    const modeChanged = this.mode !== mode;
    this.mode = mode;

    if (mode === "idle") {
      if (modeChanged) {
        this.clearCurrentMinigame();
      }
      this.createIdleBackground();
      return;
    }

    if (mode === "inductionArcade") {
      const autoStart = config.autoStart ?? modeChanged;
      const resetSequence = config.resetSequence ?? modeChanged;

      if (modeChanged || autoStart) {
        this.clearCurrentMinigame();
      }

      this.startArcade(
        { ...config, autoStart },
        { resetSequence }
      );
    }
  }

  startArcade(config, { resetSequence = true } = {}) {
    const {
      spiralOpacity = 0.2,
      spiralFadeIn = false,
      spiralFadeDuration = 1000,
      initialGame = "tapWhenWhite",
      autoStart = true,
      final = false,
    } = config;

    // Set spiral level for the minigame
    if (spiralFadeIn) {
      this.setSpiralOpacity(0, { duration: 0 });
      this.setSpiralOpacity(spiralOpacity, { duration: spiralFadeDuration });
    } else {
      this.setSpiralOpacity(spiralOpacity, { duration: 0 });
    }

    if (resetSequence) {
      this.sequenceStage = 0;
    }

    if (autoStart) {
      this.startMinigame(initialGame, { final });
    }
  }

  startMinigame(gameId, { final = false } = {}) {
    if (!gameId) return;

    if (gameId === "tapWhenWhite") {
      this.startTapWhenWhite({ final });
      return;
    }

    if (gameId === "followTheFade") {
      this.startFollowTheFade({ final });
      return;
    }

    if (gameId === "focusExercise") {
      this.startFocusExercise({ final });
    }
  }

  clearCurrentMinigame() {
    if (this.currentMinigame && this.currentMinigame.destroy) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }
    if (this.gameLayer) {
      this.gameLayer.removeAll(true);
    }
  }

  startTapWhenWhite({ final = false } = {}) {
    this.clearCurrentMinigame();

    this.currentMinigame = new TapWhenWhiteGame(this, {
      onComplete: (result) => {
        this.handleMinigameComplete("tapWhenWhite", result, { final });
      },
      onSuccess: (payload) => {
        this.handleMinigameSuccess("tapWhenWhite", payload);
      },
    });
  }

  startFocusExercise({ final = true } = {}) {
    this.clearCurrentMinigame();

    this.currentMinigame = new FocusExerciseGame(this, {
      onComplete: (result) => {
        this.handleMinigameComplete("focusExercise", result, { final });
      },
      onSuccess: (payload) => {
        this.handleMinigameSuccess("focusExercise", payload);
      },
    });
  }

  startFollowTheFade({ final = true } = {}) {
    this.clearCurrentMinigame();

    this.currentMinigame = new FollowTheFadeGame(this, {
      onComplete: (result) => {
        this.handleMinigameComplete("followTheFade", result, { final });
      },
      onSuccess: (payload) => {
        this.handleMinigameSuccess("followTheFade", payload);
      },
    });
  }

  handleMinigameSuccess(id, payload) {
    this.emitGameEvent("minigame/success", { id, ...payload });
  }

  handleMinigameComplete(id, result, { final = false } = {}) {
    this.emitGameEvent("minigame/complete", {
      id,
      ...result,
      final,
    });

    this.clearCurrentMinigame();

    if (!final) {
      this.sequenceStage += 1;
      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1.015,
        yoyo: true,
        duration: 280,
        ease: "Sine.easeInOut",
      });
      return;
    }
    this.setMode("idle");
  }

  emitGameEvent(type, payload) {
    if (this.externalEventHandler) {
      this.externalEventHandler({ type, payload });
    }
  }

  update(time, delta) {
    if (this.currentMinigame && this.currentMinigame.update) {
      this.currentMinigame.update(time, delta);
    }
  }
}
