/// <reference path="common.d.ts" />
declare class ZombieManager {
    list: any[];
    locations: {
        [x: string]: number;
    };
    lookupById: {
        [x: number]: any;
    };
    zombieRate: number;
    zombiesKilled: number;
    coordinateManager: CoordinateManager;
    playerEntity: Entity;
    statusManager: StatusManager;
    engine: ROT.Engine;
    screenDrawer: ScreenDrawer;
    display: ROT.Display;
    scheduler: ROT.Scheduler;
    mapPassibilityManager: MapPassibilityManager;
    constructor(coordinateManager: CoordinateManager, playerEntity: Entity, statusManager: StatusManager, screenDrawer: ScreenDrawer, engine: ROT.Engine, display: ROT.Display, scheduler: ROT.Scheduler);
    addZombieAtLocation(location: Point): void;
}
declare class Zombie extends Entity {
    health: number;
    coordinateManager: CoordinateManager;
    zombieManager: ZombieManager;
    playerEntity: Entity;
    statusManager: StatusManager;
    engine: ROT.Engine;
    screenDrawer: ScreenDrawer;
    display: ROT.Display;
    scheduler: ROT.Scheduler;
    mapPassibilityManager: MapPassibilityManager;
    constructor(location: Point, coordinateManager: CoordinateManager, zombieManager: ZombieManager, playerEntity: Entity, statusManager: StatusManager, screenDrawer: ScreenDrawer, engine: ROT.Engine, display: ROT.Display, scheduler: ROT.Scheduler, mapPassibilityManager: MapPassibilityManager);
    getSpeed(): number;
    act(): void;
    performWanderBehavior(): void;
    performDistantPlayerVisibleBehavior(playerLocation: Point): void;
    performNearPlayerVisibleBehavior(playerLocation: Point): void;
    draw(x: number, y: number, background: string): void;
    canMoveToLocation(location: Point): boolean;
    anotherZombieAtCoordinates(x: number, y: number): boolean;
    takeDamage(damage: number): boolean;
}
