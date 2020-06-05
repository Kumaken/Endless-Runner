import * as Phaser from 'phaser';
import {
	KEY_PLATFORM,
	KEY_OBSTACLE_THORN,
	KEY_PLAYER,
	KEY_PLAYER_IDLE,
	KEY_AUDIO_JUMP,
	KEY_AUDIO_COLLECTIBLE,
	KEY_AUDIO_HIT,
	KEY_AUDIO_BGM,
	KEY_PLAYER_DUCK,
	KEY_PLAYER_JUMP,
	KEY_PLAYER_WALK,
	KEY_BG_DAY,
	KEY_BG_NIGHT
} from '../keys/ObjectKeys';
/* This imports are needed for module augmentation to work */
import '../objects/PlatformPool';
import '../objects/ObstaclePool';
import '../objects/CollectiblePool';
import '../objects/SunPool';
import IPlatformPool from '../objects/IPlatformPool';
import IObstaclePool from '../objects/IObstaclePool';
import ICollectiblePool from '../objects/ICollectiblePool';
import ISunPool from '../objects/ISunPool';

// global game options
let gameOptions = {
	platformSpeed: 250, // platform movement speed in pixels/sec
	spawnRange: [80, 300], // spawn range, how far should be the rightmost platform from the right edge before next platform spawns, in pixels
	platformSizeRange: [150, 400], // platform width size range
	platformHeightRange: [-5, 5], // next platform height range
	platformHeightScale: 20, // scaling: multiply to platformHeightRange so the height doesn't fluctuate too much
	platformVerticalLimit: [0.4, 0.8], // platform spawn area max and min height as screen height ratio
	playerGravity: 900, // player gravity
	jumpForce: 600, // player jumping force
	playerStartPosition: 200, // player starting position X
	jumps: 2, // consecutive jump capability
	collectibleRate: 100, // probability a collectible appears when a platform is spawned (percentage)
	obstacleRate: 35, // probability an obstacle is spawned when a platform is spawned (percentage)
	maxPlatforms: 10, // Max Number of platforms that can exist at any moment of the game
	// probabilities of which obstacle to spawn: (CUMULATIVE PROBABILITY)
	thornRate: 50, // e.g. : if dice rolls <= thornRate: then spawn a thorn, else check for sun
	sunRate: 100,

};

export default class EndlessRunner extends Phaser.Scene {
	/* Score members */
	private scoreState = {
		score: 0,
		scoreMultiplier: 1,
		justUpdated: false,
		timedEvent: null,
		level: 1
	};

	/* Player Members */
	private playerJumps: number;
	private player: Phaser.Physics.Arcade.Sprite;
	private playerInCollision: boolean;
	private isGameover: boolean;
	private playerIsDucking: boolean;

	/* Background Members */
	private dayBG: Phaser.GameObjects.TileSprite;
	private nightBG: Phaser.GameObjects.TileSprite;
	private isDay: boolean;

	/* Platform Members */
	private nextPlatformDistance: number;
	private addedPlatforms: number;
	private rightmostPlatform: Phaser.GameObjects.TileSprite;

	/* UI Members */
	private scoreText: Phaser.GameObjects.Text;
	private scoreGainText: Phaser.GameObjects.Text;
	private levelText: Phaser.GameObjects.Text;
	private multiplierText: Phaser.GameObjects.Text;
	private obstacleRateText: Phaser.GameObjects.Text;
	private collectibleRateText: Phaser.GameObjects.Text;
	private platformSpeedText: Phaser.GameObjects.Text;

	/* Object Group Members */
	private platformGroup: Phaser.GameObjects.Group;
	private obstacleGroup: Phaser.GameObjects.Group;
	private collectibleGroup: Phaser.GameObjects.Group;

	/* Object Pools Members */
	private platformPool?: IPlatformPool;
	private obstaclePool?: IObstaclePool;
	private sunPool?: ISunPool;
	private collectiblePool?: ICollectiblePool;

	/* Audio Members */
	private bgm: Phaser.Sound.BaseSound;

	/* Reusable Tweens */
	private scoreGainTween: Phaser.Tweens.Tween;
	levelUpText: Phaser.GameObjects.Text;

	constructor() {
		super('EndlessRunner');
	}

