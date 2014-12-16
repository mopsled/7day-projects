/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />

class ZombiesInfo {
  list: any[];
  locations: {[index: string]: number};
  lookupById: {[index: number]: any}

  constructor() {
    this.list = [];
    this.locations = {};
    this.lookupById = {};
  }
}

class GameStats {
  zombiesKilled: number;
  turns: number;

  constructor() {
    this.zombiesKilled = 0;
    this.turns = 0;
  }
}

class Game {
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
  static zombies = new ZombiesInfo();
  static stats = new GameStats();

  static init() {
    this.zombieRate = 1;
    this.statusChunkSize = 30;
    this.mapChunkSize = 80;
    this.status = '';
    this.display = new ROT.Display({spacing:1.1, width:this.statusChunkSize + this.mapChunkSize, height:24});
    document.body.appendChild(this.display.getContainer());
    
    this._generateMap();
    this._drawScreen();
    this.setStatus('%c{yellow}Arrow keys move\nMouse to aim\nClick to shoot\nSpace to loot');
    
    this.scheduler = new ROT.Scheduler.Simple();
    this.scheduler.add(this.player, true);
    for (var i = 0; i < this.zombies.list.length; i++) {
      this.scheduler.add(this.zombies.list[i], true);
    }

    this.engine = new ROT.Engine(this.scheduler);
    this.engine.start();
  }

  static _generateMap() {
    this.map = new SinRandomMap(500, 200);

    this.player = createBeing(Player, this.map.openFloorCoordinates);

    this.zombies.list = [];
    this.zombies.locations = {};
    this.zombies.lookupById = {};
    for (var i = 0; i < 1000; i++) {
      var zombie = createBeing(Zombie, this.map.openFloorCoordinates);
      this.zombies.list.push(zombie);
      this.zombies.locations[zombie._x + ',' + zombie._y] = zombie._id;
      this.zombies.lookupById[zombie._id] = zombie;
    }
  }
  
  static _drawScreen() {
    for (var x = this.statusChunkSize; x < this.display.getOptions().width; x++) {
      for (var y = 0; y <= this.display.getOptions().height; y++) {
        this._drawCell(x, y);
      }
    }

    this._drawStatusSection();
  }

  static _drawCell(screenX: number, screenY: number, background?: string) {
    var screenWidthOfMap = this.mapChunkSize;
    var screenHeight = this.display.getOptions().height;

    var mapOffsetX = this.player.getX() - Math.floor(this.mapChunkSize/2.0 + this.statusChunkSize);
    var mapOffsetY = this.player.getY() - Math.floor(screenHeight/2.0);

    var mapX = screenX + mapOffsetX;
    var mapY = screenY + mapOffsetY;
    var key = mapX + ',' + mapY;

    if (this.invalidScreenCoordinate(screenX, screenY) || this.invalidMapCoordinate(mapX, mapY)) {
      return;
    }

    if (this.player.getX() === mapX && this.player.getY() === mapY) {
      this.player._draw(screenX, screenY, background);
    } else if (key in this.zombies.locations) {
      var id = this.zombies.locations[key];
      var zombie = this.zombies.lookupById[id];
      zombie._draw(screenX, screenY, background);
    } else {
      if (background) {
        this.display.draw(screenX, screenY, this.map.cells[mapX][mapY].tile, '#aaa', background);
      } else {
        this.display.draw(screenX, screenY, this.map.cells[mapX][mapY].tile);
      }
    }
  }

  static _drawStatusSection() {
    var sizeX = this.statusChunkSize;

    for (var y = 0; y < this.display.getOptions().height; y++) {
      this.display.draw(sizeX - 1, y, '|');
    }

    var title = 'Zombie Blaster';
    this.display.drawText(Math.floor((sizeX - title.length) / 2), 0, title);

    for (var x = 0; x < sizeX - 1; x++) {
      for (var y = 2; y < 8; y++) {
        this.display.draw(x, y, ' ');
      }
    }
    this.display.drawText(1, 2, this.status, sizeX - 3);

    this.display.drawText(1, 19, 'Ammo: ' + ('     ' + this.player.ammo).slice(-5), sizeX - 3);
    this.display.drawText(1, 20, 'Turns: ' + ('    ' + this.stats.turns).slice(-4), sizeX - 3);
    this.display.drawText(1, 21, 'Zombies Killed: ' + this.stats.zombiesKilled, sizeX - 3);
  }

