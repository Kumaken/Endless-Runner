export default interface IPlatformPool {
	spawn(x: number, y: number, width: number, key: string);
	despawn(platform: Phaser.GameObjects.TileSprite);
	initializeWithSize(size: number);
}
