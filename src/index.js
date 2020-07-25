import Phaser from "phaser";
import playGame from "./scenes/game";
import "./css/style.css";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.DOM.FIT,
    autoCenter: Phaser.DOM.CENTER_BOTH
  },
  scene: [playGame]
};

const game = new Phaser.Game(config);
