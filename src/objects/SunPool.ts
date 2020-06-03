import 'phaser';
import ISunPool from './ISunPool';
import {
	KEY_OBSTACLE_SUN1,
	KEY_OBSTACLE_SUN2,
	KEY_OBSTACLE_SUN3,
	KEY_OBSTACLE_SUN4,
	KEY_OBSTACLE_SUN0,
	KEY_PLATFORM
} from '../keys/ObjectKeys';

export default class SunPool extends Phaser.GameObjects.Group implements ISunPool {
	private sunWidth: number;

	constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
		const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
			classType: Phaser.GameObjects.TileSprite,
			maxSize: -1
		};
		super(scene, Object.assign(defaults, config));
		this.sunWidth = this.scene.textures.get(KEY_OBSTACLE_SUN1).getSourceImage().width;
	}

	initializeWithSize(size: number) {
		this.maxSize = size;
		if (this.getLength() > 0 || size <= 0) {
			return;
		}

		// Spawn sun:
		for (let i = 1; i <= this.maxSize; ++i) {
			let sun; // casted to  any?
			let key = i % 5;
			if (key === 0) sun = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_SUN0);
			else if (key === 1) sun = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_SUN1);
			else if (key === 2) sun = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_SUN2);
			else if (key === 3) sun = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_SUN3);
			else sun = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_SUN4);

			this.scene.physics.add.existing(sun);
			sun.body.setImmovable(true);
			sun.setDepth(2);
			sun.body.setSize(sun.body.width * 0.75, sun.body.height * 0.75);
			sun.visible = false;
			sun.active = false;
			// rotate:
			this.scene.tweens.add({
				targets: sun,
				duration: 2000,
				rotation: 360,
				callbackScope: this,
				repeat: -1 // infinity
			});
			this.add(sun);
		}
	}

	spawn(x = 0, y = 0, width: 100) {
		const sun: Phaser.GameObjects.Sprite = this.getFirstDead();
		if (!sun) return null;
		sun.x = x - width / 2 + Phaser.Math.Between(this.sunWidth, width - this.sunWidth);
		sun.y = y - Phaser.Math.Between(200, 100);
		sun.active = true;
		sun.visible = true;

		return sun;
	}

	despawn(sun: Phaser.GameObjects.Sprite) {
		this.killAndHide(sun);
		sun.alpha = 1;
		sun.scale = 1;
	}
}

Phaser.GameObjects.GameObjectFactory.register('sunPool', function () {
	// @ts-ignore
	return this.updateList.add(new SunPool(this.scene));
});

export { KEY_OBSTACLE_SUN1 };
