/// <reference path="rot.js-TS/rot.d.ts" />
declare class ZombiesInfo {
    list: any[];
    locations: {
        [x: string]: number;
    };
    lookupById: {
        [x: number]: any;
    };
    constructor();
}
declare class GameStats {
    zombiesKilled: number;
    turns: number;
    constructor();
}
declare class Game {
    static display: ROT.Display;
    static map: GameMap;
    static engine: ROT.Engine;
    static scheduler: ROT.Scheduler;
    static zombieRate: number;
    static statusChunkSize: number;
    static mapChunkSize: number;
    static status: string;
    static player: any;
    static pedro: any;
    static zombies: ZombiesInfo;
    static stats: GameStats;
    static init(): void;
    static _generateMap(): void;
    static _drawScreen(): void;
    static _drawCell(screenX: number, screenY: number, background?: string): void;
    static _drawStatusSection(): void;
    static setStatus(status: string): void;
    static invalidScreenCoordinate(x: number, y: number): boolean;
    static invalidMapCoordinate(x: number, y: number): boolean;
    static generateNewZombies(): void;
}
interface GameMap {
    width: number;
    height: number;
    cells: string[][];
    floorCells: Point[];
}
declare class CellularMap implements GameMap {
    width: number;
    height: number;
    cells: string[][];
    floorCells: Point[];
    constructor(width: number, height: number);
    generateFloor(): void;
    generateBoxes(): void;
}
declare class Player {
    _x: number;
    _y: number;
    _id: number;
    _ammo: number;
    _keyboardEventListener: EventListener;
    _mouseMoveEventListener: EventListener;
    _mouseUpEventListener: EventListener;
    _weapon: Shootable;
    constructor(x: any, y: any, id: any);
    getSpeed(): number;
    getX(): number;
    getY(): number;
    act(): void;
    handleEvent(e: KeyboardEvent): void;
    _draw(x: number, y: number, background: string): void;
    _checkBox(): void;
}
declare class Zombie {
    _x: number;
    _y: number;
    _id: number;
    _health: number;
    constructor(x: number, y: number, id: number);
    getSpeed(): number;
    act(): void;
    _draw(x: number, y: number, background: string): void;
    _anotherZombieAtCoordinates(x: number, y: number): boolean;
    takeDamage(damage: number): boolean;
}
declare function convertMapCoordinatesToScreen(x: number, y: number): number[];
declare function convertScreenCoordinatesToMap(x: number, y: number): number[];
interface FunctionWithNumberProperty {
    (what: any, freeCells: any): any;
    idCounter: number;
}
declare var createBeing: any;
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
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
declare function rotate(center: Point, point: Point, degrees: number): Point;
declare function pointInTriangle(pt: Point, v1: Point, v2: Point, v3: Point): boolean;
declare function sign(p1: any, p2: any, p3: any): number;
