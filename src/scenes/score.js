import Phaser from "phaser";
import constants from "../assets/configs/constants";
import { alignGrid } from "../assets/configs/alignGrid";
import { assetsDPR } from "../index";
export default class ScoreScene extends Phaser.Scene {
  constructor() {
    super("scoreScene");
  }
  init(data) {
    this.score = data.score;
    this.best = data.best;
  }
  preload() {
    alignGrid.create({ scene: this, rows: 10, columns: 10 });
  }
  create() {
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
      .on(
        "pointerup",
        function () {
          this.scene.start("playGame");
        },
        this
      );

    container.add(title).add(score).add(bestScore).add(playButton).layout();

    alignGrid.center(container);
  }
}