  static setStatus(status: string) {
    this.status = status;
    this._drawStatusSection();
  }

  static invalidScreenCoordinate(x: number, y: number) {
    var screenWidth = this.display.getOptions().width;
    var screenHeight = this.display.getOptions().height;
    return x < 0 || x >= screenWidth ||
           y < 0 || y >= screenWidth;
  }

  static invalidMapCoordinate(x: number, y: number) {
    var mapWidth = this.map.width;
    var mapHeight = this.map.height;
    return x < 0 || x >= mapWidth ||
           y < 0 || y >= mapHeight;
  }

  static generateNewZombies() {
    var newZombieList = [];
    for (var i = 0; i < this.zombieRate; i++) {
      var zombie = createBeing(Zombie, this.map.openFloorCoordinates);
      newZombieList.push(zombie);
      this.zombies.locations[zombie._x + ',' + zombie._y] = zombie._id;
      this.zombies.lookupById[zombie._id] = zombie;
    }
    for (var i = 0; i < newZombieList.length; i++) {
      this.scheduler.add(newZombieList[i], true);
    }
  }
}

class Player {
  _x: number;
  _y: number;
  _id: number;
  _keyboardEventListener: EventListener;
  _mouseMoveEventListener: EventListener;
  _mouseUpEventListener: EventListener;
  _weapon: Shootable;
  ammo: number;

  constructor(x, y, id) {
    this._x = x;
    this._y = y;
    this._id = id;
    this.ammo = 12;
    this._weapon = new Shotgun();
  }
  
  getSpeed() { 
    return 100; 
  }

  getX() { 
    return this._x;
  }

  getY() { 
    return this._y;
  }

  act() {
    Game.generateNewZombies();
    Game._drawScreen();
    Game.engine.lock();
    this._keyboardEventListener = (event: KeyboardEvent) => {this.handleEvent(event)};
    this._mouseMoveEventListener = (event: MouseEvent) => {Game.player._weapon.aim(event)};
    this._mouseUpEventListener = (event: MouseEvent) => {Game.player._weapon.fire(event)};
    window.addEventListener("keydown", this._keyboardEventListener);
    if (this.ammo > 0) {
      Game.display.getContainer().addEventListener('mousemove', this._mouseMoveEventListener);
      Game.display.getContainer().addEventListener('mouseup', this._mouseUpEventListener);
    }
  }
  
  handleEvent(e: KeyboardEvent) {
    var code = e.keyCode;
    if (code == 13 || code == 32) {
      var cell = Game.map.cells[this._x][this._y];
      (() => cell.activate(Game.player, Game, Game.map))();
      return;
    }

    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    if (Game.map.cells[newX][newY].movement === Movement.Blocked) { return; }

    this._x = newX;
    this._y = newY;
    window.removeEventListener("keydown", this._keyboardEventListener);
    Game.display.getContainer().removeEventListener('mousemove', this._mouseMoveEventListener);
    Game.display.getContainer().removeEventListener('mouseup', this._mouseUpEventListener);
    Game.stats.turns++;
    Game.engine.unlock();
  }

  _draw(x: number, y: number, background: string) {
    Game.display.draw(x, y, "@", "#ff0", background);
  }
}
  
class Zombie {
  _x: number;
  _y: number;
  _id: number;
  _health: number;

  constructor(x: number, y: number, id: number) {
    this._x = x;
    this._y = y;
    this._id = id;
    this._health = 100;
  }
  
  getSpeed() {
    return 100;
  }
  
