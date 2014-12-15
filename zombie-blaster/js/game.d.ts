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
    static map: string[][];
    static engine: ROT.Engine;
    static scheduler: ROT.Scheduler;
    static zombieRate: number;
    static statusChunkSize: number;
    static mapChunkSize: number;
    static status: string;
    static floorCells: string[];
    static mapWidth: number;
    static mapHeight: number;
    static player: any;
    static pedro: any;
    static zombies: ZombiesInfo;
    static stats: GameStats;
    static init(): void;
    static _generateMap(): void;
    static _generateBoxes(freeCells: string[]): void;
    static _drawScreen(): void;
    static _drawCell(screenX: number, screenY: number, background?: string): void;
    static _drawStatusSection(): void;
    static setStatus(status: string): void;
    static invalidScreenCoordinate(x: number, y: number): boolean;
    static invalidMapCoordinate(x: number, y: number): boolean;
    static generateNewZombies(): void;
}
declare class Player {
    _x: number;
    _y: number;
    _id: number;
    _ammo: number;
    _eventListener: EventListener;
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
declare var currentlyAimed: any[];
declare var aim: (e: MouseEvent) => void;
declare var fire: (e: MouseEvent) => void;
declare function rotate(center: number[], point: number[], degrees: number): number[];
declare function pointInTriangle(pt: number[], v1: number[], v2: number[], v3: number[]): boolean;
declare function sign(p1: any, p2: any, p3: any): number;
