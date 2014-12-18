/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />
/// <reference path="zombies.d.ts" />
declare class GameStats {
    turns: number;
    constructor();
}
declare class Game {
    static display: ROT.Display;
    static map: GameMap;
    static engine: ROT.Engine;
    static scheduler: ROT.Scheduler;
    static statusChunkSize: number;
    static mapChunkSize: number;
    static status: string;
    static player: any;
    static zombieManager: ZombieManager;
    static stats: GameStats;
    static init(): void;
    static generateMap(): void;
    static drawScreen(): void;
    static drawCell(screenX: number, screenY: number, background?: string): void;
    static drawStatusSection(): void;
    static setStatus(status: string): void;
    static invalidScreenCoordinate(x: number, y: number): boolean;
    static invalidMapCoordinate(x: number, y: number): boolean;
    static convertMapCoordinatesToScreen(x: number, y: number): number[];
    static convertScreenCoordinatesToMap(x: number, y: number): number[];
}
declare class Player extends Entity {
    keyboardEventListener: EventListener;
    mouseMoveEventListener: EventListener;
    mouseUpEventListener: EventListener;
    weapon: Shootable;
    ammo: number;
    constructor(location: Point);
    getSpeed(): number;
    act(): void;
    handleEvent(e: KeyboardEvent): void;
    draw(x: number, y: number, background: string): void;
}
interface Shootable {
    aim(e: MouseEvent): any;
    fire(e: MouseEvent): any;
}
declare class Shotgun {
    currentlyAimed: {
        point: Point;
        intensity: number;
    }[];
    constructor();
    aim(e: MouseEvent): void;
    fire(e: MouseEvent): void;
}
declare function rotate(center: Point, point: Point, degrees: number): Point;
declare function pointInTriangle(pt: Point, v1: Point, v2: Point, v3: Point): boolean;
declare function sign(p1: any, p2: any, p3: any): number;