	create() {
		/* BGM */
		this.bgm = this.sound.add(KEY_AUDIO_BGM, { loop: true });
		this.bgm.play();

		/* Background */
		this.isDay = true;
		const raw_bg_img2 = this.textures.get(KEY_BG_NIGHT).getSourceImage();
		this.nightBG = this.add.tileSprite(0, 0, raw_bg_img2.width, raw_bg_img2.height, KEY_BG_NIGHT);
		this.nightBG.setDisplaySize(this.game.config.width as number, this.game.config.height as number);
		this.nightBG.setOrigin(0, 0);
		this.nightBG.setScrollFactor(0);

		const raw_bg_img = this.textures.get(KEY_BG_DAY).getSourceImage();
		this.dayBG = this.add.tileSprite(0, 0, raw_bg_img.width, raw_bg_img.height, KEY_BG_DAY);
		this.dayBG.setDisplaySize(this.game.config.width as number, this.game.config.height as number);
		this.dayBG.setOrigin(0, 0);
		this.dayBG.setScrollFactor(0);

		/* Platform Setup */
		// group with all active platforms
		this.platformGroup = this.add.group();

		// platform pool
		this.platformPool = this.add.platformPool();
		this.platformPool.initializeWithSize(gameOptions.maxPlatforms);

		/* Obstacle Setup */
		// group with all active obstacles
		this.obstacleGroup = this.add.group();

		// Obstacle pool
		this.obstaclePool = this.add.obstaclePool();
		this.obstaclePool.initializeWithSize(gameOptions.maxPlatforms);
		this.sunPool = this.add.sunPool();
		this.sunPool.initializeWithSize(gameOptions.maxPlatforms);

		/* Collectible Setup */
		// group with all active collectibles
		this.collectibleGroup = this.add.group();

		// Collectible pool
		this.collectiblePool = this.add.collectiblePool();
		this.collectiblePool.initializeWithSize(gameOptions.maxPlatforms);

		/* Scoring System */
		this.scoreState.timedEvent = this.time.addEvent({
			delay: 100,
			callback: this.updateScore,
			callbackScope: this,
			loop: true
		});

		this.levelUpText = this.add.text(
			(this.game.config.width as number) / 2,
			(this.game.config.height as number) / 2.5,
			'Level Up!',
			{ fontFamily: 'Piedra', fontSize: '100px', fill: '#FF0000' }
		);
		this.levelUpText.setAlpha(0);

		this.levelText = this.add.text(16, 16, 'Level: 1', {
			fontFamily: 'Piedra',
			fontSize: '24px',
			fill: '#FF0000'
		});
		this.scoreText = this.add.text(16, 40, 'Score: 0', {
			fontFamily: 'Orbitron',
			fontSize: '32px',
			fill: '#FFFFFF'
		});
		this.scoreGainText = this.add.text(200, 70, '+0', {
			fontFamily: 'Orbitron',
			fontSize: '30px',
			fill: '#FFFF00'
		});
		this.scoreGainText.setAlpha(0);

		this.multiplierText = this.add.text(
			(this.game.config.width as number) - 350,
			(this.game.config.height as number) - 90,
			'Multiplier: 1x',
			{ fontFamily: 'Orbitron', fontSize: '48px', fill: '#FF00FF' }
		);
		this.obstacleRateText = this.add.text(16, 96, 'Obstacle Rate: 0%', { fontSize: '17px', fill: '#000' });
		this.collectibleRateText = this.add.text(16, 116, 'Collectible Rate: 0%', { fontSize: '17px', fill: '#000' });
		this.platformSpeedText = this.add.text(16, 136, 'Platform Speed: 0%', { fontSize: '17px', fill: '#000' });

		// adding a platform to the this.game, the arguments are platform width and x position
		this.addedPlatforms = 0;

		this.rightmostPlatform =
			this.addPlatform(
				this.game.config.width,
				(this.game.config.width as number) / 2, // middle point
				(this.game.config.height as number) * gameOptions.platformVerticalLimit[1]
			) || this.rightmostPlatform;

		/* Setup player character */
		this.isGameover = false;
		this.playerInCollision = false;
		this.playerIsDucking = false;
		this.playerJumps = 0; // number of consecutive jumps made by the player
		// add physics sprite
		this.player = this.physics.add.sprite(
			gameOptions.playerStartPosition, // x position counted from the bottom of the this.game
			(this.game.config.height as number) / 2, // y position - same
			KEY_PLAYER, // the texture key
			KEY_PLAYER_IDLE // the specific frame name in the spritesheet
		);
		this.player.setSize(this.player.body.width * 0.75, this.player.body.height * 0.75);
		// player gravity
		this.player.setGravityY(gameOptions.playerGravity);
		this.player.setDepth(2);
		// idle animation
		this.player.anims.play(KEY_PLAYER_WALK, true);

		/* Collision setups */
		// setting collisions between the player character and the platform group */
		this.physics.add.collider(this.player, this.platformGroup);

		// collision setup between the player and the obstacle group
		this.physics.add.overlap(
			this.player,
			this.obstacleGroup,
			function () {
				this.isGameover = true;
				this.sound.play(KEY_AUDIO_HIT);
			},
			null,
			this
		);

		// collision setup between the player and the collectible group
		this.physics.add.overlap(
			this.player,
			this.collectibleGroup,
			function (player, collectible: Phaser.GameObjects.Sprite) {
				if (!this.playerInCollision) {
					// add bonus score:
					this.sound.play(KEY_AUDIO_COLLECTIBLE);
					this.playerInCollision = true;
					this.giveScoreFromCollectibles(collectible.x, collectible.y);
					this.tweens.add({
						targets: collectible,
						y: collectible.y - 100,
						alpha: 0,
						duration: 800,
						ease: 'Cubic.easeOut',
						callbackScope: this,
						onComplete: function () {
							this.collectiblePool.despawn(collectible);
							this.collectibleGroup.killAndHide(collectible);
							this.collectibleGroup.remove(collectible);
							this.playerInCollision = false;
						}
					});
				}
			},
			null,
			this
		);

		// checking for input
		let jumpButton = this.input.keyboard.addKey('up');
		let duckButton = this.input.keyboard.addKey('down');
		jumpButton.on(
			'down',
			function () {
				this.jump();
			},
			this
		);

		duckButton.on(
			'down',
			function () {
				this.duck();
			},
			this
		);

		duckButton.on(
			'up',
			function () {
				this.stopDucking();
			},
			this
		);
	}