  act() {
    var screenXY = convertMapCoordinatesToScreen(this._x, this._y);
    if (Game.invalidScreenCoordinate(screenXY[0], screenXY[1])) {
      var movX = [-1, 0, 1].random();
      var movY = [-1, 0, 1].random();
      if (!this._anotherZombieAtCoordinates(this._x + movX, this._y + movY)) {
        delete Game.zombies.locations[this._x + ',' + this._y];
        this._x += movX;
        this._y += movY;
        Game.zombies.locations[this._x + ',' + this._y] = this._id;
      }
      return;
    }

    var playerX = Game.player.getX();
    var playerY = Game.player.getY();

    var distanceToPlayer = Math.sqrt(Math.pow(this._x - playerX, 2) + Math.pow(this._y - playerY, 2));
    if (distanceToPlayer > 4) {
      var movDirection = ['x', 'y'].random();
      var newX, newY;
      if (movDirection === 'x') {
        if (playerX > this._x) {
          newX = this._x + 1;
        } else {
          newX = this._x - 1;
        }
        newY = this._y;
      } else {
        if (playerY > this._y) {
          newY = this._y + 1;
        } else {
          newY = this._y - 1;
        }
        newX = this._x;
      }

      if (!this._anotherZombieAtCoordinates(newX, newY)) {
        delete Game.zombies.locations[this._x + ',' + this._y];
        this._x = newX;
        this._y = newY;
        Game.zombies.locations[newX + ',' + newY] = this._id;
      }

      return;
    }
  
    var passableCallback = function(x: number, y: number) {
      if (x <= 0 || y <= 0 || x >= Game.map.width || y >= Game.map.height) return false;
      var mapPassable = (Game.map.cells[x][y].movement === Movement.Unhindered);  
      return mapPassable && !this._anotherZombieAtCoordinates(x, y);
    }

    var astar = new ROT.Path.AStar(playerX, playerY, (x: number, y: number) => passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x: number, y: number) {
      path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1) {
      Game.setStatus('%c{red}Game over - you were eaten by a Zombie!');
      Game._drawScreen();
      Game.engine.lock();
    } else if (path.length > 1) {
      delete Game.zombies.locations[this._x + ',' + this._y];
      var x = path[0][0];
      var y = path[0][1];
      this._x = x;
      this._y = y;
      Game.zombies.locations[this._x + ',' + this._y] = this._id;
    }
  }
  
  _draw(x: number, y: number, background: string) {
    var color = ROT.Color.interpolate([97, 65, 38], [255, 0, 0], this._health/100);
    Game.display.draw(x, y, "Z", ROT.Color.toRGB(color), background);
  }

  _anotherZombieAtCoordinates(x: number, y: number) {
    var key = x + ',' + y;
    if (Game.zombies.locations[key] == this._id) return false;
    if (key in Game.zombies.locations) return true;
    return false;
  }

  takeDamage(damage: number) {
    this._health -= damage;
    if (this._health <= 0) {
      var key = this._x + ',' + this._y;
      delete Game.zombies.locations[this._x + ',' + this._y];
      delete Game.zombies.lookupById[this._id];
      Game.scheduler.remove(this);
      Game.stats.zombiesKilled++;
      if (ROT.RNG.getUniform() < 0.2) {
        Game.zombieRate++;
      }
      return true;
    }
    return false;
  }
}

function convertMapCoordinatesToScreen(x: number, y: number) {
  var screenWidth = Game.mapChunkSize;
  var screenHeight = Game.display.getOptions().height;

  var screenTopLeftX = Math.floor(screenWidth/2.0) + Game.statusChunkSize - Game.player.getX();
  var screenTopLeftY = Math.floor(screenHeight/2.0) - Game.player.getY();

  return [x + screenTopLeftX, y + screenTopLeftY];
}

function convertScreenCoordinatesToMap(x: number, y: number) {
  var screenWidth = Game.mapChunkSize;
  var screenHeight = Game.display.getOptions().height;

  var mapTopLeftX = Game.player.getX() - (Math.floor(screenWidth/2.0) + + Game.statusChunkSize);
  var mapTopLeftY = Game.player.getY() - Math.floor(screenHeight/2.0);

  return [x + mapTopLeftX, y + mapTopLeftY];
}

interface FunctionWithNumberProperty { 
  (what: any, freeCells: any): any;
  idCounter: number;
}
var createBeing = <FunctionWithNumberProperty>function(what: any, freeCells: Point[]) {
  var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  var point = freeCells.splice(index, 1)[0];

  if (typeof createBeing.idCounter == 'undefined') {
    createBeing.idCounter = 0;
  } else {
    createBeing.idCounter++;
  }

  return new what(point.x, point.y, createBeing.idCounter);
}

interface Shootable {
  aim(e: MouseEvent);
  fire(e: MouseEvent);
}

class Shotgun {
  currentlyAimed: {point: Point; intensity: number}[];

  constructor() {
    this.currentlyAimed = [];
  }

