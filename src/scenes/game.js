// Images
import catEyesImg from '../assets/cateyesbg.png';
import demonEyeImg from '../assets/demon-eye.png';
import flameDemonImg from '../assets/Flame_Demon_ Evolved.png';
import soundOnImg from '../assets/white_soundOn.png';
import soundOffImg from '../assets/white_soundOff.png';
import frozenSkullImg from '../assets/frozen_skull2.png';
//* Spritesheets
import ghostWarriorSpriteSheet from '../assets/spritesheets/ghost-warrior.png';
import ghostWarriorJSON from '../assets/spritesheets/ghost-warrior.json';
// Game Objects
import Player from '../game-objects/player';
import Enemy from '../game-objects/enemy';
//* Physics
import ghostWarriorShape from '../assets/PhysicsEditor/ghost_warrior.json';
import { RadToDeg, DegToRad, Between }  from 'phaser/src/math/'; 
import { Normalize, Wrap }  from 'phaser/src/math/angle/'; 
import { v4 as uuidv4 } from 'uuid';

class playGame extends Phaser.Scene {
    constructor () {
        super('playGame');
    }
    init() {
		this.accumMS = 0;
        this.hzMS = (1 / 60) * 1000;
        this.position = 0.5;
        this.step = 0.01;
        this.afk = false;
        this.level = 0;
        this.levels = [
            {
                targets: 10,
                minDelay: 1000,
                maxDelay: 2000,
                speed: 4000
            },
            {

            },
            {

            },
        ];
        this.enemies = {};
    }
    preload() {
        this.load.image('cat_eyes', catEyesImg);
        this.load.image('demon_eye', demonEyeImg);
        this.load.image('flame_demon', flameDemonImg);
        this.load.image('sound_on', soundOnImg);
        this.load.image('sound_off', soundOffImg);
        this.load.image('frozen_skull', frozenSkullImg);

        this.load.json('ghost_warrior_shapes', ghostWarriorShape);

        this.load.atlas('ghost_warrior', ghostWarriorSpriteSheet, ghostWarriorJSON);

        this.load.audio('demon_theme', 'src/assets/sound/demon_lord.mp3');
    }
    create() {
        this.make.tileSprite({ key: 'cat_eyes', x: 0, y: 0, width: this.cameras.main.width * 4, scale: { x: 0.5, y: 0.5 } });
        this.make.tileSprite({ key: 'cat_eyes', x: 0, y: 600, width: this.cameras.main.width * 4, scale: { x: 0.5, y: 0.5 } });
        this.make.tileSprite({ key: 'cat_eyes', x: 0, y: 300, width: this.cameras.main.width, scale: { x: 0.5, y: 0.5 }, });
        this.make.tileSprite({ key: 'cat_eyes', x: 800, y: 300, width: this.cameras.main.width, scale: { x: 0.5, y: 0.5 } });

        this.input.mouse.disableContextMenu();

        //* Create the animations
		this.createAnimation('fly', 'ghost_warrior', 'fly', 1, 5, '.png', true, -1);
		this.createAnimation('attack', 'ghost_warrior', 'Attack', 1, 11, '.png', false, 0);
		this.createAnimation('idle', 'ghost_warrior', 'idle', 1, 5, '.png', true, -1);
		this.createAnimation('hit', 'ghost_warrior', 'hit', 1, 6, '.png', false, 0);
        this.createAnimation('death', 'ghost_warrior', 'death', 1, 8, '.png', false, 0);
        
        //* Ice Skull
		this.skull = this.make.image({ key: 'frozen_skull', x: 0, y: 0, scale: { x: 1, y: 1 }, origin: { x: 1, y: 1 } }).setInteractive();
        Phaser.Display.Align.In.Center(this.skull, this.add.zone(400, 300, 800, 600));

        this.circle = new Phaser.Curves.Path(500, 300).circleTo(100);

        var graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff, 1);
        this.circle.draw(graphics, 128);
        
        var shapes = this.cache.json.get('ghost_warrior_shapes');
        //* Ghost Warrior
        this.player = new Player({ world: this.matter.world, x: 400, y: 150, key: 'ghost_warrior', shape: shapes.main_body });
        this.player.setAngle(this.position * 360);
        Phaser.Display.Align.In.Center(this.player, this.add.zone(400, 300, 800, 600));
        this.player.on('animationcomplete', this.animComplete, this);
        Phaser.Display.Align.In.TopCenter(this.player, this.skull);

