export default interface ICollectiblePool {
	spawn(x: number, y: number, width: number);
	despawn(COLLECTIBLE: Phaser.GameObjects.Sprite);
	initializeWithSize(size: number);
}
