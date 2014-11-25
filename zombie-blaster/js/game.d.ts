/// <reference path="rot.js-TS/rot.d.ts" />
declare var Game: {
    display: any;
    map: any[];
    engine: any;
    player: any;
    pedro: any;
    zombies: {
        list: any[];
        locations: {};
        lookupById: {};
    };
    zombieRate: number;
    floorCells: any[];
    status: string;
    stats: {
        zombiesKilled: number;
        turns: number;
    };
    statusChunkSize: number;
    mapChunkSize: number;
    init: () => void;
    _generateMap: () => void;
    _generateBoxes: (freeCells: any) => void;
    _drawScreen: () => void;
    _drawCell: (screenX: any, screenY: any, background?: any) => void;
    _drawStatusSection: () => void;
    setStatus: (status: any) => void;
    invalidScreenCoordinate: (x: any, y: any) => boolean;
    invalidMapCoordinate: (x: any, y: any) => boolean;
    generateNewZombies: () => void;
};
declare var Player: (x: any, y: any, id: any) => void;
declare var Zombie: (x: any, y: any, id: any) => void;
declare function convertMapCoordinatesToScreen(x: any, y: any): any[];
declare function convertScreenCoordinatesToMap(x: any, y: any): any[];
interface FunctionWithNumberProperty {
    (what: any, freeCells: any): any;
    idCounter: number;
}
declare var createBeing: any;
declare var currentlyAimed: any[];
declare var aim: (e: any) => void;
declare var fire: (e: any) => void;
declare function rotate(center: any, point: any, degrees: any): any[];
declare function pointInTriangle(pt: any, v1: any, v2: any, v3: any): boolean;
declare function sign(p1: any, p2: any, p3: any): number;
