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
    function Cell(location, tile, foregroundColor, backgroundColor, movement) {
        if (tile === void 0) { tile = ' '; }
        if (foregroundColor === void 0) { foregroundColor = '#999'; }
        if (backgroundColor === void 0) { backgroundColor = '#000'; }
        if (movement === void 0) { movement = 0 /* Unhindered */; }
        this.tile = tile;
        this.foregroundColor = foregroundColor;
        this.backgroundColor = backgroundColor;
        this.movement = movement;
        this.location = location;
    }
    Cell.prototype.activate = function (inventoryManager, statusManager, tileManager) {
    };
    Cell.createBackgroundColor = function () {
        var backgroundGray = Math.floor(ROT.RNG.getNormal(20, 6));
        return ROT.Color.toHex([backgroundGray, backgroundGray, backgroundGray]);
    };
    return Cell;
})();
var FloorCell = (function (_super) {
    __extends(FloorCell, _super);
    function FloorCell(location) {
        _super.call(this, location, '.', '#ccc', Cell.createBackgroundColor(), 0 /* Unhindered */);
        var backgroundColor = ROT.Color.fromString(this.backgroundColor);
        var foregroundColor = ROT.Color.interpolate(backgroundColor, [255, 255, 255], 0.2);
        this.foregroundColor = ROT.Color.toHex(foregroundColor);
    }
    return FloorCell;
})(Cell);
var TreeCell = (function (_super) {
    __extends(TreeCell, _super);
    function TreeCell(location) {
        _super.call(this, location, '#', '#C04000', Cell.createBackgroundColor(), 1 /* Blocked */);
    }
    return TreeCell;
})(Cell);
var BoxCell = (function (_super) {
    __extends(BoxCell, _super);
    function BoxCell(location, ammoAmount) {
        _super.call(this, location, '*', '#FFA505', Cell.createBackgroundColor(), 0 /* Unhindered */);
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
    function SinRandomMap() {
        this.generatedCells = {};
        this.emptyCells = [];
        this.randomMultipliers = [Math.random() * 0.6 + 0.4, Math.random() * 0.6 + 0.4, Math.random() * 0.2 + 0.8];
        for (var i = 0; i < 200; i++) {
            for (var j = 0; j < 200; j++) {
                this.getCell(new Point(i, j));
            }
        }
    }
    SinRandomMap.prototype.getEmptyLocation = function () {
        return this.emptyCells.random();
    };
    SinRandomMap.prototype.getCell = function (location) {
        var locationKey = location.x + ',' + location.y;
        var cell = this.generatedCells[locationKey];
        if (cell) {
            return cell;
        }
        cell = this.generateNewCell(location);
        this.generatedCells[locationKey] = cell;
        return cell;
    };
    SinRandomMap.prototype.setCell = function (location, cell) {
        var locationKey = location.x + ',' + location.y;
        this.generatedCells[locationKey] = cell;
    };
    SinRandomMap.prototype.generateNewCell = function (location) {
        if (Math.sin(location.x * this.randomMultipliers[0]) * Math.sin(location.y * this.randomMultipliers[1]) * Math.sin(location.x * location.y * this.randomMultipliers[2]) > 0.4) {
            return new TreeCell(location);
        }
        else if (ROT.RNG.getUniform() <= 0.005) {
            return this.generateBoxCell(location);
        }
        else {
            this.emptyCells.push(location);
            return new FloorCell(location);
        }
    };
    SinRandomMap.prototype.generateBoxCell = function (location) {
        var ammoAmount = Math.ceil(ROT.RNG.getUniform() * 12) + 8;
        return new BoxCell(location, ammoAmount);
    };
    return SinRandomMap;
})();
//# sourceMappingURL=map.js.map