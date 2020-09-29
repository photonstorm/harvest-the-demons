import { assetsDPR } from "../index";

export default class Player extends Phaser.Physics.Matter.Sprite {
	constructor (config) {
		super(config.world, config.x, config.y, config.key, null, { shape: config.shape });

		this.body.label = 'player';
		this.body.ignoreGravity = true;
		this.body.immovable = true;

		this.setMass(1000);
		this.setScale(0.5 * assetsDPR, 0.5 * assetsDPR);

		this.flipX = true;
        this.scene.matter.body.scale(this.body, -1, 1);
        this.scene.matter.body.setCentre(this.body, { x: 70, y: 150 }, false);

		this.anims.play('fly');

	    this.scene.add.existing(this);
	}
	isAttacking() {
		const { key } = this.anims.currentAnim;
		return key === 'attack' || key === 'hit';
	}
}