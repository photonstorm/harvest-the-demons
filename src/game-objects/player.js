import { assetsDPR } from "../index";

export default class Player extends Phaser.Physics.Matter.Sprite {
	constructor (config) {
		super(config.world, config.x, config.y, config.key, null, { shape: config.shape });

		this.body.label = 'player';

		this.body.ignoreGravity = true;
		this.body.immovable = true;
		this.setMass(1000);

		this.setAlpha();
		this.setScale(0.5 * assetsDPR);

		this.anims.play('fly');

		this.setPosition(config.x, config.y);

	    this.scene.add.existing(this);
	}
	isAttacking() {
		return this.anims.currentAnim.key === 'attack';
	}
}