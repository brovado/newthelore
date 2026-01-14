import { createUI } from "../ui/domUI.js";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1000;
export const SPRITE_FRAME_W = 256;
export const SPRITE_FRAME_H = 256;
export const PLAYER_SCALE = 0.45;
const PREVIEW_SCALE = 0.18;

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
    this.player.setScale(PLAYER_SCALE);
    this.player.setSize(SPRITE_FRAME_W * 0.45, SPRITE_FRAME_H * 0.65, true);
    this.player.setOffset(SPRITE_FRAME_W * 0.28, SPRITE_FRAME_H * 0.2);

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
    this.createSpritePreview();

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
      frameWidth: SPRITE_FRAME_W,
      frameHeight: SPRITE_FRAME_H,
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
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x475569, 0.85);

    const platformRects = [
      { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 40, width: 1900, height: 80 },
      { x: 320, y: 740, width: 360, height: 70 },
      { x: 820, y: 640, width: 320, height: 64 },
      { x: 1220, y: 540, width: 280, height: 64 },
      { x: 1650, y: 740, width: 300, height: 70 },
      { x: 560, y: 480, width: 280, height: 60 },
      { x: 980, y: 420, width: 260, height: 60 },
    ];

    platformRects.forEach(({ x, y, width, height }) => {
      const body = this.add.zone(x, y, width, height);
      this.physics.add.existing(body, true);
      this.platforms.add(body);
      platformGraphics.fillRect(x - width / 2, y - height / 2, width, height);
    });
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

  createSpritePreview() {
    const previewStartX = 16;
    const previewStartY = 16;
    const frameSpacing = SPRITE_FRAME_W * PREVIEW_SCALE + 6;

    for (let i = 0; i < 8; i += 1) {
      this.add
        .sprite(previewStartX + i * frameSpacing, previewStartY, "player", i)
        .setOrigin(0, 0)
        .setScale(PREVIEW_SCALE)
        .setScrollFactor(0)
        .setDepth(5);
    }
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
    const wantsJump =
      Phaser.Input.Keyboard.JustDown(this.jumpKey) || Phaser.Input.Keyboard.JustDown(this.keys.up);
    if (body && body.blocked.down && wantsJump) {
      this.player.setVelocityY(-420);
    }

    if (body && this.keys.down.isDown && !body.blocked.down) {
      this.player.setVelocityY(Math.max(body.velocity.y, 480));
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
      velocity: { x: this.player.body.velocity.x, y: this.player.body.velocity.y },
      frameWidth: SPRITE_FRAME_W,
      frameHeight: SPRITE_FRAME_H,
    });
  }
}