        //* Sound Effects
		this.soundOn = this.make.image({ key: 'sound_on', x: 800, y: 110, scale: { x: 0.5, y: 0.5 }, origin: { x: 1, y: 1 }}).setInteractive();
		this.soundOff = this.make.image({ key: 'sound_off', x: 800, y: 110, scale: { x: 0.5, y: 0.5 }, origin: { x: 1, y: 1 }}).setInteractive();

        this.soundOn.on('pointerdown', this.onToggleSound, this);
        this.soundOff.on('pointerdown', this.onToggleSound, this);  

        this.music = this.sound.add('demon_theme');
        this.music.play();
        
		this.input.on('pointerdown', function(pointer) {
			if (pointer.leftButtonDown() && !this.player.isAttacking()) {
                this.player.anims.play('attack');
			}
        }, this);
        
		document.addEventListener("mouseout", () => {
            this.player.anims.play('idle');
            this.afk = true;
		});
		document.addEventListener("mouseenter", () => {
            this.player.anims.play('fly');
            this.afk = false;
        });
        
        this.matter.world.on('collisionactive', function (event, bodyA, bodyB) {
        }, this);

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            this.enemies[bodyB.label].tween.remove();
            this.enemies[bodyB.label].destroy();
        }, this);

        this.matter.world.on('collisionend', function (event, bodyA, bodyB) {
        }, this);

        this.initEnemies();
    }
    update(time, delta) {
        this.accumMS += delta;
		if (this.accumMS >= this.hzMS) {
            if (!this.player.isAttacking() && !this.afk && this.distanceTo(this.skull, this.input.activePointer) > 100) {
                var { x, y } = this.circle.getPoint(this.position);
                const { worldX, worldY } = this.input.activePointer;

                const angle = Math.atan2(worldY - y, worldX - x);
                const newAngle = Math.round(RadToDeg(Normalize(Wrap(angle))));

                this.position = Math.round((newAngle / 360 + Number.EPSILON) * 100) / 100;
                this.player.rotation = DegToRad(newAngle + 180);
                
                const p = this.circle.getPoint(this.position);
                this.player.setPosition(p.x, p.y);

                let isRight = this.position < .25 || this.position > .75;
                this.player.setFlipY(isRight);
            } else {
                const p = this.circle.getPoint(this.position);
                this.player.setPosition(p.x, p.y);    
            }
		}
		while (this.accumMS >= this.hzMS) {
			this.accumMS -= this.hzMS;
		}
    }
    initEnemies() {
        var delay = 0;
        const { minDelay, maxDelay, speed, targets } = this.levels[this.level];
        for (let i = 0; i < targets; i++) {
            let side = Math.floor(Math.random() * 4 + 1);
            const { x, y } = this.getRandomCoordinates(side);

            const key = uuidv4();
            this.enemies[key] = new Enemy({ world: this.matter.world, x, y, key: 'demon_eye', label: key });
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
        if (position === 1) {
            return { x: Between(0, 800), y: 0 };
        }
        else if (position === 2) {
            return { x: 0, y: Between(0, 600) };
        }
        else if (position === 3) {
            return { x: Between(0, 800), y: 600 };
        }
        else if (position === 4) {
            return { x: 0, y: Between(0, 600) };
        }
        return { x: Between(0, 800), y: 0 };
    }
    createAnimation (key, name, prefix, start, end, suffix, yoyo, repeat) {
		this.anims.create({
			key: key,
            frames: this.anims.generateFrameNames(name, { prefix, start, end, suffix }),
            frameRate: 10,
            yoyo,
            repeat
        });
    }
    animComplete(animation, frame) {
        this.player.anims.play('fly');
    }
    onToggleSound(pointer, x, y, e) {
        e.stopPropagation();
        if (this.soundOn.active) {
            this.soundOn.setActive(false).setVisible(false);
            this.soundOff.setActive(true).setVisible(true);
            this.music.stop();
        }
        else if (this.soundOff.active) {
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
