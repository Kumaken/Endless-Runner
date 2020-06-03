import {
	KEY_PLATFORM,
	KEY_ITEMS,
	KEY_PLAYER,
	KEY_AUDIO_JUMP,
	KEY_AUDIO_HIT,
	KEY_AUDIO_COLLECTIBLE,
	KEY_AUDIO_DEATH,
	KEY_AUDIO_BGM,
	KEY_PLAYER_JUMP,
	KEY_PLAYER_DUCK,
	KEY_PLAYER_WALK,
	KEY_BG_DAY,
	KEY_BG_NIGHT
} from '../keys/ObjectKeys';

export default class PreloadGame extends Phaser.Scene {
	constructor() {
		super('PreloadGame');
	}

	// load game assets:
	// paths are relative to project root?
	preload() {
		// kenny_simplifiedplatformer sprite spreadsheet:
		this.load.multiatlas(KEY_PLAYER, 'src/assets/spritesheets/chars/player.json', 'src/assets/spritesheets/chars');

		// platform:
		this.load.multiatlas(
			KEY_PLATFORM,
			'src/assets/spritesheets/platform/platform.json',
			'src/assets/spritesheets/platform'
		);

		/* Backgrounds */
		this.load.image(KEY_BG_DAY, 'src/assets/bg/day/dayBG.png'); // day background
		this.load.image(KEY_BG_NIGHT, 'src/assets/bg/night/nightBG.png'); // night background

		// the firecamp is a sprite sheet made by 32x58 pixels
		this.load.spritesheet('fire', 'src/assets/spritesheets/obstacles/fire.png', {
			frameWidth: 40,
			frameHeight: 70
		});

		// items:
		this.load.multiatlas(KEY_ITEMS, 'src/assets/spritesheets/items/items.json', 'src/assets/spritesheets/items');

		// Sounds:
		this.load.audio(KEY_AUDIO_JUMP, 'src/assets/audio/jump.mp3');
		this.load.audio(KEY_AUDIO_COLLECTIBLE, 'src/assets/audio/coin.mp3');
		this.load.audio(KEY_AUDIO_HIT, 'src/assets/audio/hit.mp3');
		this.load.audio(KEY_AUDIO_BGM, 'src/assets/audio/bgm.mp3');
		this.load.audio(KEY_AUDIO_DEATH, 'src/assets/audio/death.mp3');
	}
	create() {
		/* Animation Setups */
		// idle walk animation
		let playerWalkFrames = this.anims.generateFrameNames(KEY_PLAYER, {
			start: 1,
			end: 2,
			zeroPad: 0,
			prefix: 'platformChar_walk',
			suffix: '.png'
		});
		this.anims.create({ key: KEY_PLAYER_WALK, frames: playerWalkFrames, frameRate: 16, repeat: -1 });
		// jump animation
		this.anims.create({
			key: KEY_PLAYER_JUMP,
			frames: [{ key: KEY_PLAYER, frame: 'platformChar_jump.png' }],
			frameRate: 1,
			repeat: -1
		});

		// duck animation
		this.anims.create({
			key: KEY_PLAYER_DUCK,
			frames: [{ key: KEY_PLAYER, frame: 'platformChar_duck.png' }],
			frameRate: 1,
			repeat: -1
		});

		this.scene.start('EndlessRunner');
	}
}
