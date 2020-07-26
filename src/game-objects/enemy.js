export default class Enemy extends Phaser.Physics.Matter.Sprite {
	constructor (config) {
        super(config.world, config.x, config.y, config.key);

        this.setScale(0.04, 0.04);
        
	    this.body.isStatic = true;
		this.body.ignoreGravity = true;

		this.setPosition(config.x, config.y);

	    this.scene.add.existing(this);
	}
}