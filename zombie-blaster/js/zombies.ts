/// <reference path="common.d.ts" />

class ZombieManager {
  zombiesKilled: number;
  mapPassibilityManager: MapPassibilityManager;
  private list: any[];
  private locations: {[index: string]: number};
  private lookupById: {[index: number]: any}
  private playerEntity: Entity;
  private scheduler: ROT.Scheduler;
  private gameOverManager: GameOverManager;

  constructor(
    playerEntity: Entity,
    scheduler: ROT.Scheduler,
    gameOverManager: GameOverManager) {

    this.list = [];
    this.locations = {};
    this.lookupById = {};
    this.zombiesKilled = 0;

    this.playerEntity = playerEntity;
    this.scheduler = scheduler;
    this.gameOverManager = gameOverManager;
  }

  addZombieAtLocation(location: Point) {
    var zombie = new Zombie(
      location,
      this,
      this.playerEntity,
      this.mapPassibilityManager,
      this.gameOverManager);

    this.list.push(zombie);
    this.locations[zombie.location.x + ',' + zombie.location.y] = zombie.id;
    this.lookupById[zombie.id] = zombie;
    this.scheduler.add(zombie, true);
  }

  zombieMoved(zombie: Zombie, locationFrom: Point, locationTo: Point) {
    delete this.locations[locationFrom.x + ',' + locationFrom.y];
    this.locations[locationTo.x + ',' + locationTo.y] = zombie.id;
  }

  zombieDied(zombie: Zombie) {
    var key = zombie.location.x + ',' + zombie.location.y;
    delete this.locations[key];
    delete this.lookupById[zombie.id];
    delete this.locations[key];
    this.scheduler.remove(zombie);
    this.zombiesKilled++;
  }

  zombieAtLocation(location: Point) {
    var key = location.x + ',' + location.y;
    var zombieId = this.locations[key];
    return this.lookupById[zombieId];
  }
}

class Zombie extends Entity {
  health: number;
  zombieManager: ZombieManager;
  playerEntity: Entity;
  mapPassibilityManager: MapPassibilityManager;
  gameOverManager: GameOverManager;

  constructor(
    location: Point, 
    zombieManager: ZombieManager, 
    playerEntity: Entity, 
    mapPassibilityManager: MapPassibilityManager,
    gameOverManager: GameOverManager) {

    super(location);
    this.zombieManager = zombieManager;
    this.playerEntity = playerEntity;
    this.mapPassibilityManager = mapPassibilityManager;
    this.gameOverManager = gameOverManager;
    this.health = 100;
  }
  
  getSpeed() {
    return 100;
  }
  
  act() {
    var playerX = this.playerEntity.location.x;
    var playerY = this.playerEntity.location.y;
    var distanceToPlayer = Math.sqrt(Math.pow(this.location.x - playerX, 2) + Math.pow(this.location.y - playerY, 2));

    if (distanceToPlayer > 50) {
      this.performWanderBehavior();
    } else if (distanceToPlayer > 4) {
      this.performDistantPlayerVisibleBehavior(this.playerEntity.location);
    } else if (distanceToPlayer === 0) {
      this.gameOverManager.setGameOver('eaten', 'zombie');
    } else {
      this.performNearPlayerVisibleBehavior(this.playerEntity.location);
    }
  }

  performWanderBehavior() {
    var movX = [-1, 0, 1].random();
    var movY = [-1, 0, 1].random();
    var newLocation = new Point(this.location.x + movX, this.location.y + movY);

    if (this.canMoveToLocation(newLocation)) {
      var oldLocation = new Point(this.location.x, this.location.y);
      this.location.x += movX;
      this.location.y += movY;
      this.zombieManager.zombieMoved(this, oldLocation, this.location);
    }
  }

  performDistantPlayerVisibleBehavior(playerLocation: Point) {
    var movDirection = ['x', 'y'].random();
    var newX, newY;
    if (movDirection === 'x') {
      if (playerLocation.x > this.location.x) {
        newX = this.location.x + 1;
      } else {
        newX = this.location.x - 1;
      }
      newY = this.location.y;
    } else {
      if (playerLocation.y > this.location.y) {
        newY = this.location.y + 1;
      } else {
        newY = this.location.y - 1;
      }
      newX = this.location.x;
    }

    var newLocation = new Point(newX, newY);
    if (this.canMoveToLocation(newLocation)) {
      var oldLocation = new Point(this.location.x, this.location.y);
      this.location.x = newX;
      this.location.y = newY;
      this.zombieManager.zombieMoved(this, oldLocation, this.location);
    }
  }

  performNearPlayerVisibleBehavior(playerLocation: Point) {
    var astar = new ROT.Path.AStar(playerLocation.x, playerLocation.y, (x: number, y: number) => {
      return this.canMoveToLocation(new Point(x, y))
    }, {topology:4});

    var path = [];
    var pathCallback = function(x: number, y: number) {
      path.push([x, y]);
    }
    astar.compute(this.location.x, this.location.y, pathCallback);

    path.shift();
    if (path.length == 1) {
      this.gameOverManager.setGameOver('eaten', 'zombie');
    } else if (path.length > 1) {
      var oldLocation = new Point(this.location.x, this.location.y);
      this.location.x = path[0][0];
      this.location.y = path[0][1];
      this.zombieManager.zombieMoved(this, oldLocation, this.location);
    }
  }
  
  draw(display: ROT.Display, x: number, y: number, background: string) {
    var color = ROT.Color.interpolate([97, 65, 38], [255, 0, 0], this.health/100);
    display.draw(x, y, "Z", ROT.Color.toRGB(color), background);
  }

  canMoveToLocation(location: Point) {
    var mapPassable = this.mapPassibilityManager.mapPassableAtLocation(location);
    if (mapPassable) {
      var anotherZombieAtLocation = this.anotherZombieAtCoordinates(location);
      return !anotherZombieAtLocation;
    }

    return false;
  }

  anotherZombieAtCoordinates(location: Point) {
    var zombieAtCoordinates = this.zombieManager.zombieAtLocation(location);
    if (!zombieAtCoordinates || zombieAtCoordinates.id === this.id) {
      return false;
    }
    return true;
  }

  takeDamage(damage: number) {
    this.health -= damage;
    if (this.health <= 0) {
      this.zombieManager.zombieDied(this);
      return true;
    }
    return false;
  }
}