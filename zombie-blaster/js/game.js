/// <reference path="common.d.ts" />
/// <reference path="map.d.ts" />
/// <reference path="zombies.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GameStats = (function () {
    function GameStats() {
        this.turns = 0;
    }
    return GameStats;
})();
var Game = (function () {
    function Game() {
    }
    Game.init = function () {
        this.zombieManager = new ZombieManager();
        this.statusChunkSize = 30;
        this.mapChunkSize = 80;
        this.status = '';
        this.display = new ROT.Display({ spacing: 1.1, width: this.statusChunkSize + this.mapChunkSize, height: 24 });
        document.body.appendChild(this.display.getContainer());
        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);
        this.generateMap();
        this.scheduler.add(this.player, true);
        this.engine.start();
        this.drawScreen();
        this.setStatus('%c{yellow}Arrow keys move\nMouse to aim\nClick to shoot\nSpace to loot');
    };
    Game.generateMap = function () {
        this.map = new SinRandomMap(500, 200);
        var index = Math.floor(ROT.RNG.getUniform() * this.map.openFloorLocations.length);
        var location = this.map.openFloorLocations.splice(index, 1)[0];
        // this.player = new Player(location);
        this.player = new Player(new Point(3, 3));
        this.zombieManager.generateZombies(1000, this.map.openFloorLocations, this, this.zombieManager, this.player, this.map, this, this, this.engine, this.display, this.scheduler);
    };
    Game.drawScreen = function () {
        for (var x = this.statusChunkSize; x < this.display.getOptions().width; x++) {
            for (var y = 0; y <= this.display.getOptions().height; y++) {
                this.drawCell(x, y);
            }
        }
        this.drawStatusSection();
    };
    Game.drawCell = function (screenX, screenY, background) {
        var screenWidthOfMap = this.mapChunkSize;
        var screenHeight = this.display.getOptions().height;
        var mapOffsetX = this.player.location.x - Math.floor(this.mapChunkSize / 2.0 + this.statusChunkSize);
        var mapOffsetY = this.player.location.y - Math.floor(screenHeight / 2.0);
        var mapX = screenX + mapOffsetX;
        var mapY = screenY + mapOffsetY;
        var key = mapX + ',' + mapY;
        if (this.invalidScreenCoordinate(screenX, screenY)) {
            return;
        }
        else if (this.invalidMapCoordinate(mapX, mapY)) {
            if (background) {
                this.display.draw(screenX, screenY, ' ', '#aaa', background);
            }
            else {
                this.display.draw(screenX, screenY, ' ');
            }
            return;
        }
        if (this.player.location.x === mapX && this.player.location.y === mapY) {
            this.player.draw(screenX, screenY, background);
        }
        else if (key in this.zombieManager.locations) {
            var id = this.zombieManager.locations[key];
            var zombie = this.zombieManager.lookupById[id];
            zombie.draw(screenX, screenY, background);
        }
        else {
            if (background) {
                this.display.draw(screenX, screenY, this.map.cells[mapX][mapY].tile, '#aaa', background);
            }
            else {
                this.display.draw(screenX, screenY, this.map.cells[mapX][mapY].tile);
            }
        }
    };
    Game.drawStatusSection = function () {
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
        this.display.drawText(1, 21, 'Zombies Killed: ' + this.zombieManager.zombiesKilled, sizeX - 3);
    };
    Game.setStatus = function (status) {
        this.status = status;
        this.drawStatusSection();
    };
    Game.invalidScreenCoordinate = function (x, y) {
        var screenWidth = this.display.getOptions().width;
        var screenHeight = this.display.getOptions().height;
        return x < 0 || x >= screenWidth || y < 0 || y >= screenWidth;
    };
    Game.invalidMapCoordinate = function (x, y) {
        return x < 0 || x >= this.map.width || y < 0 || y >= this.map.height;
    };
    Game.convertMapCoordinatesToScreen = function (x, y) {
        var screenWidth = this.mapChunkSize;
        var screenHeight = this.display.getOptions().height;
        var screenTopLeftX = Math.floor(screenWidth / 2.0) + this.statusChunkSize - this.player.location.x;
        var screenTopLeftY = Math.floor(screenHeight / 2.0) - this.player.location.y;
        return [x + screenTopLeftX, y + screenTopLeftY];
    };
    Game.convertScreenCoordinatesToMap = function (x, y) {
        var screenWidth = this.mapChunkSize;
        var screenHeight = this.display.getOptions().height;
        var mapTopLeftX = this.player.location.x - (Math.floor(screenWidth / 2.0) + +this.statusChunkSize);
        var mapTopLeftY = this.player.location.y - Math.floor(screenHeight / 2.0);
        return [x + mapTopLeftX, y + mapTopLeftY];
    };
    Game.stats = new GameStats();
    return Game;
})();
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(location) {
        _super.call(this, location);
        this.ammo = 12;
        this.weapon = new Shotgun();
    }
    Player.prototype.getSpeed = function () {
        return 100;
    };
    Player.prototype.act = function () {
        var _this = this;
        Game.zombieManager.generateZombies(Game.zombieManager.zombieRate, Game.map.openFloorLocations, Game, Game.zombieManager, Game.player, Game.map, Game, Game, Game.engine, Game.display, Game.scheduler);
        Game.drawScreen();
        Game.engine.lock();
        this.keyboardEventListener = function (event) {
            _this.handleEvent(event);
        };
        this.mouseMoveEventListener = function (event) {
            Game.player.weapon.aim(event);
        };
        this.mouseUpEventListener = function (event) {
            Game.player.weapon.fire(event);
        };
        window.addEventListener("keydown", this.keyboardEventListener);
        if (this.ammo > 0) {
            Game.display.getContainer().addEventListener('mousemove', this.mouseMoveEventListener);
            Game.display.getContainer().addEventListener('mouseup', this.mouseUpEventListener);
        }
    };
    Player.prototype.handleEvent = function (e) {
        var code = e.keyCode;
        if (code == 13 || code == 32) {
            var cell = Game.map.cells[this.location.x][this.location.y];
            (function () { return cell.activate(Game.player, Game, Game.map); })();
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
        if (!(code in keyMap)) {
            return;
        }
        /* is there a free space? */
        var dir = ROT.DIRS[8][keyMap[code]];
        var newX = this.location.x + dir[0];
        var newY = this.location.y + dir[1];
        if (Game.map.cells[newX][newY].movement === 1 /* Blocked */) {
            return;
        }
        this.location.x = newX;
        this.location.y = newY;
        window.removeEventListener("keydown", this.keyboardEventListener);
        Game.display.getContainer().removeEventListener('mousemove', this.mouseMoveEventListener);
        Game.display.getContainer().removeEventListener('mouseup', this.mouseUpEventListener);
        Game.stats.turns++;
        Game.engine.unlock();
    };
    Player.prototype.draw = function (x, y, background) {
        Game.display.draw(x, y, "@", "#ff0", background);
    };
    return Player;
})(Entity);
var Shotgun = (function () {
    function Shotgun() {
        this.currentlyAimed = [];
    }
    Shotgun.prototype.aim = function (e) {
        for (var i = 0; i < this.currentlyAimed.length; i++) {
            var cell = this.currentlyAimed[i];
            Game.drawCell(cell.point.x, cell.point.y);
        }
        this.currentlyAimed = [];
        var cellX = e.offsetX / e.srcElement.clientWidth * Game.display.getOptions().width;
        cellX = Math.floor(cellX);
        var cellY = e.offsetY / e.srcElement.clientHeight * Game.display.getOptions().height;
        cellY = Math.floor(cellY);
        var playerCellX = Math.floor(Game.mapChunkSize / 2.0 + Game.statusChunkSize);
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
                if (x === playerCellX && y === playerCellY)
                    continue;
                var distanceToCell = Math.floor(Math.sqrt(Math.pow(playerCellX - x, 2) + Math.pow(playerCellY - y, 2)));
                if (distanceToCell > effectiveRange) {
                    continue;
                }
                else if (pointInTriangle(new Point(x, y), new Point(playerCellX, playerCellY), arcStart, arcEnd)) {
                    var intensity;
                    if (distanceToCell <= lethalRange) {
                        intensity = 150;
                    }
                    else {
                        intensity = (effectiveRange - distanceToCell) / effectiveRange * 150;
                    }
                    Game.drawCell(x, y, ROT.Color.toRGB([intensity, 0, 0]));
                    this.currentlyAimed.push({ point: new Point(x, y), intensity: intensity });
                }
            }
        }
    };
    Shotgun.prototype.fire = function (e) {
        Game.player.ammo--;
        var zombiesHit = 0;
        var zombiesDied = 0;
        for (var i = 0; i < this.currentlyAimed.length; i++) {
            var point = Game.convertScreenCoordinatesToMap(this.currentlyAimed[i].point.x, this.currentlyAimed[i].point.y);
            var key = point[0] + ',' + point[1];
            if (key in Game.zombieManager.locations) {
                var zombie = Game.zombieManager.lookupById[Game.zombieManager.locations[key]];
                var intensity = this.currentlyAimed[i].intensity;
                var died = zombie.takeDamage(intensity);
                if (died) {
                    zombiesDied++;
                }
                else {
                    zombiesHit++;
                }
            }
        }
        var diedConjugation = (zombiesDied == 1 ? '' : 's');
        var hitConjugation = (zombiesHit == 1 ? '' : 's');
        if (zombiesDied == 0 && zombiesHit == 0) {
            Game.setStatus("%c{yellow}Your blast shoots harmlessly into the distance");
        }
        else if (zombiesDied > 0 && zombiesHit > 0) {
            Game.setStatus('%c{green}You killed ' + zombiesDied + ' zombie' + diedConjugation + ' and injured ' + zombiesHit + ' other' + hitConjugation);
        }
        else if (zombiesDied > 0) {
            Game.setStatus('%c{green}You killed ' + zombiesDied + ' zombie' + diedConjugation);
        }
        else if (zombiesHit > 0) {
            Game.setStatus("%c{green}That blast hurt " + zombiesHit + " zombie" + hitConjugation);
        }
        Game.display.getContainer().removeEventListener('mousemove', Game.player.mouseMoveEventListener);
        Game.display.getContainer().removeEventListener('mouseup', Game.player.mouseUpEventListener);
        window.removeEventListener("keydown", Game.player.keyboardEventListener);
        Game.engine.unlock();
    };
    return Shotgun;
})();
function rotate(center, point, degrees) {
    var rad = degrees * Math.PI / 180;
    var x = center.x + (point.x - center.x) * Math.cos(rad) + (center.y - point.y) * Math.sin(rad);
    var y = center.y + (point.y - center.y) * Math.cos(rad) + (point.x - center.x) * Math.sin(rad);
    return new Point(x, y);
}
function pointInTriangle(pt, v1, v2, v3) {
    var b1 = sign(pt, v1, v2) < 0;
    var b2 = sign(pt, v2, v3) < 0;
    var b3 = sign(pt, v3, v1) < 0;
    return ((b1 == b2) && (b2 == b3));
}
function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
//# sourceMappingURL=game.js.map