	update() {
		/* Check if the game is over */
		if (this.player.y > this.game.config.height || this.isGameover) {
			this.scene.start('GameOver', { finalScore: this.scoreState.score });
			this.resetScoreState();
			this.bgm.stop();
		}

		/* Background updates: Paralax Effect*/
		if (this.isDay) this.dayBG.tilePositionX += 0.5;
		else this.nightBG.tilePositionX += 0.5;

		// Check if player is touching ground or not
		if (this.player.body.touching.down && !this.playerIsDucking) this.player.anims.play(KEY_PLAYER_WALK, true);

		/* Player Position Update */
		this.player.x = gameOptions.playerStartPosition;

		/* Scoring System */
		this.scoreText.setText('Score: ' + this.scoreState.score);
		this.levelText.setText('Level: ' + this.scoreState.level);
		this.multiplierText.setText('Multiplier: ' + this.scoreState.scoreMultiplier + 'x');
		this.obstacleRateText.setText('Obstacle Rate: ' + gameOptions.obstacleRate + '%');
		this.collectibleRateText.setText('Collectible Rate: ' + gameOptions.collectibleRate + '%');
		this.platformSpeedText.setText('Platform Speed: ' + gameOptions.platformSpeed + 'pixel per second');
		if (
			this.scoreState.score >= Math.pow(10, this.scoreState.level + 2) &&
			this.scoreState.score !== 0 &&
			!this.scoreState.justUpdated
		)
			this.NextLevel();

		/* Spawning new platforms */
		const minDistance =
			(this.game.config.width as number) - this.rightmostPlatform.x - this.rightmostPlatform.displayWidth / 2; // Get the distance between the rightmost playform and edge of screen
		if (minDistance > this.nextPlatformDistance) {
			// If it's already time to spawn a new platform
			var nextPlatformWidth = Phaser.Math.Between(
				gameOptions.platformSizeRange[0],
				gameOptions.platformSizeRange[1]
			);
			let platformRandomHeight =
				gameOptions.platformHeightScale *
				Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
			let nextPlatformGap = this.rightmostPlatform.y + platformRandomHeight; // determine the new platform height
			let minPlatformHeight = (this.game.config.height as number) * gameOptions.platformVerticalLimit[0];
			let maxPlatformHeight = (this.game.config.height as number) * gameOptions.platformVerticalLimit[1];
			let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight); // don't let the height go higher or lower than the height range (e.g. out of screen)
			this.rightmostPlatform =
				this.addPlatform(
					nextPlatformWidth,
					(this.sys.game.config.width as number) + nextPlatformWidth / 2,
					nextPlatformHeight
				) || this.rightmostPlatform;
		}

