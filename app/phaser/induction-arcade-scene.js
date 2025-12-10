// phaser/induction-arcade-scene.js (only the minigame class changed)

export default class InductionArcadeScene extends Phaser.Scene {
  constructor() {
    super({ key: "InductionArcadeScene" });
    this.mode = "idle"; // 'idle' | 'inductionArcade'
    this.externalEventHandler = null;
    this.currentMinigame = null;
    this.spiralOpacity = 0;
    this.spiralTween = null;
    this.spiralQuad = null;
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
    if (this.spiralTween) {
      this.spiralTween.stop();
      this.spiralTween = null;
    }

    this.bgLayer.removeAll(true);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.bgLayer.add(g);

    const pipeline = this.getSpiralPipeline();
    if (pipeline) {
      pipeline.setOpacity(0);
    }
  }

  getSpiralPipeline() {
    if (!this.game || !this.game.renderer || !this.game.renderer.pipelines) {
      return null;
    }

    return this.game.renderer.pipelines.get("SpiralPipeline") || null;
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
        opacity: clamped,
        duration,
        ease: "Sine.easeInOut",
        onComplete: () => {
          pipeline.setOpacity(clamped);
          this.spiralTween = null;
        },
      });
    } else {
      pipeline.setOpacity(clamped);
    }

    this.spiralOpacity = clamped;
  }

  createSpiralBackground({ opacity = 0.6, startInvisible = false, fadeDuration = 1000 } = {}) {
    this.bgLayer.removeAll(true);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.bgLayer.add(g);

    const pipeline = this.getSpiralPipeline();
    this.spiralQuad = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0xffffff,
      1
    );

    if (pipeline) {
      this.spiralQuad.setPipeline("SpiralPipeline");
      this.setSpiralOpacity(startInvisible ? 0 : opacity);

      if (startInvisible && opacity > 0) {
        this.setSpiralOpacity(opacity, { duration: fadeDuration });
      }
    } else {
      this.spiralQuad.setAlpha(0);
    }

    this.bgLayer.add(this.spiralQuad);
  }

  setMode(mode, config = {}) {
    if (this.mode === mode) return;
    this.mode = mode;

    if (this.currentMinigame && this.currentMinigame.destroy) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }
    this.gameLayer.removeAll(true);

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
      spiralOpacity = 0.6,
      spiralFadeIn = false,
      spiralFadeDuration = 1000,
    } = config;

    this.createSpiralBackground({
      opacity: spiralOpacity,
      startInvisible: spiralFadeIn,
      fadeDuration: spiralFadeDuration,
    });

    this.currentMinigame = new TapWhenWhiteGame(this, {
      onComplete: (result) => {
        this.emitGameEvent("minigame/complete", {
          id: "tapWhenWhite",
          ...result,
        });
        this.setMode("idle");
      },
      onSuccess: (payload) => {
        this.emitGameEvent("minigame/success", {
          id: "tapWhenWhite",
          ...payload,
        });
      },
    });
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

    // Base black fill (just in case)
    const bgBase = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      1
    );
    scene.gameLayer.add(bgBase);

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
        // allow one score per "bright" phase
        if (this.lastAlpha < this.threshold && a >= this.threshold) {
          this.canScore = true;
        }
        this.lastAlpha = a;
      },
    });

    // Tap/click anywhere
    this.pointerHandler = (pointer) => this.handleTap(pointer);
    scene.input.on("pointerdown", this.pointerHandler);
  }

  handleTap() {
    if (!this.isActive) return;

    const brightness = this.whiteOverlay.alpha;

    if (brightness >= this.threshold && this.canScore) {
      this.canScore = false;
      this.successCount++;

      // Tiny pulse for feedback
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
      // optional "off-beat" feedback – very subtle
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

    if (this.tween) {
      this.tween.stop();
    }

    if (this.onComplete) {
      this.onComplete({
        successCount: this.successCount,
        targetSuccesses: this.targetSuccesses,
      });
    }
  }

  update(time, delta) {
    // nothing per-frame for now
  }

  destroy() {
    this.isActive = false;
    if (this.tween) this.tween.stop();
    if (this.scene && this.pointerHandler) {
      this.scene.input.off("pointerdown", this.pointerHandler);
    }
    if (this.whiteOverlay) this.whiteOverlay.destroy();
  }
}
