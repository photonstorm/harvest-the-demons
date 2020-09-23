// Images
import backgroundImg from "../assets/images/background.jpg";
import demonEyeImg from "../assets/images/demon-eye.png";
import soundOnImg from "../assets/images/white_soundOn.png";
import soundOffImg from "../assets/images/white_soundOff.png";
import skullImg from "../assets/images/skull.png";
//* Spritesheets
import eyeballsSpriteSheet from "../assets/spritesheets/eyeballs.png";
import eyeballsJSON from "../assets/spritesheets/eyeballs.json";
import ghostWarriorSpriteSheet from "../assets/spritesheets/ghost-warrior.png";
import ghostWarriorJSON from "../assets/spritesheets/ghost-warrior.json";
// Game Objects
import Player from "../game-objects/player";
import Enemy from "../game-objects/enemy";
import Skull from "../game-objects/skull";
//* Physics
import ghostWarriorShape from "../assets/PhysicsEditor/ghost_warrior.json";
import skullShape from "../assets/PhysicsEditor/skull.json";
import { RadToDeg, DegToRad, Between } from "phaser/src/math/";
import { Normalize, Wrap } from "phaser/src/math/angle/";
import { v4 as uuidv4 } from "uuid";
import { assetsDPR, WIDTH } from "..";
import { alignGrid } from "../assets/configs/alignGrid";

class playGame extends Phaser.Scene {
  constructor() {
    super("playGame");
  }
  init({ level }) {
    this.accumMS = 0;
    this.hzMS = (1 / 60) * 1000;
    this.position = 0.5;
    this.step = 0.01;
    this.afk = false;
    this.level = level || 0;
    this.score = 0;
    this.lives = 5;
    this.maxDistance = this.game.config.height / 8;
    this.best = localStorage.getItem("best_score") ? parseInt(localStorage.getItem("best_score"), 10) : 0;
    this.levels = [
      {
        targets: 10,
        minDelay: 1000,
        maxDelay: 2000,
        speed: 4000,
      },
      {
        targets: 10,
        minDelay: 1000,
        maxDelay: 2000,
        speed: 4000,
      },
      {
        targets: 10,
        minDelay: 1000,
        maxDelay: 2000,
        speed: 4000,
      },
    ];
    this.enemies = {};
    this.remainingTargets = this.levels[this.level].targets;
  }

  preload() {
    this.load.image("background", backgroundImg);
    this.load.image("demon_eye", demonEyeImg);
    this.load.image("sound_on", soundOnImg);
    this.load.image("sound_off", soundOffImg);
    this.load.image("skull", skullImg);

    this.load.json("ghost_warrior_shapes", ghostWarriorShape);
    this.load.json("skull_shapes", skullShape);

    this.load.atlas("ghost_warrior", ghostWarriorSpriteSheet, ghostWarriorJSON);
    this.load.atlas("eyeballs", eyeballsSpriteSheet, eyeballsJSON);

    this.load.audio("eye_kill", "src/assets/sound/industrial_tools_axe_chop_wood_009.mp3");
    this.load.audio("axe_swing", "src/assets/sound/zapsplat_warfare_weapon_axe_large_object_swing_swoosh_002.mp3");
    this.load.audio("player_damaged", "src/assets/sound/horror_monster_zombie_male_groan_005.mp3");

    alignGrid.create({ scene: this, rows: 10, columns: 10 });
    // Uncomment to see UI grid
    // alignGrid.showNumbers();
  }
  create() {

    //* Create the animations
    this.createAnimation("fly", "ghost_warrior", "fly", 1, 5, ".png", true, -1, 10);
    this.createAnimation("attack", "ghost_warrior", "Attack", 1, 11, ".png", false, 0, 20);
    this.createAnimation("idle", "ghost_warrior", "idle", 1, 5, ".png", true, -1, 10);
    this.createAnimation("hit", "ghost_warrior", "hit", 1, 6, ".png", false, 0, 20);
    this.createAnimation("death", "ghost_warrior", "death", 1, 8, ".png", false, 30);
    this.createAnimation("eye_twitch", "eyeballs", "eyeball", 1, 5, ".png", false, -1, 3);

    this.make.image({
      key: "background",
      x: 0,
      y: 0,
      width: this.cameras.main.width * assetsDPR * 4,
      origin: { x: 0, y: 0 },
      scale: { x: 1.5, y: 1.5 },
    });

    //* Top
    this.make.sprite({
      key: "eyeballs",
      x: 0,
      y: 0,
      flipY: true,
      width: this.cameras.main.width * assetsDPR * 4,
      origin: { x: 0, y: 0 },
      scale: { x: 2.5, y: 2.5 },
    }).play('eye_twitch');

    //* Right
    this.make.sprite({
      key: "eyeballs",
      x: this.cameras.main.width - this.cache.json.get("eyeballs").textures[0].size.h,
      y: 0,
      flipX: true,
      height: this.cameras.main.height * assetsDPR,
      rotation: -Math.PI / 2,
      origin: { x: 1, y: 0 },
      scale: { x: 3, y: 5 },
    }).play('eye_twitch');

    //* Bottom
    this.make.sprite({
      key: "eyeballs",
      x: 0,
      y: this.cameras.main.height,
      width: this.cameras.main.width * assetsDPR,
      origin: { x: 0, y: 1 },
      scale: { x: 2.5, y: 2.5 },
    }).play('eye_twitch');

    //* Left
    this.make.sprite({
      key: "eyeballs",
      x: this.cache.json.get("eyeballs").textures[0].size.h,
      y: 0,
      flipX: true,
      height: this.cameras.main.height * assetsDPR,
      rotation: Math.PI / 2,
      origin: { x: 0, y: 0 },
      scale: { x: 3, y: 5 },
    }).play('eye_twitch');

    this.input.mouse.disableContextMenu();

    const circleX = this.game.config.width / 2 + assetsDPR * 50;
    const circleY = this.game.config.height / 2;
    const circleR = 50 * assetsDPR;

    this.circle = new Phaser.Curves.Path(circleX, circleY).circleTo(circleR);

    var graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 1);
    this.circle.draw(graphics, 128);

