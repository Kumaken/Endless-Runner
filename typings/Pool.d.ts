import IPlatformPool from '../src/objects/IPlatformPool';
import IObstaclePool from '../src/objects/IObstaclePool';
import ICollectiblePool from '../src/objects/ICollectiblePool';
import ISunPool from '../src/objects/ISunPool';

// Module augmenting
declare module 'phaser' {
	namespace GameObjects {
		export interface GameObjectFactory {
			platformPool(): IPlatformPool;
			obstaclePool(): IObstaclePool;
			collectiblePool(): ICollectiblePool;
			sunPool(): ISunPool;
		}
	}
}