		/* Recycling objects */
		// recycling platforms
		this.platformGroup.getChildren().forEach(function (platform: Phaser.GameObjects.TileSprite) {
			// Check if platform is already out of screen scope
			if (platform.x < -platform.displayWidth / 2) {
				this.platformPool.despawn(platform);
				this.platformGroup.killAndHide(platform);
				this.platformGroup.remove(platform);
			}
		}, this);
		// recycling obstacle
		this.obstacleGroup.getChildren().forEach(function (obstacle: Phaser.GameObjects.Sprite) {
			// Check if obstacle is already out of screen scope
			if (obstacle.x < -obstacle.displayWidth / 2) {
				if (obstacle.texture.key === KEY_OBSTACLE_THORN) {
					this.obstaclePool.despawn(obstacle);
				} else {
					this.sunPool.despawn(obstacle);
				}
				this.obstacleGroup.killAndHide(obstacle);
				this.obstacleGroup.remove(obstacle);
			}
		}, this);
		// recycling collectibles
		this.collectibleGroup.getChildren().forEach(function (collectible: Phaser.GameObjects.Sprite) {
			// Check if collectible is already out of screen scope
			if (collectible.x < -collectible.displayWidth / 2) {
				this.collectiblePool.despawn(collectible);
				this.collectibleGroup.killAndHide(collectible);
				this.collectibleGroup.remove(collectible);
			}
		}, this);
	}

	/* HELPER MEMBER FUNCTIONS ------------------------------------------------------- */
	/* Platform member functions */
	addPlatform(platformWidth, posX, posY) {
		this.addedPlatforms++;
		let platform;
		platform = this.platformPool.spawn(posX, posY, platformWidth, KEY_PLATFORM); // Get a platform from platform pool
		if (platform) {
			platform.body.setVelocityX(gameOptions.platformSpeed * -1);
			this.platformGroup.add(platform);
		}
		this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]); // Randomly determine distance before spawning a new platform

		if (this.addedPlatforms > 1 && platform) {
			// If this is not initial platform (Initial platform is always safe!)
			// spawn collectible or not?
			if (Phaser.Math.Between(1, 100) <= gameOptions.collectibleRate) {
				let collectible;
				collectible = this.collectiblePool.spawn(posX, posY, platformWidth);
				collectible.setVelocityX(platform.body.velocity.x);
				this.collectibleGroup.add(collectible);
			}
			// spawn obstacle or not?
			if (platformWidth >= 200 && Phaser.Math.Between(1, 100) <= gameOptions.obstacleRate) {
				let obstacle;
				// which obstacle to spawn: thorn or sun?
				if (Phaser.Math.Between(1, 100) <= gameOptions.thornRate) {
					// spawn thorn:
					obstacle = this.obstaclePool.spawn(posX, posY, platformWidth, KEY_OBSTACLE_THORN);
					obstacle.setVelocityX(platform.body.velocity.x);
					this.obstacleGroup.add(obstacle);
				} else {
					// spawn sun:
					obstacle = this.sunPool.spawn(posX, posY, platformWidth);
					obstacle.setVelocityX(platform.body.velocity.x);
					this.obstacleGroup.add(obstacle);
				}
			}
		}

		return platform;
	}

	/* Player member functions */
	// the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
	jump() {
		if (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)) {
			if (this.player.body.touching.down) {
				this.playerJumps = 0;
			}
			this.player.anims.play(KEY_PLAYER_JUMP, true);
			this.sound.play(KEY_AUDIO_JUMP);
			this.player.setVelocityY(gameOptions.jumpForce * -1);
			this.playerJumps++;
		}
	}

	duck() {
		if (this.player.body.touching.down && !this.playerIsDucking) {
			this.player.anims.play(KEY_PLAYER_DUCK, true);
			this.playerIsDucking = true;
			this.player.body.setSize(this.player.body.width, this.player.body.height - 40);
		}
	}

	stopDucking() {
		if (this.playerIsDucking) {
			this.playerIsDucking = false;
			this.player.anims.play(KEY_PLAYER_WALK, true);
			this.player.y = this.player.y - 40;
			this.player.body.setSize(this.player.body.width, this.player.body.height + 40);
		}
	}

	/* Background member functions */
	private changeDay() {
		if (this.isDay) {
			// change to night
			this.isDay = false;
			this.tweens.add({
				targets: this.dayBG,
				alphaBottomRight: { value: 0, duration: 2000, ease: 'Power1' },
				alphaTopLeft: { value: 0, duration: 2000, ease: 'Power1' },
				alphaBottomLeft: { value: 0, duration: 2000, ease: 'Power1' }
			});
		} else {
			// change to day
			this.isDay = true;
			this.tweens.add({
				targets: this.dayBG,
				alphaBottomRight: { value: 1, duration: 2000, ease: 'Power1' },
				alphaTopLeft: { value: 1, duration: 2000, ease: 'Power1' },
				alphaBottomLeft: { value: 1, duration: 2000, ease: 'Power1' }
			});
		}
	}

	/* Score & Level progression member functions */
	private NextLevel() {
		this.changeDay();
		this.scoreState.scoreMultiplier *= 2;
		this.scoreState.justUpdated = true;
		this.scoreState.level += 1;
		gameOptions.obstacleRate *= 1.25;
		gameOptions.collectibleRate *= 1.25;
		gameOptions.platformSpeed *= 1.25;

		/* Tween the level and multiplier */
		this.tweens.add({
			targets: this.levelText,
			duration: 200,
			alpha: 0,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: 2,
			callbackScope: this
		});
		this.tweens.add({
			targets: this.multiplierText,
			duration: 200,
			alpha: 0,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: 2,
			callbackScope: this
		});
		this.levelUpText.y = (this.game.config.height as number) / 2.5;
		this.tweens.add({
			targets: this.levelUpText,
			duration: 500,
			alpha: 1,
			y: this.levelUpText.y - 100,
			ease: 'Sine.easeInOut',
			repeat: 2,
			callbackScope: this,
			onComplete: () => {
				this.levelUpText.setAlpha(0);
			}
		});

		// Apply speed up to all existing platforms, obstacles, and collectibles:
		this.platformGroup.getChildren().forEach(function (platform: any) {
			platform.body.setVelocityX(gameOptions.platformSpeed * -1);
		}, this);

		this.obstacleGroup.getChildren().forEach(function (obstacle: any) {
			obstacle.body.setVelocityX(gameOptions.platformSpeed * -1);
		}, this);

		this.collectibleGroup.getChildren().forEach(function (collectible: any) {
			collectible.body.setVelocityX(gameOptions.platformSpeed * -1);
		}, this);
	}

	private giveScoreFromCollectibles(x: number, y: number) {
		let scoreGain = this.scoreState.scoreMultiplier * this.scoreState.level * 100;
		this.scoreGainText.setText('+' + scoreGain);
		this.scoreGainText.x = x;
		this.scoreGainText.y = y;
		this.scoreGainText.setAlpha(0);
		this.tweens.add({
			targets: this.scoreGainText,
			duration: 200,
			alpha: 1,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: 2,
			callbackScope: this
		});

		this.tweens.add({
			targets: this.scoreText,
			duration: 200,
			alpha: 0,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: 2,
			callbackScope: this
		});

		this.scoreState.score += scoreGain;
		this.scoreState.justUpdated = false;
	}

	private updateScore() {
		this.scoreState.score += this.scoreState.scoreMultiplier * 10;
		this.scoreState.justUpdated = false;
	}

	private resetScoreState() {
		this.scoreState.score = 0;
		this.scoreState.scoreMultiplier = 1;
		this.scoreState.justUpdated = false;
		this.scoreState.level = 1;
		// also reset game options:
		gameOptions.collectibleRate = 50;
		gameOptions.obstacleRate = 25;
		gameOptions.platformSpeed = 200;
		this.addedPlatforms = 0;
	}
}
