// phaser/games/follow-the-fade-game.js

const DOT_TEXTURE_KEY = "followFadeDot";

export default class FollowTheFadeGame {
  constructor(scene, { onComplete, onSuccess }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onSuccess = onSuccess;

    this.successCount = 0;
    this.targetSuccesses = 10; // a bit shorter
    this.isActive = true;

    const { width, height } = scene.scale;

    // --- create a smooth, anti-aliased dot texture once ---
    if (!scene.textures.exists(DOT_TEXTURE_KEY)) {
      const g = scene.add.graphics();
      const texRadius = 64; // hi-res circle
      g.fillStyle(0xffffff, 1);
      g.fillCircle(texRadius, texRadius, texRadius);
      g.generateTexture(DOT_TEXTURE_KEY, texRadius * 2, texRadius * 2);
      g.destroy();
    }

    const radius = Math.round(Math.min(width, height) * 0.07); // base "big" radius

    this.dot = scene.add.image(width / 2, height / 2, DOT_TEXTURE_KEY);
    this.dot.setDisplaySize(radius * 2, radius * 2);
    this.dot.setAlpha(0.14);
    scene.gameLayer.add(this.dot);

    // --- scales for moving vs "ready" ---
    // big "ready" size
    this.stationaryScale = this.dot.scaleX;
    // small "ghost" size
    this.movingScale = this.stationaryScale * 0.35;

    // start small
    this.dot.setScale(this.movingScale);

    // simple interactive hit (image bounds); success only when tapping the dot
    this.dot.setInteractive();

    // --- sparkly particle aura ---
    this.particles = scene.add.particles(0, 0, DOT_TEXTURE_KEY, {
      speed: { min: 20, max: 90 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.28, end: 0 },
      alpha: { start: 0.35, end: 0 },
      lifespan: { min: 350, max: 700 },
      quantity: 1,
      frequency: 45,
      follow: this.dot,
      followOffset: { x: 0, y: 0 },
      blendMode: "ADD",
    });
    scene.gameLayer.add(this.particles);

    // --- timing & difficulty settings ---
    this.threshold = 0.6;   // slightly easier / earlier "ready"
    this.windowSlack = 0.25; // wider window, easier hits
    this.minAlpha = 0.14;
    this.maxAlpha = 1.0;
    this.brightDuration = 1900; // slower pulses
    this.ghostChance = 0.10; // fewer tricky pulses
    this.canScore = false;
    this.lastAlpha = 0;

    this.isPopping = false; // used to let the pop animation override scale

    this.pointerHandler = () => this.handleTap();
    this.dot.on("pointerdown", this.pointerHandler);

    this.startPulse();
  }

  startPulse() {
    if (!this.isActive) return;

    const { width, height } = this.scene.scale;
    const padding = 60;
    const targetX = Phaser.Math.Between(padding, width - padding);
    const targetY = Phaser.Math.Between(padding, height - padding);
    const ghosting = Math.random() < this.ghostChance;

    const baseDuration = ghosting
      ? Math.max(1200, this.brightDuration * 0.85)
      : this.brightDuration;

    const activeDuration = baseDuration;
    const targetAlpha = ghosting
      ? Math.min(this.maxAlpha, 0.9)
      : this.maxAlpha;

    // reset to small + dim at start of each pulse
    this.dot.setScale(this.movingScale);
    this.dot.setAlpha(this.minAlpha);

    // --- movement tween: move as we fade in/out ---
    if (this.moveTween) this.moveTween.stop();
    this.moveTween = this.scene.tweens.add({
      targets: this.dot,
      x: targetX,
      y: targetY,
      duration: activeDuration,
      ease: "Sine.easeInOut",
    });

    // --- alpha + implicit scale tween (scale derived from alpha) ---
    if (this.pulseTween) this.pulseTween.stop();
    this.pulseTween = this.scene.tweens.add({
      targets: this.dot,
      alpha: { from: this.minAlpha, to: targetAlpha },
      duration: activeDuration,
      yoyo: true,
      hold: ghosting ? 60 : 140,
      ease: "Sine.easeInOut",
      onStart: () => {
        if (!this.isActive) return;
        this.canScore = false;
        this.lastAlpha = this.minAlpha;
      },
      onUpdate: (tween, target) => {
        if (!this.isActive) return;

        const a = target.alpha;
        this.lastAlpha = a;

        // let particles breathe with brightness (still constantly emitting)
        if (this.particles) {
          this.particles.setAlpha(a);
        }

        // smooth scale: small when dim, big when bright
        if (!this.isPopping) {
          const norm = Phaser.Math.Clamp(
            (a - this.minAlpha) / (this.maxAlpha - this.minAlpha),
            0,
            1,
          );
          const s = Phaser.Math.Linear(this.movingScale, this.stationaryScale, norm);
          this.dot.setScale(s);
        }

        // scoring window driven by alpha
        if (!this.canScore && a >= this.threshold) {
          this.canScore = true;
        }
        if (this.canScore && a < this.threshold - this.windowSlack) {
          this.canScore = false;
        }
      },
      onComplete: () => {
        if (!this.isActive) return;
        this.canScore = false;
        // start next pulse-cycle
        this.startPulse();
      },
    });
  }

  handleTap() {
    if (!this.isActive) return;

    if (this.canScore) {
      // GOOD TAP
      this.canScore = false;
      this.successCount++;

      // stop current tweens so the pop feels clean
      if (this.pulseTween) {
        this.pulseTween.stop();
        this.pulseTween = null;
      }
      if (this.moveTween) {
        this.moveTween.stop();
        this.moveTween = null;
      }

      this.isPopping = true;

      // 1) grow a bit bigger than ready size
      this.scene.tweens.add({
        targets: this.dot,
        scaleX: this.stationaryScale * 1.2,
        scaleY: this.stationaryScale * 1.2,
        duration: 140,
        ease: "Sine.easeOut",
        onComplete: () => {
          // 2) shrink down to the small moving size
          this.scene.tweens.add({
            targets: this.dot,
            scaleX: this.movingScale,
            scaleY: this.movingScale,
            duration: 220,
            ease: "Sine.easeInOut",
            onComplete: () => {
              this.isPopping = false;
              if (this.isActive) {
                this.startPulse();
              }
            },
          });
        },
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
      // MISS
      const brightness = this.dot.alpha;
      this.scene.tweens.add({
        targets: this.dot,
        alpha: {
          from: brightness,
          to: Math.max(this.minAlpha, brightness - 0.18),
        },
        duration: 110,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    }
  }

  bumpDifficulty() {
    // Gentle ramp: still noticeably harder, but not brutal.
    this.brightDuration = Math.max(1100, this.brightDuration * 0.96);
    this.threshold = Math.min(0.82, this.threshold + 0.01);
    this.ghostChance = Math.min(0.25, this.ghostChance + 0.01);
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

    if (this.dot && this.pointerHandler) {
      this.dot.off("pointerdown", this.pointerHandler);
    }

    if (this.particles) {
      this.particles.destroy();
    }
    if (this.dot) this.dot.destroy();
  }
}
