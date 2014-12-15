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
