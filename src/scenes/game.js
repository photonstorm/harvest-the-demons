// Images
import backgroundImg from '../assets/cateyesbg.png';
import demonEyeImg from '../assets/demon-eye.png';
import devilImg from '../assets/devil-animation.gif';
import soundOnImg from '../assets/white_soundOn.png';
import soundOffImg from '../assets/white_soundOff.png';
// Game Objects
import Player from '../game-objects/player';

class playGame extends Phaser.Scene {
    constructor () {
        super('playGame');
    }
    init() {
		this.accumMS = 0;
		this.hzMS = (1 / 60) * 1000;
    }
    preload() {
        this.load.image('background', backgroundImg);
        this.load.image('demon_eye', demonEyeImg);
        this.load.image('devil', devilImg);
        this.load.image('sound_on', soundOnImg);
        this.load.image('sound_off', soundOffImg);

        this.load.audio('demon_theme', 'src/assets/sound/demon_lord.mp3');
    }
    create() {
		this.background = this.add.tileSprite(0, 0, this.cameras.main.width * 2, this.cameras.main.height * 2, 'background');

        this.player = new Player({ world: this.matter.world, x: 400, y: 150, key: 'devil' });

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

        Phaser.Display.Align.In.Center(this.player, this.add.zone(400, 300, 800, 600));        

        this.music = this.sound.add('demon_theme');
	    this.music.play();
    }
    update(time, delta) {
        this.accumMS += delta;

		if (this.accumMS >= this.hzMS) {
			var angle = Math.atan2(this.input.activePointer.worldY - this.player.y, this.input.activePointer.worldX - this.player.x) + Phaser.Math.DegToRad(90);

            this.player.body.angle = angle;
		}

		while (this.accumMS >= this.hzMS) {
			this.accumMS -= this.hzMS;
		}
    }
    onToggleSound() {
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
}

export default playGame;