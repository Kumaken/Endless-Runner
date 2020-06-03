export default interface ISunPool {
	spawn(x: number, y: number, width: number);
	despawn(Sun: Phaser.GameObjects.Sprite);
	initializeWithSize(size: number);
}
