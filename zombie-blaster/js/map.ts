/// <reference path="common.d.ts" />

interface GameMap {
  width: number;
  height: number;
  cells: Cell[][];
  openFloorCoordinates: Point[];

  setCell(location: Point, cell: Cell);
}

interface TileManager {
  setCell(location: Point, cell: Cell);
}

enum Movement {Unhindered, Blocked};

class Cell {
  tile: string;
  movement: Movement;
  location: Point;

  constructor(location: Point, tile: string = ' ', movement: Movement = Movement.Unhindered) {
    this.location = location;
    this.tile = tile;
    this.movement = movement;
  }

  activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager) { }
}

class FloorCell extends Cell {
  constructor(location: Point) {
    super(location, '.', Movement.Unhindered)
  }
}

class TreeCell extends Cell {
  constructor(location: Point) {
    super(location, '#', Movement.Blocked)
  }
}

class BoxCell extends Cell {
  constructor(location: Point, public ammoAmount: number) {
    super(location, '*', Movement.Unhindered);
  }

  activate(inventoryManager: InventoryManager, statusManager: StatusManager, tileManager: TileManager) {
    inventoryManager.ammo += this.ammoAmount;
    statusManager.setStatus('%c{green}You found ' + this.ammoAmount + ' shells');
    tileManager.setCell(this.location, new FloorCell(this.location));
  }
}

class SinRandomMap implements GameMap {
  cells: Cell[][];
  openFloorCoordinates: Point[];
  randomMultipliers: number[];

  constructor(public width: number, public height: number) {
    this.cells = [];
    this.openFloorCoordinates = [];
    this.randomMultipliers = [Math.random()* 0.6 + 0.4, Math.random()* 0.6 + 0.4, Math.random()* 0.2 + 0.8];

    this.generateFloor();
    this.generateBoxes();
  }

  generateFloor() {
    for (var i = 0; i < this.width; i++) {
      var row = [];
      for (var j = 0; j < this.height; j++) {
        row.push(new FloorCell(new Point(i, j)));
      }
      this.cells.push(row);
    }

    var map = new ROT.Map.Arena(this.width, this.height);
    map.create((x: number, y: number, wall: boolean) => {this.digCallback(x, y, wall)});
  }

  digCallback(x: number, y: number, wall: boolean) {
    if (wall) { return; }

    var point = new Point(x, y);

    if (Math.sin(x*this.randomMultipliers[0])
      * Math.sin(y*this.randomMultipliers[1])
      * Math.sin(x*y*this.randomMultipliers[2])
      > 0.4) {
      this.cells[x][y] = new TreeCell(point);
    } else {
      this.cells[x][y] = new FloorCell(point);
      this.openFloorCoordinates.push(point);
    }
  }

  generateBoxes() {
    for (var i = 0; i < 500; i++) {
      var index = Math.floor(ROT.RNG.getUniform() * this.openFloorCoordinates.length);
      var point = this.openFloorCoordinates.splice(index, 1)[0];

      var ammoAmount = Math.ceil(ROT.RNG.getUniform() * 12) + 8;
      var box = new BoxCell(point, ammoAmount);

      this.cells[point.x][point.y] = box;
    }
  }

  setCell(location: Point, cell: Cell) {
    this.cells[location.x][location.y] = cell;
  }
}