    //* Skull
    this.skull = new Skull({ world: this.matter.world, x: 0, y: 0, key: "skull", shape: this.cache.json.get("skull_shapes").skull, circleX, circleY, circleR });

    alignGrid.center(this.skull);

    //* Ghost Warrior
    var shapes = this.cache.json.get("ghost_warrior_shapes");
    this.player = new Player({ world: this.matter.world, x: 400, y: 150, key: "ghost_warrior", shape: shapes.main_body });
    this.player.setAngle(this.position * 360);
    Phaser.Display.Align.In.Center(this.player, this.add.zone(400, 300, 800, 600));
    this.player.on("animationcomplete", this.animComplete, this);
    Phaser.Display.Align.In.TopCenter(this.player, this.skull);

    this.scoreText = this.add.text(0, 0, `${this.score}`, { fontSize: 16 * assetsDPR }).setOrigin(0.5, 0.5);
    alignGrid.placeAtIndex(0, this.scoreText);

    //* Sound Effects
    this.soundOn = this.make.image({
      key: "sound_on",
      x: this.game.config.width,
      y: 100,
      scale: { x: 0.5, y: 0.5 },
      origin: { x: 1, y: 1 },
    }).setInteractive();
      
    this.soundOff = this.make.image({
      key: "sound_off",
      x: this.game.config.width,
      y: 100,
      scale: { x: 0.5, y: 0.5 },
      origin: { x: 1, y: 1 },
    }).setInteractive();

    this.soundOn.on("pointerdown", this.onToggleSound, this);
    this.soundOff.on("pointerdown", this.onToggleSound, this);

    this.sound.volume = 0.5;

    this.input.on("pointerdown", function (pointer) {
      if (pointer.leftButtonDown() && !this.player.isAttacking()) {
        this.player.anims.play("attack");
      }
    }, this);

    document.addEventListener("mouseout", () => {
      this.player.anims.play("idle");
      this.afk = true;
    });
    document.addEventListener("mouseenter", () => {
      this.player.anims.play("fly");
      this.afk = false;
    });

