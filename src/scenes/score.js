import Phaser from "phaser";
// Images
import backgroundImg from "../assets/images/background.jpg";
import constants from "../assets/configs/constants";
import { alignGrid } from "../assets/configs/alignGrid";
import { assetsDPR } from "../index";
export default class ScoreScene extends Phaser.Scene {
	constructor() {
		super("scoreScene");
	}
	init({ score, best, level }) {
		this.score = score;
		this.best = best;
		this.level = level;
	}
	preload() {
		this.load.image("background", backgroundImg);

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

		const title = this.add.text(0, 0, "Game Over", {
			fontSize: `${36 * assetsDPR}px`,
			fontFamily: constants.styles.text.fontFamily,
		});

		const score = this.add.text(0, 0, `Score ${this.score}`, {
			fontSize: `${24 * assetsDPR}px`,
			fontFamily: constants.styles.text.fontFamily,
		});

		const bestScore = this.add.text(0, 0, `High Score ${this.best}`, {
			fontSize: `${24 * assetsDPR}px`,
			fontFamily: constants.styles.text.fontFamily,
		});

		const playButton = this.add
			.text(0, 0, `Play Again`, {
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
				this.scene.start("playGame", { level: this.level });
			}, this);

		container.add(title).add(score).add(bestScore).add(playButton).layout();

		alignGrid.center(container);

		this.sound.volume = 0.1;
	}
}
