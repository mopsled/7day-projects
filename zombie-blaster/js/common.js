/// <reference path="rot.js-TS/rot.d.ts" />
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Entity = (function () {
    function Entity(location) {
        this.location = location;
        Entity.idCounter++;
        this.id = Entity.idCounter;
    }
    Entity.idCounter = 0;
    return Entity;
})();
//# sourceMappingURL=common.js.map