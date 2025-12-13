/*
/app/phaser/games/focus-exercise-game.js
Guides the player through a calming focus exercise with a pulsing white dot.
*/
// phaser/games/focus-exercise-game.js

const DOT_TEXTURE_KEY = "focusExerciseDot";

export default class FocusExerciseGame {
  constructor(scene, { onComplete, onSuccess }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onSuccess = onSuccess;

    this.isActive = true;
    this.pulseTween = null;
    this.instructionTimer = null;
    this.instructionLines = [
      "Focus on the dot",
      "Watch it pulse",
      "Breathe in while it grows",
      "Breathe out while it shrinks",
      "Breathing in being filled",
      "Breathing out letting go",
      "It feels good to focus",
      "You do not want to look away",
      "Breathing in being filled",
      "Breathing out letting go",
      "Very good",
    ];
    this.instructionIndex = 0;
    this.completedLoops = 0;
    this.targetLoops = 1;
    this.instructionDelayMs = 3000;

    const { width, height } = scene.scale;
    const radius = Math.round(Math.min(width, height) * 0.06);

    if (!scene.textures.exists(DOT_TEXTURE_KEY)) {
      const graphics = scene.add.graphics();
      const textureRadius = 80;
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(textureRadius, textureRadius, textureRadius);
      graphics.generateTexture(DOT_TEXTURE_KEY, textureRadius * 2, textureRadius * 2);
      graphics.destroy();
    }

    this.dot = scene.add.image(width / 2, height / 2, DOT_TEXTURE_KEY);
    this.dot.setDisplaySize(radius * 2, radius * 2);
    this.dot.setAlpha(1);
    scene.gameLayer.add(this.dot);

    this.baseScale = 1.1;
    this.maxBaseScale = 1.9;
    this.growMultiplier = 1.5;
    this.shrinkMultiplier = 1.25;

    this.instructionText = scene.add.text(width / 2, height * 0.8, "", {
      fontFamily: "Arial",
      fontSize: Math.round(Math.min(width, height) * 0.035),
      color: "#ffffff",
      align: "center",
    });
    this.instructionText.setOrigin(0.5, 0.5);
    this.instructionText.setAlpha(0.85);
    scene.gameLayer.add(this.instructionText);

    this.beginPulseCycle();
    this.startInstructionLoop();
  }

  beginPulseCycle() {
    if (!this.isActive) return;

    const growTarget = this.baseScale * this.growMultiplier;
    const shrinkTarget = this.baseScale * this.shrinkMultiplier;

    this.dot.setScale(shrinkTarget);

    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    this.pulseTween = this.scene.tweens.chain({
      targets: this.dot,
      tweens: [
        {
          scaleX: growTarget,
          scaleY: growTarget,
          duration: 1500,
          ease: "Sine.easeInOut",
        },
        {
          scaleX: shrinkTarget,
          scaleY: shrinkTarget,
          duration: 1500,
          ease: "Sine.easeInOut",
        },
      ],
      onComplete: () => {
        if (!this.isActive) return;
        const nextBase = Math.min(
          this.maxBaseScale,
          this.baseScale * 1.0125 + 0.0025,
        );
        this.baseScale = nextBase;
        this.beginPulseCycle();
      },
    });
  }

  startInstructionLoop() {
    if (!this.isActive) return;

    const handleInstruction = () => {
      if (!this.isActive) return;

      const line = this.instructionLines[this.instructionIndex];
      this.instructionText.setText(line);

      this.instructionIndex = (this.instructionIndex + 1) % this.instructionLines.length;
      if (this.instructionIndex === 0) {
        this.completedLoops += 1;
      }

      if (this.onSuccess) {
        this.onSuccess({ instruction: line });
      }

      if (this.completedLoops >= this.targetLoops) {
        this.finishExercise();
        return;
      }

      this.instructionTimer = this.scene.time.addEvent({
        delay: this.instructionDelayMs,
        callback: handleInstruction,
      });
    };

    handleInstruction();
  }

  finishExercise() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    if (this.instructionTimer) {
      this.instructionTimer.remove();
      this.instructionTimer = null;
    }

    if (this.onComplete) {
      this.onComplete({ loopsCompleted: this.completedLoops });
    }
  }

  update() {}

  destroy() {
    this.isActive = false;
    if (this.pulseTween) this.pulseTween.stop();
    if (this.instructionTimer) this.instructionTimer.remove();

    if (this.instructionText) this.instructionText.destroy();
    if (this.dot) this.dot.destroy();
  }
}
