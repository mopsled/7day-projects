/// <reference path="common.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Movement;
(function (Movement) {
    Movement[Movement["Unhindered"] = 0] = "Unhindered";
    Movement[Movement["Blocked"] = 1] = "Blocked";
})(Movement || (Movement = {}));
;
var Cell = (function () {
    function Cell(location, tile, movement) {
        if (tile === void 0) { tile = ' '; }
        if (movement === void 0) { movement = 0 /* Unhindered */; }
        this.location = location;
        this.tile = tile;
        this.movement = movement;
    }
    Cell.prototype.activate = function (inventoryManager, statusManager, tileManager) {
    };
    return Cell;
})();
var FloorCell = (function (_super) {
    __extends(FloorCell, _super);
    function FloorCell(location) {
        _super.call(this, location, '.', 0 /* Unhindered */);
    }
    return FloorCell;
})(Cell);
var TreeCell = (function (_super) {
    __extends(TreeCell, _super);
    function TreeCell(location) {
        _super.call(this, location, '#', 1 /* Blocked */);
    }
    return TreeCell;
})(Cell);
var BoxCell = (function (_super) {
    __extends(BoxCell, _super);
    function BoxCell(location, ammoAmount) {
        _super.call(this, location, '*', 0 /* Unhindered */);
        this.ammoAmount = ammoAmount;
    }
    BoxCell.prototype.activate = function (inventoryManager, statusManager, tileManager) {
        inventoryManager.ammo += this.ammoAmount;
        statusManager.setStatus('%c{green}You found ' + this.ammoAmount + ' shells');
        tileManager.setCell(this.location, new FloorCell(this.location));
    };
    return BoxCell;
})(Cell);
var SinRandomMap = (function () {
    function SinRandomMap(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.openFloorLocations = [];
        this.randomMultipliers = [Math.random() * 0.6 + 0.4, Math.random() * 0.6 + 0.4, Math.random() * 0.2 + 0.8];
        this.generateFloor();
        this.generateBoxes();
    }
    SinRandomMap.prototype.generateFloor = function () {
        var _this = this;
        for (var i = 0; i < this.width; i++) {
            var row = [];
            for (var j = 0; j < this.height; j++) {
                row.push(new FloorCell(new Point(i, j)));
            }
            this.cells.push(row);
        }
        var map = new ROT.Map.Arena(this.width, this.height);
        map.create(function (x, y, wall) {
            _this.digCallback(x, y, wall);
        });
    };
    SinRandomMap.prototype.digCallback = function (x, y, wall) {
        var point = new Point(x, y);
        if (x == 0 || y == 0 || x >= this.width || y >= this.height) {
            this.cells[x][y] = new TreeCell(point);
        }
        else if (Math.sin(x * this.randomMultipliers[0]) * Math.sin(y * this.randomMultipliers[1]) * Math.sin(x * y * this.randomMultipliers[2]) > 0.4) {
            this.cells[x][y] = new TreeCell(point);
        }
        else {
            this.cells[x][y] = new FloorCell(point);
            this.openFloorLocations.push(point);
        }
    };
    SinRandomMap.prototype.generateBoxes = function () {
        for (var i = 0; i < 500; i++) {
            var index = Math.floor(ROT.RNG.getUniform() * this.openFloorLocations.length);
            var point = this.openFloorLocations.splice(index, 1)[0];
            var ammoAmount = Math.ceil(ROT.RNG.getUniform() * 12) + 8;
            var box = new BoxCell(point, ammoAmount);
            this.cells[point.x][point.y] = box;
        }
    };
    SinRandomMap.prototype.setCell = function (location, cell) {
        this.cells[location.x][location.y] = cell;
    };
    return SinRandomMap;
})();
//# sourceMappingURL=map.js.map