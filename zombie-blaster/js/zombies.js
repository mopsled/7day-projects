/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ZombieManager = (function () {
    function ZombieManager() {
        this.list = [];
        this.locations = {};
        this.lookupById = {};
        this.zombieRate = 1;
        this.zombiesKilled = 0;
    }
    ZombieManager.prototype.generateZombies = function (count, coordinateManager, zombieManager, playerEntity, gameMap, statusManager, screenDrawer, engine, display, scheduler) {
        for (var i = 0; i < count; i++) {
            var location = gameMap.getEmptyLocation();
            var zombie = new Zombie(location, coordinateManager, zombieManager, playerEntity, gameMap, statusManager, screenDrawer, engine, display, scheduler);
            this.list.push(zombie);
            this.locations[zombie.location.x + ',' + zombie.location.y] = zombie.id;
            this.lookupById[zombie.id] = zombie;
            scheduler.add(zombie, true);
        }
    };
    return ZombieManager;
})();
var Zombie = (function (_super) {
    __extends(Zombie, _super);
    function Zombie(location, coordinateManager, zombieManager, playerEntity, map, statusManager, screenDrawer, engine, display, scheduler) {
        _super.call(this, location);
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
    Zombie.prototype.getSpeed = function () {
        return 100;
    };
    Zombie.prototype.act = function () {
        var _this = this;
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
                }
                else {
                    newX = this.location.x - 1;
                }
                newY = this.location.y;
            }
            else {
                if (playerY > this.location.y) {
                    newY = this.location.y + 1;
                }
                else {
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
        var astar = new ROT.Path.AStar(playerX, playerY, function (x, y) {
            return _this.canMoveToLocation(new Point(x, y));
        }, { topology: 4 });
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this.location.x, this.location.y, pathCallback);
        path.shift();
        if (path.length == 1) {
        }
        else if (path.length > 1) {
            delete this.zombieManager.locations[this.location.x + ',' + this.location.y];
            var x = path[0][0];
            var y = path[0][1];
            this.location.x = x;
            this.location.y = y;
            this.zombieManager.locations[this.location.x + ',' + this.location.y] = this.id;
        }
    };
    Zombie.prototype.draw = function (x, y, background) {
        var color = ROT.Color.interpolate([97, 65, 38], [255, 0, 0], this.health / 100);
        this.display.draw(x, y, "Z", ROT.Color.toRGB(color), background);
    };
    Zombie.prototype.canMoveToLocation = function (location) {
        var mapPassable = (this.map.getCell(location).movement === 0 /* Unhindered */);
        if (mapPassable) {
            var anotherZombieAtLocation = this.anotherZombieAtCoordinates(location.x, location.y);
            return !anotherZombieAtLocation;
        }
        return false;
    };
    Zombie.prototype.anotherZombieAtCoordinates = function (x, y) {
        var key = x + ',' + y;
        if (this.zombieManager.locations[key] === this.id) {
            return false;
        }
        if (key in this.zombieManager.locations) {
            return true;
        }
        return false;
    };
    Zombie.prototype.takeDamage = function (damage) {
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
    };
    return Zombie;
})(Entity);
//# sourceMappingURL=zombies.js.map