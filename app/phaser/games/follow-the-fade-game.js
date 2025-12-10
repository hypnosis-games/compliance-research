// phaser/games/follow-the-fade-game.js

export default class FollowTheFadeGame {
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

  update() {}

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
