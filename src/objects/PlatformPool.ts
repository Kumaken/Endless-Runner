import 'phaser';
import IPlatformPool from './IPlatformPool';
import { KEY_PLATFORM, KEY_PLATFORM_GRASS } from '../keys/ObjectKeys';

export default class PlatformPool extends Phaser.GameObjects.Group implements IPlatformPool {
	constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
		const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
			classType: Phaser.GameObjects.TileSprite,
			maxSize: -1
		};
		super(scene, Object.assign(defaults, config));
	}

	initializeWithSize(size: number) {
		this.maxSize = size;
		if (this.getLength() > 0 || size <= 0) {
			return;
		}
		for (let i = 1; i <= this.maxSize; ++i) {
			let platform; // casted to  any?
			platform = this.scene.add.tileSprite(0, 0, 0, 0, KEY_PLATFORM, KEY_PLATFORM_GRASS);
			platform.setOrigin(0.5, 0.5);
			this.scene.physics.add.existing(platform);
			platform.body.setImmovable(true);
			platform.setDepth(2);
			platform.visible = false;
			platform.active = false;
			this.add(platform);
			console.log('added platform', i);
		}
	}

	spawn(x = 0, y = 0, width: 100, key: string = KEY_PLATFORM) {
		const platform: Phaser.GameObjects.TileSprite = this.getFirstDead();
		if (!platform) return null;
		platform.x = x;
		platform.y = y - 22.55;
		platform.displayWidth = width;
		platform.displayHeight = this.scene.textures.get('KEY_PLATFORM_GRASS').getSourceImage().height;
		platform.tileScaleX = 1 / platform.scaleX;
		platform.active = true;
		platform.visible = true;

		return platform;
	}

	despawn(platform: Phaser.GameObjects.TileSprite) {
		this.killAndHide(platform);
		platform.alpha = 1;
		platform.scale = 1;
	}
}

Phaser.GameObjects.GameObjectFactory.register('platformPool', function () {
	// @ts-ignore
	return this.updateList.add(new PlatformPool(this.scene));
});
