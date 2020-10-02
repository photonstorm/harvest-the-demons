import { assetsDPR } from "../index";

export default class Player
{
	constructor (scene, config)
	{
        this.scene = scene;

        this.x = config.x;
        this.y = config.y;

		this.left = scene.matter.add.sprite(config.x, config.y, config.key, null, { shape: config.shape, render: { sprite: { xOffset: 0.50, yOffset: 0 } } });
		this.right = scene.matter.add.sprite(config.x, config.y, config.key, null, { shape: config.shape });

		this.right.setVisible(false);

		this.left.body.label = 'player';
		this.right.body.label = 'player';

		this.left.body.ignoreGravity = true;
		this.right.body.ignoreGravity = true;

		this.left.setMass(1000);
		this.right.setMass(1000);

		this.left.setScale(0.5 * assetsDPR, 0.5 * assetsDPR);
		this.right.setScale(0.5 * assetsDPR, 0.5 * assetsDPR);

		//	Just the one listener:
	    this.left.on("animationupdate-attack", this.onMeleeAnimation, this);
	    this.left.on("animationcomplete", this.animComplete, this);

	    this.right.flipX = true;

		this.scene.matter.body.scale(this.right.body, -1, 1);
		this.scene.matter.body.setCentre(this.right.body, { x: 70, y: 150 }, false);
		this.scene.matter.body.setCentre(this.left.body, { x: 340, y: 0 }, true);

		this.left.play('fly');
		this.right.play('fly');

	    this.midLine = new Phaser.Geom.Line();
	    this.reflectedLine = new Phaser.Geom.Line();

		// this.debug = this.scene.add.graphics();
		// this.debugT = this.scene.add.text(32, 32).setFontSize(32);
	}

	attack ()
	{
		if (!this.isAttacking())
		{
	        this.left.play("attack");
	        this.right.play("attack");
		}
	}

	idle ()
	{
		this.left.play("idle");
		this.right.play("idle");
	}

	hit ()
	{
		this.left.play("hit");
		this.right.play("hit");

        this.scene.sound.play("player_damaged");
	}

	fly ()
	{
		this.left.play("fly");
		this.right.play("fly");
	}

	update (targetLine)
	{
        var lineLength = Phaser.Geom.Line.Length(targetLine);
        var lineAngle = Phaser.Geom.Line.Angle(targetLine);
        var angleDeg = Phaser.Math.RadToDeg(lineAngle);

        this.left.setPosition(targetLine.x1, targetLine.y1);
        this.right.setPosition(targetLine.x1, targetLine.y1);

        this.midLine.setTo(targetLine.x1, targetLine.y1 - 500, targetLine.x1, targetLine.y1 + 500);

	    var reflectAngle = Phaser.Geom.Line.ReflectAngle(targetLine, this.midLine);

	    var length = Phaser.Geom.Line.Length(targetLine);

	    Phaser.Geom.Line.SetToAngle(this.reflectedLine, targetLine.x1, targetLine.y1, reflectAngle, length);

        var rightQuadrant = (angleDeg < 90 && angleDeg > -90);
        var leftQuadrant = !rightQuadrant;
        var merging = 0;

		if (rightQuadrant)
		{
			if (angleDeg > 70)
			{
				//	Merging bottom right
				merging = 1;

		        this.right.setRotation(Phaser.Math.DegToRad(70) + (Phaser.Math.DegToRad(70) - lineAngle));

		        this.left.setVisible(true);
		        this.right.setVisible(false);
			}
			else
			{
		        this.right.setRotation(lineAngle);

		        this.left.setVisible(false);
		        this.right.setVisible(true);
			}
		}
		else if (leftQuadrant)
		{
			if (angleDeg >= 90 && angleDeg < 110)
			{
				//	Merging bottom left
				merging = 2;

		        this.right.setRotation(Phaser.Math.DegToRad(70) + (Phaser.Math.DegToRad(70) - lineAngle));

		        this.left.setVisible(true);
		        this.right.setVisible(false);
			}
			else if (angleDeg < 0 && angleDeg > -120)
			{
				//	Merging top left
				merging = 3;

		        this.right.setRotation(lineAngle);

		        this.left.setVisible(false);
		        this.right.setVisible(true);
			}
			else
			{
		        this.right.setRotation(reflectAngle - Phaser.Math.DegToRad(30));

		        this.left.setVisible(true);
		        this.right.setVisible(false);
			}
		}

		this.left.setRotation(-this.right.rotation);

		/*
		this.debug.clear();
		this.debug.lineStyle(2, 0x00ff00);
		this.debug.strokeLineShape(targetLine);
		this.debug.strokeLineShape(this.midLine);
		this.debug.strokeLineShape(this.reflectedLine);

		this.debugT.setText([
			'on left: ' + leftQuadrant,
			'on right: ' + rightQuadrant,
			'green: ' + this.right.angle,
			'red: ' + this.left.angle,
			'lineAngle: ' + angleDeg,
			'reflectAngle ' + Phaser.Math.RadToDeg(reflectAngle),
			'merging: ' + merging
		]);
		*/
	}

	onMeleeAnimation (animation, animationFrame)
	{
		const { index } = animationFrame;

		if (index === 8) this.scene.sound.play("axe_swing");
	}

	animComplete(animation, frame)
	{
		this.left.play("fly");
		this.right.play("fly");
	}

	isAttacking ()
	{
		const { key } = this.left.anims.currentAnim;

		return key === 'attack' || key === 'hit';
	}

	isMelee ()
	{
		return Boolean(this.left.anims.currentFrame.textureFrame.match(/attack[8-9]|attack1[02]/gi));
	}
}