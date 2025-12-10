export default class InductionArcadeScene extends Phaser.Scene {
  constructor() {
    super({ key: "InductionArcadeScene" });
    this.mode = "idle"; // 'idle' | 'arcade'
    this.externalEventHandler = null;
  }

  preload() {}

  create() {
    this.bgLayer = this.add.container(0, 0);
    this.gameLayer = this.add.container(0, 0);

    // idle background (or nothing at all)
    this.createIdleBackground();

    // signal game is ready so initArcadeGame can grab the scene
    this.game.events.emit("ready");
  }

  createIdleBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.bgLayer.add(g);
  }

  setMode(mode, config = {}) {
    if (this.mode === mode) return;
    this.mode = mode;

    // clear existing minigame objects
    this.gameLayer.removeAll(true);

    if (mode === "idle") {
      // maybe a soft spiral or nothing
      return;
    }

    if (mode === "inductionArcade") {
      this.startArcade(config);
    }
  }

  startArcade(config) {
    // here you’ll start the first minigame (tapOnBright etc.)
    // for now, just draw a placeholder
    const c = this.add.circle(
      this.scale.width / 2,
      this.scale.height / 2,
      40,
      0x88aaff
    );
    c.setInteractive({ useHandCursor: true });
    c.on("pointerdown", () => {
      this.emitGameEvent("arcade/click", {});
    });
    this.gameLayer.add(c);
  }

  emitGameEvent(type, payload) {
    if (this.externalEventHandler) {
      this.externalEventHandler({ type, payload });
    }
  }

  update(time, delta) {
    if (this.mode === "idle") {
      // optionally animate a very subtle background
      return;
    }

    if (this.mode === "inductionArcade") {
      // drive spiral, minigame animations, etc.
    }
  }
}