  aim(e: MouseEvent) {
    for (var i = 0; i < this.currentlyAimed.length; i++) {
      var cell = this.currentlyAimed[i];
      Game._drawCell(cell.point.x, cell.point.y);
    }
    this.currentlyAimed = [];

    var cellX = e.offsetX / e.srcElement.clientWidth * Game.display.getOptions().width;
    cellX = Math.floor(cellX);
    var cellY = e.offsetY / e.srcElement.clientHeight * Game.display.getOptions().height;
    cellY = Math.floor(cellY);

    var playerCellX = Math.floor(Game.mapChunkSize/2.0 + Game.statusChunkSize);
    var playerCellY = Math.floor(Game.display.getOptions().height / 2.0);

    var arcStart = rotate(new Point(playerCellX, playerCellY), new Point(cellX, cellY), -25);
    arcStart = new Point(Math.ceil(arcStart.x), Math.ceil(arcStart.y));
    var arcEnd = rotate(new Point(playerCellX, playerCellY), new Point(cellX, cellY), 25);
    arcEnd = new Point(Math.ceil(arcEnd.x), Math.ceil(arcEnd.y));

    var radius = Math.floor(Math.sqrt(Math.pow(playerCellX - cellX, 2) + Math.pow(playerCellY - cellY, 2)));

    var lethalRange = 4;
    var effectiveRange = 10;

    for (var x = playerCellX - radius; x < playerCellX + radius; x++) {
      for (var y = playerCellY - radius; y < playerCellY + radius; y++) {
        if (x === playerCellX && y === playerCellY) continue;
        var distanceToCell = Math.floor(Math.sqrt(Math.pow(playerCellX - x, 2) + Math.pow(playerCellY - y, 2)));
        if (distanceToCell > effectiveRange) {
          continue;
        } else if (pointInTriangle(new Point(x, y), new Point(playerCellX, playerCellY), arcStart, arcEnd)) {
          var intensity;
          if (distanceToCell <= lethalRange) {
            intensity = 150;
          } else {
            intensity = (effectiveRange - distanceToCell) / effectiveRange * 150;
          }

          Game._drawCell(x, y, ROT.Color.toRGB([intensity, 0, 0]));
          this.currentlyAimed.push({point: new Point(x, y), intensity: intensity});
        }
      }
    }
  }

  fire(e: MouseEvent) {
    Game.player.ammo--;
    var zombiesHit = 0;
    var zombiesDied = 0;

    for (var i = 0; i < this.currentlyAimed.length; i++) {
      var point = convertScreenCoordinatesToMap(this.currentlyAimed[i].point.x, this.currentlyAimed[i].point.y);
      var key = point[0] + ',' + point[1];

      if (key in Game.zombies.locations) {
        var zombie = Game.zombies.lookupById[Game.zombies.locations[key]];
        var intensity = this.currentlyAimed[i].intensity;
        var died = zombie.takeDamage(intensity);
        if (died) {
          zombiesDied++;
        } else {
          zombiesHit++;
        }
      }
    }

    var diedConjugation = (zombiesDied == 1 ? '' : 's');
    var hitConjugation = (zombiesHit == 1 ? '' : 's');
    if (zombiesDied == 0 && zombiesHit == 0) {
      Game.setStatus("%c{yellow}Your blast shoots harmlessly into the distance")
    } else if (zombiesDied > 0 && zombiesHit > 0) {
      Game.setStatus('%c{green}You killed ' + zombiesDied + ' zombie' + diedConjugation + 
                     ' and injured ' + zombiesHit + ' other' + hitConjugation);
    } else if (zombiesDied > 0) {
      Game.setStatus('%c{green}You killed ' + zombiesDied + ' zombie' + diedConjugation);
    } else if (zombiesHit > 0) {
      Game.setStatus("%c{green}That blast hurt " + zombiesHit + " zombie" + hitConjugation);
    }

    Game.display.getContainer().removeEventListener('mousemove', Game.player._mouseMoveEventListener);
    Game.display.getContainer().removeEventListener('mouseup', Game.player._mouseUpEventListener);
    window.removeEventListener("keydown", Game.player._keyboardEventListener);
    Game.engine.unlock();
  }
}

function rotate(center: Point, point: Point, degrees: number) {
  var rad = degrees * Math.PI / 180;
  var x = center.x + (point.x - center.x) * Math.cos(rad) + (center.y - point.y) * Math.sin(rad);
  var y = center.y + (point.y - center.y) * Math.cos(rad) + (point.x - center.x) * Math.sin(rad);
  return new Point(x, y);
}

function pointInTriangle(pt: Point, v1: Point, v2: Point, v3: Point) {
  var b1 = sign(pt, v1, v2) < 0;
  var b2 = sign(pt, v2, v3) < 0;
  var b3 = sign(pt, v3, v1) < 0;

  return ((b1 == b2) && (b2 == b3));
}

function sign(p1, p2, p3) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
