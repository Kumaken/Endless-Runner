import * as Phaser from 'phaser';
import GameStart from './scripts/GameStart';
import PreloadGame from './scripts/PreloadGame';
import EndlessRunner from './scripts/EndlessRunner';
import GameOver from './scripts/GameOver';

let game;
window.onload = function () {
	// object containing configuration options
	let gameConfig = {
		type: Phaser.AUTO,
		width: 1334,
		height: 750,
		scene: [GameStart, PreloadGame, EndlessRunner, GameOver],
		// scene: [PreloadGame, EndlessRunner, GameOver], FOR DEVELOPMENT: NO NEED TO TORTURE URSELF WATCHING THE OPENING SCENE ALL THE TIME
		backgroundColor: 0x000,
		pixelArt: true,
		// physics settings
		physics: {
			default: 'arcade',
			arcade: {
				tileBias: 8
				// debug: true
			}
		}
	};
	game = new Phaser.Game(gameConfig);
	window.focus();
	resize();
	window.addEventListener('resize', resize, false);
};

// Resize game scene to proportionate ratio when window size is modified
function resize() {
	let canvas = document.querySelector('canvas');
	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;
	let windowRatio = windowWidth / windowHeight;
	let gameRatio = game.config.width / game.config.height;
	if (windowRatio < gameRatio) {
		canvas.style.width = windowWidth + 'px';
		canvas.style.height = windowWidth / gameRatio + 'px';
	} else {
		canvas.style.width = windowHeight * gameRatio + 'px';
		canvas.style.height = windowHeight + 'px';
	}
}
