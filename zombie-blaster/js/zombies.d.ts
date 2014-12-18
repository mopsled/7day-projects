/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />
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
    constructor();
    generateZombies(count: number, openFloorLocations: Point[], coordinateManager: CoordinateManager, zombieManager: ZombieManager, playerEntity: Entity, gameMap: GameMap, statusManager: StatusManager, screenDrawer: ScreenDrawer, engine: ROT.Engine, display: ROT.Display, scheduler: ROT.Scheduler): void;
}
declare class Zombie extends Entity {
    health: number;
    coordinateManager: CoordinateManager;
    zombieManager: ZombieManager;
    playerEntity: Entity;
    map: GameMap;
    statusManager: StatusManager;
    engine: ROT.Engine;
    screenDrawer: ScreenDrawer;
    display: ROT.Display;
    scheduler: ROT.Scheduler;
    constructor(location: Point, coordinateManager: CoordinateManager, zombieManager: ZombieManager, playerEntity: Entity, map: GameMap, statusManager: StatusManager, screenDrawer: ScreenDrawer, engine: ROT.Engine, display: ROT.Display, scheduler: ROT.Scheduler);
    getSpeed(): number;
    act(): void;
    draw(x: number, y: number, background: string): void;
    anotherZombieAtCoordinates(x: number, y: number): boolean;
    takeDamage(damage: number): boolean;
}
