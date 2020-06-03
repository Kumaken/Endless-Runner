import * as Phaser from 'phaser';
import { KEY_AUDIO_TITLESCREEN, KEY_FONT_ATARI } from '../keys/ObjectKeys';

export default class GameOver extends Phaser.Scene {
	private clickToStartButton: Phaser.GameObjects.BitmapText;
	private startgameText: Phaser.GameObjects.BitmapText;
	private startButton: Phaser.GameObjects.BitmapText;
	private preludeText: Phaser.GameObjects.BitmapText;
	private runText: Phaser.GameObjects.BitmapText;
	private creditsText: Phaser.GameObjects.BitmapText;

	private bgm: Phaser.Sound.BaseSound;

	constructor() {
		super('GameStart');
	}

	// paths are relative to project root?
	preload() {
		// Sounds:
		this.load.audio(KEY_AUDIO_TITLESCREEN, 'src/assets/audio/titlescreen.mp3');

		// Fonts:
		this.load.bitmapFont(KEY_FONT_ATARI, 'src/assets/fonts/gem.png', 'src/assets/fonts/gem.xml');
	}

	create() {
		// clickToStartButton
		this.clickToStartButton = this.add
			.bitmapText(
				(this.game.config.width as number) / 2,
				(this.game.config.height as number) / 2,
				KEY_FONT_ATARI,
				'Click to start',
				35
			)
			.setOrigin(0.5)
			.setCenterAlign()
			.setDepth(1)
			.setInteractive();
		this.clickToStartButton.visible = true;

		let clickToStartButtonTween = this.tweens.add({
			targets: this.clickToStartButton,
			duration: 300,
			alpha: 0,
			ease: 'Sine.easeInOut',
			callbackScope: this,
			yoyo: true,
			loop: -1
		});

		this.clickToStartButton.on('pointerup', () => {
			if (clickToStartButtonTween) clickToStartButtonTween.stop();
			this.clickToStartButton.visible = false;
			this.bgm = this.sound.add(KEY_AUDIO_TITLESCREEN, { loop: false });
			this.bgm.play();

			// Credits Text
			this.creditsText = this.add
				.bitmapText(
					(this.game.config.width as number) / 2,
					(this.game.config.height as number) / 2 - 50,
					KEY_FONT_ATARI,
					'a little gift for you from A.S.',
					50
				)
				.setOrigin(0.5)
				.setCenterAlign()
				.setDepth(1)
				.setAlpha(0);

			this.preludeText = this.add
				.bitmapText(
					(this.game.config.width as number) / 2,
					(this.game.config.height as number) / 2 - 50,
					KEY_FONT_ATARI,
					'i know you want to...',
					50
				)
				.setOrigin(0.5)
				.setCenterAlign()
				.setDepth(1)
				.setAlpha(0);
			this.preludeText.visible = false;

			// Game Start Text
			this.startgameText = this.add
				.bitmapText(
					(this.game.config.width as number) / 2,
					(this.game.config.height as number) / 2 - 50,
					KEY_FONT_ATARI,
					'RUN FROM YOUR RESPONSIBILITIES',
					75
				)
				.setOrigin(0.5)
				.setCenterAlign()
				.setDepth(1)
				.setAlpha(0);
			this.startgameText.visible = false;

			// RUN Text
			this.runText = this.add
				.bitmapText(
					(this.game.config.width as number) / 2,
					(this.game.config.height as number) / 2 - 50,
					KEY_FONT_ATARI,
					'RUN',
					300
				)
				.setOrigin(0.5)
				.setCenterAlign()
				.setDepth(1)
				.setAlpha(0);
			this.runText.tint = 0xff0000;
			this.runText.visible = false;

			// Start Button
			this.startButton = this.add
				.bitmapText(
					(this.game.config.width as number) / 2,
					(this.game.config.height as number) / 2 + 200,
					KEY_FONT_ATARI,
					'Start running',
					35
				)
				.setOrigin(0.5)
				.setCenterAlign()
				.setDepth(1)
				.setInteractive()
				.setAlpha(0);
			this.startButton.visible = false;

			let startButtonTween: Phaser.Tweens.Tween;

			this.tweens.add({
				targets: this.creditsText,
				duration: 1500,
				alpha: 1,
				ease: 'Sine.easeInOut',
				yoyo: true,
				callbackScope: this,
				onComplete: () => {
					this.creditsText.visible = false;
					this.preludeText.visible = true;
					this.tweens.add({
						targets: this.preludeText,
						duration: 1500,
						alpha: 1,
						ease: 'Sine.easeInOut',
						yoyo: true,
						callbackScope: this,
						onComplete: () => {
							this.preludeText.visible = false;
							this.runText.visible = true;
							this.runText.alpha = 1;
							let runTween = this.tweens.add({
								targets: this.runText,
								duration: 100,
								y: this.runText.y - 20,
								alpha: 0,
								ease: 'Sine.easeInOut',
								yoyo: true,
								loop: -1,
								callbackScope: this
							});
							this.time.delayedCall(2000, () => {
								runTween.stop();
								this.runText.visible = false;
								this.startButton.visible = true;
								this.startgameText.visible = true;
								this.tweens.add({
									targets: this.startgameText,
									duration: 2000,
									alpha: 1,
									ease: 'Sine.easeInOut',
									callbackScope: this
								});
								this.tweens.add({
									targets: this.startButton,
									duration: 2000,
									alpha: 1,
									ease: 'Sine.easeInOut',
									callbackScope: this,
									onComplete: () => {
										startButtonTween = this.tweens.add({
											targets: this.startButton,
											duration: 300,
											alpha: 0,
											ease: 'Sine.easeInOut',
											callbackScope: this,
											yoyo: true,
											loop: -1
										});
									}
								});
							});
						}
					});
				}
			});
			// Register on click events:
			this.startButton.on('pointerup', () => {
				this.scene.start('PreloadGame');
				this.bgm.stop();
				if (startButtonTween) startButtonTween.stop();
			});
		});
	}
}
