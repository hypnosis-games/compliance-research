// phaser/induction-arcade-scene.js

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

    this.game.events.emit("ready");
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
    let pipeline = cam.getPostPipeline("SpiralPostFX");

    if (Array.isArray(pipeline)) {
      pipeline = pipeline[0];
    }

    if (!pipeline) {
      cam.setPostPipeline("SpiralPostFX");
      pipeline = cam.getPostPipeline("SpiralPostFX");
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
    if (this.mode === mode) return;
    this.mode = mode;

    this.clearCurrentMinigame();

    if (mode === "idle") {
      this.createIdleBackground();
      return;
    }

    if (mode === "inductionArcade") {
      this.startArcade(config);
    }
  }

  startArcade(config) {
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

    this.sequenceStage = 0;

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

class TapWhenWhiteGame {
  constructor(scene, { onComplete, onSuccess }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onSuccess = onSuccess;

    this.successCount = 0;
    this.targetSuccesses = 10;
    this.isActive = true;

    const { width, height } = scene.scale;

    // White overlay whose alpha we pulse 0 → 1
    this.whiteOverlay = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0xffffff,
      1
    );
    this.whiteOverlay.setAlpha(0);
    scene.gameLayer.add(this.whiteOverlay);

    this.threshold = 0.7;
    this.canScore = false;
    this.lastAlpha = 0;

    this.tween = scene.tweens.add({
      targets: this.whiteOverlay,
      alpha: { from: 0, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: (tween, target) => {
        const a = target.alpha;
        if (this.lastAlpha < this.threshold && a >= this.threshold) {
          this.canScore = true;
        }
        this.lastAlpha = a;
      },
    });

    this.pointerHandler = (pointer) => this.handleTap(pointer);
    scene.input.on("pointerdown", this.pointerHandler);
  }

  handleTap() {
    if (!this.isActive) return;

    const brightness = this.whiteOverlay.alpha;

    if (brightness >= this.threshold && this.canScore) {
      this.canScore = false;
      this.successCount++;

      this.scene.tweens.add({
        targets: this.whiteOverlay,
        scaleX: 1.02,
        scaleY: 1.02,
        yoyo: true,
        duration: 120,
      });

      if (this.onSuccess) {
        this.onSuccess({
          successCount: this.successCount,
          targetSuccesses: this.targetSuccesses,
        });
      }

      if (this.successCount >= this.targetSuccesses) {
        this.finishGame();
      }
    } else {
      this.scene.tweens.add({
        targets: this.whiteOverlay,
        alpha: { from: brightness, to: Math.max(0, brightness - 0.2) },
        yoyo: true,
        duration: 90,
      });
    }
  }

  finishGame() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.tween) this.tween.stop();

    if (this.onComplete) {
      this.onComplete({
        successCount: this.successCount,
        targetSuccesses: this.targetSuccesses,
      });
    }
  }

  update(time, delta) {}

  destroy() {
    this.isActive = false;
    if (this.tween) this.tween.stop();
    if (this.scene && this.pointerHandler) {
      this.scene.input.off("pointerdown", this.pointerHandler);
    }
    if (this.whiteOverlay) this.whiteOverlay.destroy();
  }
}

class FollowTheFadeGame {
  constructor(scene, { onComplete, onSuccess }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onSuccess = onSuccess;

    this.successCount = 0;
    this.targetSuccesses = 12;
    this.isActive = true;

    const { width, height } = scene.scale;
    this.dot = scene.add.circle(width / 2, height / 2, 26, 0xffffff, 1);
    this.dot.setAlpha(0.12);
    scene.gameLayer.add(this.dot);

    this.threshold = 0.72;
    this.minAlpha = 0.08;
    this.maxAlpha = 1;
    this.brightDuration = 1500;
    this.ghostChance = 0.18;
    this.canScore = false;
    this.lastAlpha = 0;

    this.pointerHandler = () => this.handleTap();
    scene.input.on("pointerdown", this.pointerHandler);

    this.startPulse();
  }

  startPulse() {
    if (!this.isActive) return;

    const { width, height } = this.scene.scale;
    const padding = 40;
    const targetX = Phaser.Math.Between(padding, width - padding);
    const targetY = Phaser.Math.Between(padding, height - padding);
    const ghosting = Math.random() < this.ghostChance;

    const activeDuration = ghosting
      ? Math.max(450, this.brightDuration * 0.65)
      : this.brightDuration;
    const targetAlpha = ghosting ? Math.min(this.maxAlpha, 0.88) : this.maxAlpha;

    if (this.moveTween) this.moveTween.stop();
    this.moveTween = this.scene.tweens.add({
      targets: this.dot,
      x: targetX,
      y: targetY,
      duration: Math.max(280, activeDuration * 0.8),
      ease: "Sine.easeInOut",
    });

    if (this.pulseTween) this.pulseTween.stop();
    this.pulseTween = this.scene.tweens.add({
      targets: this.dot,
      alpha: { from: this.minAlpha, to: targetAlpha },
      duration: activeDuration,
      yoyo: true,
      hold: ghosting ? 30 : 120,
      ease: "Sine.easeInOut",
      onUpdate: (tween, target) => {
        const a = target.alpha;
        if (this.lastAlpha < this.threshold && a >= this.threshold) {
          this.canScore = true;
        }
        this.lastAlpha = a;
      },
      onYoyo: () => {
        this.canScore = false;
      },
      onComplete: () => {
        this.startPulse();
      },
    });
  }

  handleTap() {
    if (!this.isActive) return;

    const brightness = this.dot.alpha;

    if (brightness >= this.threshold && this.canScore) {
      this.canScore = false;
      this.successCount++;

      this.scene.tweens.add({
        targets: this.dot,
        scaleX: 1.08,
        scaleY: 1.08,
        yoyo: true,
        duration: 160,
        ease: "Sine.easeOut",
      });

      this.bumpDifficulty();

      if (this.onSuccess) {
        this.onSuccess({
          successCount: this.successCount,
          targetSuccesses: this.targetSuccesses,
        });
      }

      if (this.successCount >= this.targetSuccesses) {
        this.finishGame();
      }
    } else {
      this.scene.tweens.add({
        targets: this.dot,
        alpha: {
          from: brightness,
          to: Math.max(this.minAlpha, brightness - 0.15),
        },
        duration: 100,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    }
  }

  bumpDifficulty() {
    this.brightDuration = Math.max(620, this.brightDuration * 0.93);
    this.threshold = Math.min(0.88, this.threshold + 0.01);
    this.ghostChance = Math.min(0.35, this.ghostChance + 0.01);
  }

  finishGame() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.pulseTween) this.pulseTween.stop();
    if (this.moveTween) this.moveTween.stop();

    if (this.onComplete) {
      this.onComplete({
        successCount: this.successCount,
        targetSuccesses: this.targetSuccesses,
      });
    }
  }

  update(time, delta) {}

  destroy() {
    this.isActive = false;
    if (this.pulseTween) this.pulseTween.stop();
    if (this.moveTween) this.moveTween.stop();
    if (this.scene && this.pointerHandler) {
      this.scene.input.off("pointerdown", this.pointerHandler);
    }
    if (this.dot) this.dot.destroy();
  }
}
