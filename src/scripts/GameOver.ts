import * as Phaser from 'phaser';
import { KEY_AUDIO_DEATH, KEY_FONT_ATARI } from '../keys/ObjectKeys';

export default class GameOver extends Phaser.Scene {
	private gameoverText: Phaser.GameObjects.BitmapText;
	private retryText: Phaser.GameObjects.BitmapText;
	private finalScore: number;

	/* Audio Members */
	private bgm: Phaser.Sound.BaseSound;

	constructor() {
		super('GameOver');
	}

	init(data) {
		this.finalScore = data.finalScore;
	}
	// paths are relative to project root?
	preload() {
		// Sounds:
		this.load.audio(KEY_AUDIO_DEATH, 'src/assets/audio/death.mp3');

		// Fonts:
		this.load.bitmapFont(KEY_FONT_ATARI, 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');
	}

	create() {
		/* BGM */
		this.bgm = this.sound.add(KEY_AUDIO_DEATH, { loop: false });
		this.bgm.play();

		// Game Over Text
		this.gameoverText = this.add
			.bitmapText(
				(this.game.config.width as number) / 2,
				(this.game.config.height as number) / 2 - 50,
				KEY_FONT_ATARI,
				'Game Over',
				100
			)
			.setOrigin(0.5)
			.setCenterAlign()
			.setDepth(1);

		let gameoverTextTween = this.tweens.add({
			targets: this.gameoverText,
			duration: 100,
			y: this.gameoverText.y - 20,
			alpha: 50,
			ease: 'Sine.easeInOut',
			callbackScope: this,
			yoyo: true,
			loop: -1
		});

		// Final Score
		this.add
			.bitmapText(
				(this.game.config.width as number) / 2,
				(this.game.config.height as number) / 2 + 50,
				KEY_FONT_ATARI,
				'Final Score: ' + this.finalScore,
				35
			)
			.setOrigin(0.5)
			.setCenterAlign()
			.setDepth(1);
		// Retry Button
		this.retryText = this.add
			.bitmapText(
				(this.game.config.width as number) / 2,
				(this.game.config.height as number) / 2 + 200,
				KEY_FONT_ATARI,
				'Retry? ',
				35
			)
			.setOrigin(0.5)
			.setCenterAlign()
			.setDepth(1)
			.setInteractive();

		let retryTextTween = this.tweens.add({
			targets: this.retryText,
			duration: 300,
			alpha: 0,
			ease: 'Sine.easeInOut',
			callbackScope: this,
			yoyo: true,
			loop: -1
		});
		// Register on click events:
		this.input.once('pointerup', () => {
			this.scene.start('EndlessRunner');
			this.bgm.stop();
			gameoverTextTween.stop();
			retryTextTween.stop();
		});
	}
}
