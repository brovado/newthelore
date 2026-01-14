import { SPRITE_FRAME_H, SPRITE_FRAME_W } from "./GameScene.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("bg", "src/assets/city_background.png");
    this.load.image("platforms", "src/assets/platforms.png");
    this.load.spritesheet("player", "src/assets/sprite.png", {
      frameWidth: SPRITE_FRAME_W,
      frameHeight: SPRITE_FRAME_H,
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
