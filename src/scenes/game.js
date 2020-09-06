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
import { RadToDeg, DegToRad }  from 'phaser/src/math/'; 
import { Normalize, Wrap }  from 'phaser/src/math/angle/'; 

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
    }
    preload() {
        this.load.image('cat_eyes', catEyesImg);
        this.load.image('demon_eye', demonEyeImg);
        this.load.image('flame_demon', flameDemonImg);
        this.load.image('sound_on', soundOnImg);
        this.load.image('sound_off', soundOffImg);
        this.load.image('frozen_skull', frozenSkullImg);

        this.load.atlas('ghost_warrior', ghostWarriorSpriteSheet, ghostWarriorJSON);

        this.load.audio('demon_theme', 'src/assets/sound/demon_lord.mp3');
    }
    create() {
        this.make.tileSprite({
            key: 'cat_eyes',
            x: 0,
            y: 0,
            width: this.cameras.main.width * 4,
            scale: { x: 0.5, y: 0.5 },
        });

        this.make.tileSprite({
            key: 'cat_eyes',
            x: 0,
            y: 600,
            width: this.cameras.main.width * 4,
            scale: { x: 0.5, y: 0.5 },
        });

        this.make.tileSprite({
            key: 'cat_eyes',
            x: 0,
            y: 300,
            width: this.cameras.main.width,
            scale: { x: 0.5, y: 0.5 },
        });

        this.make.tileSprite({
            key: 'cat_eyes',
            x: 800,
            y: 300,
            width: this.cameras.main.width,
            scale: { x: 0.5, y: 0.5 },
        });

        this.input.mouse.disableContextMenu();

        //* Create the animations
		this.createAnimation('fly', 'ghost_warrior', 'fly', 1, 5, '.png', true, -1);
		this.createAnimation('attack', 'ghost_warrior', 'Attack', 1, 11, '.png', false, 0);
		this.createAnimation('idle', 'ghost_warrior', 'idle', 1, 5, '.png', true, -1);
		this.createAnimation('hit', 'ghost_warrior', 'hit', 1, 6, '.png', false, 0);
        this.createAnimation('death', 'ghost_warrior', 'death', 1, 8, '.png', false, 0);
        
        //* Ice Skull
		this.skull = this.make.image({
			key: 'frozen_skull',
			x: 0,
			y: 0,
			scale: { x: 1, y: 1 },
            origin: { x: 1, y: 1 }
        }).setInteractive();
        Phaser.Display.Align.In.Center(this.skull, this.add.zone(400, 300, 800, 600));

        this.circle = new Phaser.Curves.Path(500, 300).circleTo(100);

        var graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff, 1);
        this.circle.draw(graphics, 128);
        
        //* Ghost Warrior
        this.player = new Player({ world: this.matter.world, x: 400, y: 150, key: 'ghost_warrior' });
        this.player.setAngle(this.position * 360);
        Phaser.Display.Align.In.Center(this.player, this.add.zone(400, 300, 800, 600));
        this.player.anims.play('fly');
        this.player.on('animationcomplete', this.animComplete, this);
        Phaser.Display.Align.In.TopCenter(this.player, this.skull);

        var p = this.circle.getPoint(this.position);
        this.player.setPosition(p.x, p.y);

        //* Eye Balls
        this.enemy = new Enemy({ world: this.matter.world, x: 350, y: 50, key: 'demon_eye' });
        this.enemy.body.angle = Math.atan2(this.enemy.y - this.player.y, this.enemy.x - this.player.x);
        
        //* Sound Effects
		this.soundOn = this.make.image({
			key: 'sound_on',
			x: 800,
			y: 110,
			scale: { x: 0.5, y: 0.5 },
            origin: { x: 1, y: 1 }
        }).setInteractive();
        
		this.soundOff = this.make.image({
			key: 'sound_off',
			x: 800,
			y: 110,
			scale: { x: 0.5, y: 0.5 },
            origin: { x: 1, y: 1 }
        }).setInteractive();

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

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            console.log(bodyA, bodyB);
            bodyA.gameObject.setTint(0xff0000);
            bodyB.gameObject.setTint(0x00ff00);
        });
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
                this.player.setFlipY(this.position < .25 || this.position > .75);
            }
            this.enemy.x = -(0.05 * this.accumMS * Math.cos(this.enemy.angle + Math.PI / 2)) + this.enemy.x;
            this.enemy.y = -(0.05 * this.accumMS * Math.sin(this.enemy.angle + Math.PI / 2)) + this.enemy.y;

            if (this.isEnemyNear(this.enemy, this.player)) {
                this.enemy.setAlpha();
            }
		}

		while (this.accumMS >= this.hzMS) {
			this.accumMS -= this.hzMS;
		}
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
    onToggleSound(pointer, x, y, event) {
        event.stopPropagation();
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
    moveForward(object) {
        object.x = 2 * Math.cos(angleOfAttack) + this.x;
        object.y = 2 * Math.sin(angleOfAttack) + this.y;
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