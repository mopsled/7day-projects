/// <reference path="common.d.ts" />
interface GameMap {
    width: number;
    height: number;
    cells: Cell[][];
    openFloorLocations: Point[];
    setCell(location: Point, cell: Cell): any;
}
interface TileManager {
    setCell(location: Point, cell: Cell): any;
}
declare enum Movement {
    Unhindered = 0,
    Blocked = 1,
}
declare class Cell {
    tile: string;
    movement: Movement;
    location: Point;
    constructor(location: Point, tile?: string, movement?: Movement);
    activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager): void;
}
declare class FloorCell extends Cell {
    constructor(location: Point);
}
declare class TreeCell extends Cell {
    constructor(location: Point);
}
declare class BoxCell extends Cell {
    ammoAmount: number;
    constructor(location: Point, ammoAmount: number);
    activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager): void;
}
declare class SinRandomMap implements GameMap {
    width: number;
    height: number;
    cells: Cell[][];
    openFloorLocations: Point[];
    randomMultipliers: number[];
    constructor(width: number, height: number);
    generateFloor(): void;
    digCallback(x: number, y: number, wall: boolean): void;
    generateBoxes(): void;
    setCell(location: Point, cell: Cell): void;
}
