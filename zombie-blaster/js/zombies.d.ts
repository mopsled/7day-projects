/// <reference path="common.d.ts" />
declare class ZombieManager {
    zombiesKilled: number;
    mapPassibilityManager: MapPassibilityManager;
    private list;
    private locations;
    private lookupById;
    private playerEntity;
    private scheduler;
    private gameOverManager;
    constructor(playerEntity: Entity, scheduler: ROT.Scheduler, gameOverManager: GameOverManager);
    addZombieAtLocation(location: Point): void;
    zombieMoved(zombie: Zombie, locationFrom: Point, locationTo: Point): void;
    zombieDied(zombie: Zombie): void;
    zombieAtLocation(location: Point): any;
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
    anotherZombieAtCoordinates(location: Point): boolean;
    takeDamage(damage: number): boolean;
}
