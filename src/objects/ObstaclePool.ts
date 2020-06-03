import 'phaser';
import IObstaclePool from './IObstaclePool';
import { KEY_OBSTACLE_THORN, KEY_PLATFORM } from '../keys/ObjectKeys';

export default class ObstaclePool extends Phaser.GameObjects.Group implements IObstaclePool {
	private thornWidth: number;

	constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
		const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
			classType: Phaser.GameObjects.TileSprite,
			maxSize: -1
		};
		super(scene, Object.assign(defaults, config));
		this.thornWidth = this.scene.textures.get('KEY_OBSTACLE_THORN').getSourceImage().width;
	}

	initializeWithSize(size: number) {
		this.maxSize = size;
		if (this.getLength() > 0 || size <= 0) {
			return;
		}

		// Spawn thorns:
		for (let i = 1; i <= this.maxSize; ++i) {
			let obstacle; // casted to  any?
			obstacle = this.scene.physics.add.sprite(0, 0, KEY_PLATFORM, KEY_OBSTACLE_THORN);
			this.scene.physics.add.existing(obstacle);
			obstacle.body.setImmovable(true);
			obstacle.setDepth(2);
			obstacle.body.setSize(obstacle.body.width * 0.75, obstacle.body.height * 0.5);
			obstacle.visible = false;
			obstacle.active = false;
			this.add(obstacle);
			console.log('added obstacle thorn', i);
		}
	}

	spawn(x = 0, y = 0, width: 100, key: string = KEY_OBSTACLE_THORN) {
		const obstacle: Phaser.GameObjects.Sprite = this.getFirstDead();
		if (!obstacle) return null;
		obstacle.x = x - width / 2 + Phaser.Math.Between(this.thornWidth, width - this.thornWidth);
		obstacle.y = y - 64;
		obstacle.active = true;
		obstacle.visible = true;

		return obstacle;
	}

	despawn(obstacle: Phaser.GameObjects.Sprite) {
		this.killAndHide(obstacle);
		obstacle.alpha = 1;
		obstacle.scale = 1;
	}
}

Phaser.GameObjects.GameObjectFactory.register('obstaclePool', function () {
	// @ts-ignore
	return this.updateList.add(new ObstaclePool(this.scene));
});

export { KEY_OBSTACLE_THORN };
