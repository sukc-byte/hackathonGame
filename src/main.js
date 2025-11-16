import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 960,  // Wider to accommodate instruction panel
    height: 640,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// Make game accessible globally for voice commands
window.game = game;