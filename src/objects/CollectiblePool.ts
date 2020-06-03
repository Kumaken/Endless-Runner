import 'phaser';
import ICollectiblePool from './ICollectiblePool';
import {
	KEY_ITEMS,
	KEY_COLLECTIBLE0,
	KEY_COLLECTIBLE1,
	KEY_COLLECTIBLE2,
	KEY_COLLECTIBLE3,
	KEY_COLLECTIBLE4
} from '../keys/ObjectKeys';

export default class CollectiblePool extends Phaser.GameObjects.Group implements ICollectiblePool {
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
			let collectible; // casted to  any?
			let key = i % 5;
			if (key === 0) collectible = this.scene.physics.add.sprite(0, 0, KEY_ITEMS, KEY_COLLECTIBLE0);
			else if (key === 1) collectible = this.scene.physics.add.sprite(0, 0, KEY_ITEMS, KEY_COLLECTIBLE1);
			else if (key === 2) collectible = this.scene.physics.add.sprite(0, 0, KEY_ITEMS, KEY_COLLECTIBLE2);
			else if (key === 3) collectible = this.scene.physics.add.sprite(0, 0, KEY_ITEMS, KEY_COLLECTIBLE3);
			else collectible = this.scene.physics.add.sprite(0, 0, KEY_ITEMS, KEY_COLLECTIBLE4);

			this.scene.physics.add.existing(collectible);
			collectible.body.setImmovable(true);
			collectible.setDepth(2);
			collectible.visible = false;
			collectible.active = false;

			this.scene.tweens.add({
				targets: collectible,
				duration: 500,
				alpha: 0.75,
				ease: 'Cubic.easeOut',
				callbackScope: this,
				yoyo: true,
				repeat: -1 // infinity
			});

			this.add(collectible);
		}
	}

	spawn(x = 0, y = 0, width: 100) {
		const collectible: Phaser.GameObjects.Sprite = this.getFirstDead();
		if (!collectible) return null;
		collectible.x = x - width / 2 + Phaser.Math.Between(1, width);
		collectible.y = y - Phaser.Math.Between(250, 150);
		collectible.active = true;
		collectible.visible = true;

		return collectible;
	}

	despawn(collectible: Phaser.GameObjects.Sprite) {
		this.killAndHide(collectible);
		collectible.alpha = 1;
		collectible.scale = 1;
	}
}

Phaser.GameObjects.GameObjectFactory.register('collectiblePool', function () {
	// @ts-ignore
	return this.updateList.add(new CollectiblePool(this.scene));
});
