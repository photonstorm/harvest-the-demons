import Phaser from "phaser";
// Images
import backgroundImg from "../assets/images/background.jpg";
import constants from "../assets/configs/constants";
import { alignGrid } from "../assets/configs/alignGrid";
import { assetsDPR } from "../index";
export default class TitleScene extends Phaser.Scene {
	constructor() {
		super("titleScene");
	}
	init() {}
	preload() {
    this.load.image("background", backgroundImg);
    
    this.load.audio("demon_theme", "src/assets/sound/demon_lord.mp3");

		alignGrid.create({ scene: this, rows: 10, columns: 10 });
	}
	create() {
		this.make.image({
			key: "background",
			x: 0,
			y: 0,
			width: this.cameras.main.width * assetsDPR * 4,
			origin: { x: 0, y: 0 },
			scale: { x: 1.5, y: 1.5 },
		});

		const container = this.rexUI.add.sizer({
			orientation: "y",
			space: { item: 50 },
		});

		const title = this.add.text(0, 0, "Harvest the Demons", {
			fontSize: `${36 * assetsDPR}px`,
			fontFamily: constants.styles.text.fontFamily,
		});

		const playButton = this.add.text(0, 0, "Play", {
			fontSize: `${12 * assetsDPR}px`,
			fontFamily: constants.styles.text.fontFamily,
		})
		.setInteractive()
		.on("pointerover", function () {
			this.setColor("red");
		})
		.on("pointerout", function () {
      this.setColor("white");
    })
		.on("pointerup", function () {
      this.scene.start("playGame");
    }, this);

		container.add(title).add(playButton).layout();

    alignGrid.center(container);
    
    this.sound.add("demon_theme");
		this.sound.volume = 0.1;
    this.sound.play("demon_theme", {
			loop: true,
		});
	}
}
