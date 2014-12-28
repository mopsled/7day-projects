/// <reference path="common.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ZombieManager = (function () {
    function ZombieManager(playerEntity, scheduler, gameOverManager) {
        this.list = [];
        this.locations = {};
        this.lookupById = {};
        this.zombiesKilled = 0;
        this.playerEntity = playerEntity;
        this.scheduler = scheduler;
        this.gameOverManager = gameOverManager;
    }
    ZombieManager.prototype.addZombieAtLocation = function (location) {
        var zombie = new Zombie(location, this, this.playerEntity, this.mapPassibilityManager, this.gameOverManager);
        this.list.push(zombie);
        this.locations[zombie.location.x + ',' + zombie.location.y] = zombie.id;
        this.lookupById[zombie.id] = zombie;
        this.scheduler.add(zombie, true);
    };
    ZombieManager.prototype.zombieMoved = function (zombie, locationFrom, locationTo) {
        delete this.locations[locationFrom.x + ',' + locationFrom.y];
        this.locations[locationTo.x + ',' + locationTo.y] = zombie.id;
    };
    ZombieManager.prototype.zombieDied = function (zombie) {
        var key = zombie.location.x + ',' + zombie.location.y;
        delete this.locations[key];
        delete this.lookupById[zombie.id];
        delete this.locations[key];
        this.scheduler.remove(zombie);
        this.zombiesKilled++;
    };
    return ZombieManager;
})();
var Zombie = (function (_super) {
    __extends(Zombie, _super);
    function Zombie(location, zombieManager, playerEntity, mapPassibilityManager, gameOverManager) {
        _super.call(this, location);
        this.zombieManager = zombieManager;
        this.playerEntity = playerEntity;
        this.mapPassibilityManager = mapPassibilityManager;
        this.gameOverManager = gameOverManager;
        this.health = 100;
    }
    Zombie.prototype.getSpeed = function () {
        return 100;
    };
    Zombie.prototype.act = function () {
        var playerX = this.playerEntity.location.x;
        var playerY = this.playerEntity.location.y;
        var distanceToPlayer = Math.sqrt(Math.pow(this.location.x - playerX, 2) + Math.pow(this.location.y - playerY, 2));
        if (distanceToPlayer > 50) {
            this.performWanderBehavior();
        }
        else if (distanceToPlayer > 4) {
            this.performDistantPlayerVisibleBehavior(this.playerEntity.location);
        }
        else {
            this.performNearPlayerVisibleBehavior(this.playerEntity.location);
        }
    };
    Zombie.prototype.performWanderBehavior = function () {
        var movX = [-1, 0, 1].random();
        var movY = [-1, 0, 1].random();
        var newLocation = new Point(this.location.x + movX, this.location.y + movY);
        if (this.canMoveToLocation(newLocation)) {
            var oldLocation = new Point(this.location.x, this.location.y);
            this.location.x += movX;
            this.location.y += movY;
            this.zombieManager.zombieMoved(this, oldLocation, this.location);
        }
    };
    Zombie.prototype.performDistantPlayerVisibleBehavior = function (playerLocation) {
        var movDirection = ['x', 'y'].random();
        var newX, newY;
        if (movDirection === 'x') {
            if (playerLocation.x > this.location.x) {
                newX = this.location.x + 1;
            }
            else {
                newX = this.location.x - 1;
            }
            newY = this.location.y;
        }
        else {
            if (playerLocation.y > this.location.y) {
                newY = this.location.y + 1;
            }
            else {
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
    };
    Zombie.prototype.performNearPlayerVisibleBehavior = function (playerLocation) {
        var _this = this;
        var astar = new ROT.Path.AStar(playerLocation.x, playerLocation.y, function (x, y) {
            return _this.canMoveToLocation(new Point(x, y));
        }, { topology: 4 });
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this.location.x, this.location.y, pathCallback);
        path.shift();
        if (path.length == 1) {
            this.gameOverManager.setGameOver('eaten', 'zombie');
        }
        else if (path.length > 1) {
            var oldLocation = new Point(this.location.x, this.location.y);
            this.location.x = path[0][0];
            this.location.y = path[0][1];
            this.zombieManager.zombieMoved(this, oldLocation, this.location);
        }
    };
    Zombie.prototype.draw = function (display, x, y, background) {
        var color = ROT.Color.interpolate([97, 65, 38], [255, 0, 0], this.health / 100);
        display.draw(x, y, "Z", ROT.Color.toRGB(color), background);
    };
    Zombie.prototype.canMoveToLocation = function (location) {
        var mapPassable = this.mapPassibilityManager.mapPassableAtLocation(location);
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
            this.zombieManager.zombieDied(this);
            return true;
        }
        return false;
    };
    return Zombie;
})(Entity);
//# sourceMappingURL=zombies.js.map