/// <reference path="rot.js-TS/rot.d.ts" />
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
interface InventoryManager {
    ammo: number;
}
interface GameOverManager {
    setGameOver(killedHow: string, killedByWhat: string): any;
}
interface StatusManager {
    setStatus(status: string): any;
}
interface MapPassibilityManager {
    mapPassableAtLocation(location: Point): any;
}
declare class Entity {
    location: Point;
    id: number;
    static idCounter: number;
    constructor(location: Point);
}
