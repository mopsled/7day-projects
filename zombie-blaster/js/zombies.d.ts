/// <reference path="common.d.ts" />
declare class ZombieManager {
    list: any[];
    locations: {
        [x: string]: number;
    };
    lookupById: {
        [x: number]: any;
    };
    zombiesKilled: number;
    playerEntity: Entity;
    scheduler: ROT.Scheduler;
    mapPassibilityManager: MapPassibilityManager;
    gameOverManager: GameOverManager;
    constructor(playerEntity: Entity, scheduler: ROT.Scheduler, gameOverManager: GameOverManager);
    addZombieAtLocation(location: Point): void;
    zombieMoved(zombie: Zombie, locationFrom: Point, locationTo: Point): void;
    zombieDied(zombie: Zombie): void;
}
declare class Zombie extends Entity {
    health: number;
    zombieManager: ZombieManager;
    playerEntity: Entity;
    mapPassibilityManager: MapPassibilityManager;
    gameOverManager: GameOverManager;
    constructor(location: Point, zombieManager: ZombieManager, playerEntity: Entity, mapPassibilityManager: MapPassibilityManager, gameOverManager: GameOverManager);
    getSpeed(): number;
    act(): void;
    performWanderBehavior(): void;
    performDistantPlayerVisibleBehavior(playerLocation: Point): void;
    performNearPlayerVisibleBehavior(playerLocation: Point): void;
    draw(display: ROT.Display, x: number, y: number, background: string): void;
    canMoveToLocation(location: Point): boolean;
    anotherZombieAtCoordinates(x: number, y: number): boolean;
    takeDamage(damage: number): boolean;
}
