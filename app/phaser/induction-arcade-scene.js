export default class InductionArcadeScene extends Phaser.Scene {
  constructor() {
    super({ key: "InductionArcadeScene" });
    this.mode = "idle"; // 'idle' | 'inductionArcade'
    this.externalEventHandler = null;
    this.currentMinigame = null;
  }

  preload() {}

  create() {
    this.bgLayer = this.add.container(0, 0);
    this.gameLayer = this.add.container(0, 0);

    this.createIdleBackground();

    // signal game is ready so initArcadeGame can grab the scene
    this.game.events.emit("ready");
  }

  createIdleBackground() {
    this.bgLayer.removeAll(true);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.bgLayer.add(g);
  }

  setMode(mode, config = {}) {
    if (this.mode === mode) return;
    this.mode = mode;

    // clear minigame objects
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
    // For now just start the first minigame.
    this.currentMinigame = new TapWhenBrightGame(this, {
      onComplete: (result) => {
        this.emitGameEvent("minigame/complete", {
          id: "tapWhenBright",
          ...result,
        });

        // Later: pick another minigame, or go idle, or loop.
        // For now, just go idle so you can see lifecycle clearly.
        this.setMode("idle");
      },
      onSuccess: (payload) => {
        this.emitGameEvent("minigame/success", {
          id: "tapWhenBright",
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

class TapWhenBrightGame {
  constructor(scene, { onComplete, onSuccess }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onSuccess = onSuccess;

    this.successCount = 0;
    this.totalRounds = 0;
    this.maxRounds = 6; // ~15–30s depending on timings
    this.isActive = true;
    this.isBright = false;
    this.hasRespondedThisRound = false;

    const { width, height } = scene.scale;

    // background slightly not-black so it feels "gamey"
    const bg = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000010,
      1
    );
    scene.gameLayer.add(bg);

    const size = Math.min(width, height) * 0.25;
    this.square = scene.add.rectangle(
      width / 2,
      height / 2,
      size,
      size,
      0xffffff,
      1
    );
    this.square.setAlpha(0.2); // start dim
    this.square.setInteractive({ useHandCursor: true });
    scene.gameLayer.add(this.square);

    this.pointerHandler = () => this.handleTap();
    this.square.on("pointerdown", this.pointerHandler);

    this.startNextRound();
  }

  startNextRound() {
    if (!this.isActive) return;

    this.totalRounds++;
    this.hasRespondedThisRound = false;
    this.isBright = false;

    // random wait before brightening
    const waitMs = Phaser.Math.Between(600, 1600);
    const brightenMs = Phaser.Math.Between(800, 1400);

    this.square.setAlpha(0.2);

    this.scene.time.delayedCall(waitMs, () => {
      if (!this.isActive) return;

      // tween from dim → bright
      this.scene.tweens.add({
        targets: this.square,
        alpha: { from: 0.2, to: 1.0 },
        duration: brightenMs,
        onUpdate: (tween, target) => {
          // consider it "bright enough to tap" past 0.7 alpha
          if (!this.isBright && target.alpha >= 0.7) {
            this.isBright = true;
          }
        },
        onComplete: () => {
          // give them a short window to tap after full bright
          this.scene.time.delayedCall(500, () => {
            if (!this.isActive) return;
            this.endRound();
          });
        },
      });
    });
  }

  handleTap() {
    if (!this.isActive || this.hasRespondedThisRound) return;

    this.hasRespondedThisRound = true;

    if (this.isBright) {
      this.successCount++;
      // small visual feedback
      this.scene.tweens.add({
        targets: this.square,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        duration: 120,
      });

      if (this.onSuccess) {
        this.onSuccess({
          successCount: this.successCount,
          totalRounds: this.totalRounds,
        });
      }
    } else {
      // optionally do a "too early" pulse
      this.scene.tweens.add({
        targets: this.square,
        angle: { from: -5, to: 5 },
        yoyo: true,
        repeat: 1,
        duration: 80,
        onComplete: () => {
          this.square.setAngle(0);
        },
      });
    }
  }

  endRound() {
    if (!this.isActive) return;

    if (this.totalRounds >= this.maxRounds) {
      this.finishGame();
    } else {
      this.startNextRound();
    }
  }

  finishGame() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.onComplete) {
      this.onComplete({
        successCount: this.successCount,
        totalRounds: this.totalRounds,
      });
    }
  }

  update(time, delta) {
    // nothing needed yet, but hook is here
  }

  destroy() {
    this.isActive = false;
    if (this.square && this.pointerHandler) {
      this.square.off("pointerdown", this.pointerHandler);
    }
    if (this.square) this.square.destroy();
  }
}

