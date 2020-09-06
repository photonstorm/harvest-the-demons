import Phaser from 'phaser';
import playGame from './scenes/game';
import './css/style.css';

const config = {
  type: Phaser.AUTO,
  parent: 'harvest-the-demons',
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.DOM.FIT,
    autoCenter: Phaser.DOM.CENTER_BOTH
  },
  physics: {
    default: 'matter',
    matter: {
      // debug: true
    }
  },
  scene: [playGame]
};

const game = new Phaser.Game(config);
