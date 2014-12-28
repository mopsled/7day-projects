/// <reference path="common.d.ts" />
/// <reference path="zombies.d.ts" />
interface GameMap {
    getEmptyLocation(): Point;
    getCell(location: Point): Cell;
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
    foregroundColor: string;
    backgroundColor: string;
    movement: Movement;
    location: Point;
    constructor(location: Point, tile?: string, foregroundColor?: string, backgroundColor?: string, movement?: Movement);
    activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager): void;
    static createBackgroundColor(): string;
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
    randomMultipliers: number[];
    generatedCells: {
        [x: string]: Cell;
    };
    emptyCells: Point[];
    zombieManager: ZombieManager;
    constructor(zombieManager: ZombieManager);
    getEmptyLocation(): Point;
    getCell(location: Point): Cell;
    setCell(location: Point, cell: Cell): void;
    mapPassableAtLocation(location: Point): boolean;
    generateNewCell(location: Point): TreeCell;
    generateBoxCell(location: Point): BoxCell;
}