    this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
    }, this);

    this.matter.world.on("collisionstart", function (event, bodyA, bodyB) {
      if (bodyA.label === "skull" && bodyB.label.length <= 5) return;
      if (bodyA.label === 'axe' && !this.afk) {
        this.killEnemy(bodyB.label);
        this.score++;
        this.scoreText.setText(`${this.score}`);
        this.sound.play("eye_kill");
      }
      else if (bodyA.label === 'body') {
        this.killEnemy(bodyB.label);
        this.player.anims.play("hit");
        this.sound.play("player_damaged");
      }
      //! Melee frames 8 - 12
      //* Check the current frame 
      else if (Boolean(this.player.anims.currentFrame.textureFrame.match(/attack[8-9]|attack1[02]/gi))) {
        this.killEnemy(bodyB.label);
        this.score++;
        this.scoreText.setText(`${this.score}`);
        this.sound.play("eye_kill");
      }
      if (this.remainingTargets === 0) {
        this.roundOver();
      }
    }, this);

    this.matter.world.on("collisionend", function (event, bodyA, bodyB) {
    }, this);

    this.player.on("animationupdate-attack", this.test, this);

    this.initEnemies();

    this.cameras.main.fadeIn(500);
  }
  test(animation, animationFrame) {
    const { index } = animationFrame;
    if (index === 8) this.sound.play("axe_swing");
  }
  update(time, delta) {
    this.accumMS += delta;
    if (this.accumMS >= this.hzMS) {
      const distance = this.distanceTo(this.player, this.input.activePointer);
      if (!this.player.isAttacking() && !this.afk && distance > this.maxDistance) {
        var { x, y } = this.circle.getPoint(this.position);
        let { worldX, worldY } = this.input.activePointer;

        const angle = Math.atan2(worldY - y, worldX - x);
        const newAngle = RadToDeg(Normalize(Wrap(angle)));

        this.position = newAngle / 360;
        this.player.rotation = DegToRad(newAngle + 180);

        const p = this.circle.getPoint(this.position);
        this.player.setPosition(p.x, p.y);
      }
    }
    while (this.accumMS >= this.hzMS) {
      this.accumMS -= this.hzMS;
    }
  }
  roundOver() {
    if (this.score > this.best) {
      localStorage.setItem("best_score", this.score);
      this.best = this.score;
    }
    // this.scene.start("scoreScene", { score: this.score, best: this.best, level: ++this.level });
  }
  killEnemy(label) {
    this.enemies[label].tween.remove();
    this.enemies[label].destroy();
  }
  initEnemies() {
    var delay = 0;
    const { minDelay, maxDelay, speed, targets } = this.levels[this.level];
    for (let i = 0; i < targets; i++) {
      let side = Math.floor(Math.random() * 4 + 1);
      const { x, y } = this.getRandomCoordinates(side);

      const key = uuidv4();
      this.enemies[key] = new Enemy({ world: this.matter.world, x, y, key: "demon_eye", label: key });
      this.enemies[key].body.angle = Math.atan2(y - this.player.y, x - this.player.x);
      delay += Between(minDelay, maxDelay);

      this.enemies[key].tween = this.tweens.add({
        targets: this.enemies[key],
        visible: {
          from: true,
        },
        x: {
          from: x,
          to: this.skull.x,
        },
        y: {
          from: y,
          to: this.skull.y,
        },
        alpha: {
          start: 0,
          from: 0,
          to: 1,
        },
        delay,
        duration: speed,
      });
    }
  }
  getRandomCoordinates(position) {
    //* Top
    if (position === 1) {
      return { x: Between(0, this.cameras.main.width), y: 0 };
    }
    //* Left
    else if (position === 2) {
      return { x: 0, y: Between(0, this.cameras.main.height) };
    }
    //* Bottom
    else if (position === 3) {
      return { x: Between(0, this.cameras.main.width), y: this.cameras.main.height };
    }
    //* Right
    else if (position === 4) {
      return { x: this.cameras.main.width, y: Between(0, this.cameras.main.height) };
    }
    return { x: Between(0, this.cameras.main.width), y: 0 };
  }
  createAnimation(key, name, prefix, start, end, suffix, yoyo, repeat, frameRate) {
    this.anims.create({
      key: key,
      frames: this.anims.generateFrameNames(name, {
        prefix,
        start,
        end,
        suffix,
      }),
      frameRate,
      yoyo,
      repeat,
    });
  }
  animComplete(animation, frame) {
    this.player.anims.play("fly");
  }
  onToggleSound(pointer, x, y, e) {
    e.stopPropagation();
    if (this.soundOn.active) {
      this.soundOn.setActive(false).setVisible(false);
      this.soundOff.setActive(true).setVisible(true);
      this.music.stop();
    } else if (this.soundOff.active) {
      this.soundOff.setActive(false).setVisible(false);
      this.soundOn.setActive(true).setVisible(true);
      this.music.play();
    }
  }
  isEnemyNear(source, target) {
    if (this.distanceTo(source, target) < 200) return true;
    return false;
  }
  distanceTo(source, target) {
    let dx = source.x - target.x;
    let dy = source.y - target.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

export default playGame;
