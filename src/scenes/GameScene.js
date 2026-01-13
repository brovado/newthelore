import { createUI } from "../ui/domUI.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.speed = 180;
    this.arrivalRadius = 10;
    this.autoMove = false;
    this.target = null;

    this.drawBackground();

    this.player = this.add.circle(480, 270, 12, 0x4ade80);
    this.player.setStrokeStyle(2, 0x0f172a);

    this.targetMarker = this.add.circle(0, 0, 6, 0xf97316);
    this.targetMarker.setVisible(false);

    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    });

    this.input.on("pointerdown", (pointer) => {
      this.target = { x: pointer.worldX, y: pointer.worldY };
      this.targetMarker.setPosition(this.target.x, this.target.y);
      this.targetMarker.setVisible(true);
    });

    const container = document.getElementById("game-container");
    this.ui = createUI({
      container,
      initialAutoMove: this.autoMove,
      onToggle: (state) => {
        this.autoMove = state;
      },
    });

    this.events.on("shutdown", () => {
      if (this.ui) {
        this.ui.destroy();
      }
    });
  }

  drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0b0d12, 1);
    graphics.fillRect(0, 0, this.scale.width, this.scale.height);

    graphics.lineStyle(1, 0x1f2937, 0.7);
    const gridSize = 48;
    for (let x = 0; x <= this.scale.width; x += gridSize) {
      graphics.lineBetween(x, 0, x, this.scale.height);
    }
    for (let y = 0; y <= this.scale.height; y += gridSize) {
      graphics.lineBetween(0, y, this.scale.width, y);
    }
  }

  update(_, delta) {
    const deltaSeconds = delta / 1000;
    let distance = 0;

    if (this.autoMove && this.target) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      distance = Math.hypot(dx, dy);

      if (distance > this.arrivalRadius) {
        const directionX = dx / distance;
        const directionY = dy / distance;
        this.player.x += directionX * this.speed * deltaSeconds;
        this.player.y += directionY * this.speed * deltaSeconds;
      }
    } else {
      const inputX = (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0);
      const inputY = (this.keys.down.isDown ? 1 : 0) - (this.keys.up.isDown ? 1 : 0);
      const length = Math.hypot(inputX, inputY);

      if (length > 0) {
        const dirX = inputX / length;
        const dirY = inputY / length;
        this.player.x += dirX * this.speed * deltaSeconds;
        this.player.y += dirY * this.speed * deltaSeconds;
      }

      if (this.target) {
        distance = Math.hypot(this.target.x - this.player.x, this.target.y - this.player.y);
      }
    }

    this.ui.updateDebug({
      autoMove: this.autoMove,
      player: { x: this.player.x, y: this.player.y },
      target: this.target,
      distance,
    });
  }
}
