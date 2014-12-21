/// <reference path="common.d.ts" />

interface GameMap {
  getEmptyLocation(): Point;
  getCell(location: Point): Cell;
  setCell(location: Point, cell: Cell);
}

interface TileManager {
  setCell(location: Point, cell: Cell);
}

enum Movement {Unhindered, Blocked};

class Cell {
  tile: string;
  foregroundColor: string;
  backgroundColor: string;
  movement: Movement;
  location: Point;

  constructor(
    location: Point, 
    tile: string = ' ', 
    foregroundColor: string = '#999', 
    backgroundColor: string = '#000', 
    movement: Movement = Movement.Unhindered) {

    this.tile = tile;
    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;
    this.movement = movement;
    this.location = location;
  }

  activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager) { }

  static createBackgroundColor() {
    var backgroundGray = Math.floor(ROT.RNG.getNormal(20, 6));
    return ROT.Color.toHex([backgroundGray, backgroundGray, backgroundGray]);
  }
}

class FloorCell extends Cell {
  constructor(location: Point) {
    super(location, '.', '#ccc', Cell.createBackgroundColor(), Movement.Unhindered);

    var backgroundColor = ROT.Color.fromString(this.backgroundColor);
    var foregroundColor = ROT.Color.interpolate(backgroundColor, [255, 255, 255], 0.2);
    this.foregroundColor = ROT.Color.toHex(foregroundColor);
  }
}

class TreeCell extends Cell {
  constructor(location: Point) {
    super(location, '#', '#C04000', Cell.createBackgroundColor(), Movement.Blocked)
  }
}

class BoxCell extends Cell {
  constructor(location: Point, public ammoAmount: number) {
    super(location, '*', '#FFA505', Cell.createBackgroundColor(), Movement.Unhindered);
  }

  activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager) {
    inventoryManager.ammo += this.ammoAmount;
    statusManager.setStatus('%c{green}You found ' + this.ammoAmount + ' shells');
    tileManager.setCell(this.location, new FloorCell(this.location));
  }
}

class SinRandomMap implements GameMap {
  randomMultipliers: number[];
  generatedCells: { [locationString: string]: Cell; };
  emptyCells: Point[];

  constructor() {
    this.generatedCells = {};
    this.emptyCells = [];

    this.randomMultipliers = [Math.random()* 0.6 + 0.4, Math.random()* 0.6 + 0.4, Math.random()* 0.2 + 0.8];

    for (var i = 0; i < 200; i++) {
      for (var j = 0; j < 200; j++) {
        this.getCell(new Point(i, j));
      }
    }
  }

  getEmptyLocation() {
    return this.emptyCells.random();
  }

  getCell(location: Point) {
    var locationKey = location.x + ',' + location.y;

    var cell = this.generatedCells[locationKey];
    if (cell) {
      return cell;
    }

    cell = this.generateNewCell(location);
    this.generatedCells[locationKey] = cell;
    return cell;
  }

  setCell(location: Point, cell: Cell) {
    var locationKey = location.x + ',' + location.y;
    this.generatedCells[locationKey] = cell;
  }

  generateNewCell(location: Point) {
    if (Math.sin(location.x*this.randomMultipliers[0])
      * Math.sin(location.y*this.randomMultipliers[1])
      * Math.sin(location.x*location.y*this.randomMultipliers[2])
      > 0.4) {

      return new TreeCell(location);
    } else if (ROT.RNG.getUniform() <= 0.005) {
      return this.generateBoxCell(location);
    } else {
      this.emptyCells.push(location);
      return new FloorCell(location);
    }
  }

  generateBoxCell(location: Point) {
    var ammoAmount = Math.ceil(ROT.RNG.getUniform() * 12) + 8;
    return new BoxCell(location, ammoAmount);
  }
}
