/// <reference path="rot.js-TS/rot.d.ts" />
declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
interface InventoryManager {
    ammo: number;
}
interface StatusManager {
    setStatus(status: string): any;
}
interface CoordinateManager {
    convertMapCoordinatesToScreen(x: number, y: number): any;
    convertScreenCoordinatesToMap(x: number, y: number): any;
    invalidScreenCoordinate(x: number, y: number): any;
    invalidMapCoordinate(x: number, y: number): any;
}
interface ScreenDrawer {
    drawScreen(): any;
}
declare class Entity {
    location: Point;
    id: number;
    static idCounter: number;
    constructor(location: Point);
}
