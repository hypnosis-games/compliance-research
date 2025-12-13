/*
/app/phaser/games/tap-when-white-game.js
Implements the Tap When White reflex mini-game including scoring and timing.
*/
// phaser/games/tap-when-white-game.js

export default class TapWhenWhiteGame {
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

  update() {}

  destroy() {
    this.isActive = false;
    if (this.tween) this.tween.stop();
    if (this.scene && this.pointerHandler) {
      this.scene.input.off("pointerdown", this.pointerHandler);
    }
    if (this.whiteOverlay) this.whiteOverlay.destroy();
  }
}
