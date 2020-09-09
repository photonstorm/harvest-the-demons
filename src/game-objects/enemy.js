import { assetsDPR } from "..";

export default class Enemy extends Phaser.Physics.Matter.Sprite {
	constructor (config) {
        super(config.world, config.x, config.y, config.key);

		this.setScale(1 / assetsDPR, 1 / assetsDPR);

		this.body.label = config.label;

		this.body.isStatic = true;
		this.body.ignoreGravity = true;
		// this.setSensor(true);

		this.setPosition(config.x, config.y);

	    this.scene.add.existing(this);
	}
}