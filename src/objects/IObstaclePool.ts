export default interface IObstaclePool {
	spawn(x: number, y: number, width: number, key: string);
	despawn(Obstacle: Phaser.GameObjects.Sprite);
	initializeWithSize(size: number);
}
