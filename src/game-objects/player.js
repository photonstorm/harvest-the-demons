export default class Player extends Phaser.Physics.Matter.Sprite {
	constructor (config) {
        super(config.world, config.x, config.y, config.key);
        
	    this.body.isStatic = true;
		this.body.ignoreGravity = true;

		this.setPosition(config.x, config.y);

	    this.scene.add.existing(this);
	}
}