import { createUI } from "../ui/domUI.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;
const SPRITE_FRAME_WIDTH = 256;
const SPRITE_FRAME_HEIGHT = 256;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.speed = 220;
    this.arrivalRadius = 10;
    this.autoMove = false;
    this.target = null;

    this.drawBackground();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.createPlatforms();

    this.player = this.physics.add.sprite(160, 200, "player", 0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(SPRITE_FRAME_WIDTH * 0.4, SPRITE_FRAME_HEIGHT * 0.6, true);
    this.player.setOffset(SPRITE_FRAME_WIDTH * 0.3, SPRITE_FRAME_HEIGHT * 0.2);

    this.physics.add.collider(this.player, this.platforms);

    this.targetMarker = this.add.circle(0, 0, 6, 0xf97316);
    this.targetMarker.setVisible(false);

    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    });
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.createAnimations();

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

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  drawBackground() {
    const camera = this.cameras.main;
    const bgTexture = this.textures.get("bg").getSourceImage();
    const scale = Math.max(camera.width / bgTexture.width, camera.height / bgTexture.height);

    this.background = this.add
      .image(camera.width / 2, camera.height / 2, "bg")
      .setScrollFactor(0)
      .setScale(scale)
      .setDepth(-10);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    const crops = {
      wide: { x: 0, y: 768, w: 512, h: 128 },
      medium: { x: 512, y: 768, w: 384, h: 128 },
      small: { x: 896, y: 768, w: 256, h: 128 },
      thin: { x: 1152, y: 768, w: 256, h: 96 },
    };

    const createPlatform = ({ x, y, width, height, crop }) => {
      const platform = this.platforms.create(x, y, "platforms");
      platform.setCrop(crop.x, crop.y, crop.w, crop.h);
      platform.setDisplaySize(width, height);
      platform.refreshBody();
      return platform;
    };

    createPlatform({
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT - 40,
      width: 1600,
      height: 80,
      crop: crops.wide,
    });

    createPlatform({ x: 340, y: 720, width: 360, height: 70, crop: crops.medium });
    createPlatform({ x: 850, y: 620, width: 320, height: 64, crop: crops.small });
    createPlatform({ x: 1250, y: 520, width: 280, height: 64, crop: crops.thin });
    createPlatform({ x: 1650, y: 720, width: 300, height: 70, crop: crops.medium });
    createPlatform({ x: 560, y: 460, width: 280, height: 60, crop: crops.small });
  }

  createAnimations() {
    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    this.player.play("idle");
  }

  update(_, delta) {
    let distance = 0;

    if (this.autoMove && this.target) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      distance = Math.hypot(dx, dy);

      const directionX = Math.sign(dx);
      if (Math.abs(dx) > this.arrivalRadius) {
        this.player.setVelocityX(directionX * this.speed);
      } else {
        this.player.setVelocityX(0);
      }
    } else {
      const inputX = (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0);
      this.player.setVelocityX(inputX * this.speed);

      if (this.target) {
        distance = Math.hypot(this.target.x - this.player.x, this.target.y - this.player.y);
      }
    }

    const body = this.player.body;
    if (body && body.blocked.down && Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      this.player.setVelocityY(-420);
    }

    const isMoving = Math.abs(this.player.body.velocity.x) > 5;
    if (isMoving) {
      this.player.setFlipX(this.player.body.velocity.x < 0);
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
        this.player.play("walk");
      }
    } else if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "idle") {
      this.player.play("idle");
    }

    this.ui.updateDebug({
      autoMove: this.autoMove,
      player: { x: this.player.x, y: this.player.y },
      target: this.target,
      distance,
    });
  }
}
