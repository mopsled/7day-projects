/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />

class ZombieManager {
  list: any[];
  locations: {[index: string]: number};
  lookupById: {[index: number]: any}
  zombieRate: number;
  zombiesKilled: number;

  constructor() {
    this.list = [];
    this.locations = {};
    this.lookupById = {};
    this.zombieRate = 1;
    this.zombiesKilled = 0;
  }

  generateZombies(
    count: number,
    coordinateManager: CoordinateManager, 
    zombieManager: ZombieManager, 
    playerEntity: Entity, 
    gameMap: GameMap,
    statusManager: StatusManager,
    screenDrawer: ScreenDrawer,
    engine: ROT.Engine,
    display: ROT.Display,
    scheduler: ROT.Scheduler) {

    for (var i = 0; i < count; i++) {
      var location = gameMap.getEmptyLocation();
      var zombie = new Zombie(
        location,
        coordinateManager,
        zombieManager,
        playerEntity,
        gameMap,
        statusManager,
        screenDrawer,
        engine,
        display,
        scheduler);

      this.list.push(zombie);
      this.locations[zombie.location.x + ',' + zombie.location.y] = zombie.id;
      this.lookupById[zombie.id] = zombie;
      scheduler.add(zombie, true);
    }
  }
}

class Zombie extends Entity {
  health: number;
  coordinateManager: CoordinateManager;
  zombieManager: ZombieManager;
  playerEntity: Entity;
  map: GameMap;
  statusManager: StatusManager;
  engine: ROT.Engine;
  screenDrawer: ScreenDrawer;
  display: ROT.Display;
  scheduler: ROT.Scheduler;

  constructor(
    location: Point, 
    coordinateManager: CoordinateManager, 
    zombieManager: ZombieManager, 
    playerEntity: Entity, 
    map: GameMap,
    statusManager: StatusManager,
    screenDrawer: ScreenDrawer,
    engine: ROT.Engine,
    display: ROT.Display,
    scheduler: ROT.Scheduler) {

    super(location);
    this.coordinateManager = coordinateManager;
    this.zombieManager = zombieManager;
    this.playerEntity = playerEntity;
    this.map = map;
    this.statusManager = statusManager;
    this.screenDrawer = screenDrawer;
    this.engine = engine;
    this.display = display;
    this.scheduler = scheduler;
    this.health = 100;
  }
  
  getSpeed() {
    return 100;
  }
  
  act() {
    var screenXY = this.coordinateManager.convertMapCoordinatesToScreen(this.location.x, this.location.y);

    if (this.coordinateManager.invalidScreenCoordinate(screenXY[0], screenXY[1])) {
      var movX = [-1, 0, 1].random();
      var movY = [-1, 0, 1].random();

      if (this.canMoveToLocation(new Point(this.location.x + movX, this.location.y + movY))) {
        delete this.zombieManager.locations[this.location.x + ',' + this.location.y];
        this.location.x += movX;
        this.location.y += movY;
        this.zombieManager.locations[this.location.x + ',' + this.location.y] = this.id;
      }
      return;
    }

    var playerX = this.playerEntity.location.x;
    var playerY = this.playerEntity.location.y;

    var distanceToPlayer = Math.sqrt(Math.pow(this.location.x - playerX, 2) + Math.pow(this.location.y - playerY, 2));
    if (distanceToPlayer > 4) {
      var movDirection = ['x', 'y'].random();
      var newX, newY;
      if (movDirection === 'x') {
        if (playerX > this.location.x) {
          newX = this.location.x + 1;
        } else {
          newX = this.location.x - 1;
        }
        newY = this.location.y;
      } else {
        if (playerY > this.location.y) {
          newY = this.location.y + 1;
        } else {
          newY = this.location.y - 1;
        }
        newX = this.location.x;
      }

      if (this.canMoveToLocation(new Point(newX, newY))) {
        delete this.zombieManager.locations[this.location.x + ',' + this.location.y];
        this.location.x = newX;
        this.location.y = newY;
        this.zombieManager.locations[newX + ',' + newY] = this.id;
      }

      return;
    }

    var astar = new ROT.Path.AStar(playerX, playerY, (x: number, y: number) => {
      return this.canMoveToLocation(new Point(x, y))
    }, {topology:4});

    var path = [];
    var pathCallback = function(x: number, y: number) {
      path.push([x, y]);
    }
    astar.compute(this.location.x, this.location.y, pathCallback);

    path.shift();
    if (path.length == 1) {
      this.statusManager.setStatus('%c{red}Game over - you were eaten by a Zombie!');
      this.screenDrawer.drawScreen();
      this.engine.lock();
    } else if (path.length > 1) {
      delete this.zombieManager.locations[this.location.x + ',' + this.location.y];
      var x = path[0][0];
      var y = path[0][1];
      this.location.x = x;
      this.location.y = y;
      this.zombieManager.locations[this.location.x + ',' + this.location.y] = this.id;
    }
  }
  
  draw(x: number, y: number, background: string) {
    var color = ROT.Color.interpolate([97, 65, 38], [255, 0, 0], this.health/100);
    this.display.draw(x, y, "Z", ROT.Color.toRGB(color), background);
  }

  canMoveToLocation(location: Point) {
    var mapPassable = (this.map.getCell(location).movement === Movement.Unhindered);
    if (mapPassable) {
      var anotherZombieAtLocation = this.anotherZombieAtCoordinates(location.x, location.y);
      return !anotherZombieAtLocation;
    }

    return false;
  }

  anotherZombieAtCoordinates(x: number, y: number) {
    var key = x + ',' + y;
    if (this.zombieManager.locations[key] === this.id) {
      return false;
    }
    if (key in this.zombieManager.locations) {
      return true;
    }
    return false;
  }

  takeDamage(damage: number) {
    this.health -= damage;
    if (this.health <= 0) {
      var key = this.location.x + ',' + this.location.y;
      delete this.zombieManager.locations[this.location.x + ',' + this.location.y];
      delete this.zombieManager.lookupById[this.id];
      this.scheduler.remove(this);
      this.zombieManager.zombiesKilled++;
      if (ROT.RNG.getUniform() < 0.2) {
        this.zombieManager.zombieRate++;
      }
      return true;
    }
    return false;
  }
}