export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const SPRITE_FRAME_WIDTH = 256;
    const SPRITE_FRAME_HEIGHT = 256;
    // Adjust frame sizes here if the sprite sheet framing looks off.

    this.load.image("bg", "src/assets/city_background.png");
    this.load.image("platforms", "src/assets/platforms.png");
    this.load.spritesheet("player", "src/assets/sprite.png", {
      frameWidth: SPRITE_FRAME_WIDTH,
      frameHeight: SPRITE_FRAME_HEIGHT,
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
