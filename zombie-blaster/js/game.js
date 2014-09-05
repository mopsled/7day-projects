var Game = {
  display: null,
  map: [],
  engine: null,
  player: null,
  pedro: null,
  ananas: null,
  zombies: [],
  
  init: function() {
    this.display = new ROT.Display({spacing:1.1});
    document.body.appendChild(this.display.getContainer());
    
    this._generateMap();
    this._drawWholeMap();
    for (var i = 0; i < this.zombies.length; i++) {
      this.zombies[i]._draw();
    }
    this.player._draw();
    
    var scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    for (var i = 0; i < this.zombies.length; i++) {
      scheduler.add(this.zombies[i], true);
    }

    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },
  
  _generateMap: function() {
    this.mapWidth = 50;
    this.mapHeight = 50;
    for (var i = 0; i < this.mapWidth; i++) {
      row = [];
      for (var j = 0; j < this.mapHeight; j++) {
        row.push(' ');
      }
      this.map.push(row);
    }

    // var digger = new ROT.Map.Digger(this.mapWidth, this.mapHeight);
    // digger.create(digCallback.bind(this));
    var digCallback = function(x, y, wall) {
      if (wall) { return; }

      this.map[x][y] = '.';
      freeCells.push(x + "," + y);
    }

    var freeCells = [];
    var map = new ROT.Map.Cellular(this.mapWidth, this.mapHeight, {
        born: [4, 5, 6, 7, 8],
        survive: [2, 3, 4, 5]
    });
    map.randomize(0.9);
    for (var i=49; i>=0; i--) {
        map.create(i ? null : digCallback.bind(this));
    }
    
    this._generateBoxes(freeCells);
    this.player = createBeing(Player, freeCells);

    this.zombies = [];
    for (var i = 0; i < 10; i++) {
      var zombie = createBeing(Zombie, freeCells);
      this.zombies.push(zombie);
    }
  },
  
  _generateBoxes: function(freeCells) {
    for (var i = 0; i < 10; i++) {
      var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
      var key = freeCells.splice(index, 1)[0];
      var parts = key.split(",");
      var x = parseInt(parts[0]);
      var y = parseInt(parts[1]);
      this.map[x][y] = "*";
      if (i == 0) { this.ananas = key; }
    }
  },
  
  _drawWholeMap: function() {
    var screenWidth = this.display._options.width;
    var screenHeight = this.display._options.height;

    var mapOffsetX = this.player.getX() - Math.floor(screenWidth/2.0);
    var mapOffsetY = this.player.getY() - Math.floor(screenHeight/2.0);

    for (var x = 0; x < screenWidth; x++) {
      for (var y = 0; y <= screenHeight; y++) {
        if (this.invalidScreenCoordinate(x, y)) { continue; }

        if (this.invalidMapCoordinate(x + mapOffsetX, y + mapOffsetY)) {
          this.display.draw(x, y, 'x');
        } else {
          this.display.draw(x, y, this.map[x + mapOffsetX][y + mapOffsetY]);
        } 
      }
    }
  },

  invalidScreenCoordinate: function(x, y) {
    var screenWidth = this.display._options.width;
    var screenHeight = this.display._options.height;
    return x < 0 || x >= screenWidth ||
           y < 0 || y >= screenWidth;
  },
  invalidMapCoordinate: function(x, y) {
    var mapWidth = this.map.length;
    var mapHeight = this.map[0].height;
    return x < 0 || x >= mapWidth ||
           y < 0 || y >= mapHeight;
  }
};

var Player = function(x, y, id) {
  this._x = x;
  this._y = y;
  this._id = id;
}
  
Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

Player.prototype.act = function() {
  Game.engine.lock();
  window.addEventListener("keydown", this);
}
  
Player.prototype.handleEvent = function(e) {
  var code = e.keyCode;
  if (code == 13 || code == 32) {
    this._checkBox();
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
  if (Game.map[newX][newY] == ' ') { return; }

  this._x = newX;
  this._y = newY;
  Game._drawWholeMap();
  this._draw();
  window.removeEventListener("keydown", this);
  Game.engine.unlock();
}

Player.prototype._draw = function() {
  var screenWidth = Game.display._options.width;
  var screenHeight = Game.display._options.height;
  var centerX = Math.floor(screenWidth/2.0);
  var centerY = Math.floor(screenHeight/2.0);
  Game.display.draw(centerX, centerY, "@", "#ff0");
}
  
Player.prototype._checkBox = function() {
  var key = this._x + "," + this._y;
  if (Game.map[this._x][this._y] != "*") {
    alert("There is no box here!");
  } else if (key == Game.ananas) {
    alert("Hooray! You found an ananas and won this game.");
    Game.engine.lock();
    window.removeEventListener("keydown", this);
  } else {
    alert("This box is empty :-(");
  }
}
  
var Zombie = function(x, y, id) {
  this._x = x;
  this._y = y;
  this._id = id;
  this._draw();
}
  
Zombie.prototype.getSpeed = function() { return 100; }
  
Zombie.prototype.act = function() {
  var playerX = Game.player.getX();
  var playerY = Game.player.getY();

  var passableCallback = function(x, y) {
    var mapPassable = Game.map[x][y] == "." || Game.map[x][y] == "*";
    return mapPassable && !this._anotherZombieAtCoordinates(x, y);
  }

  var astar = new ROT.Path.AStar(playerX, playerY, passableCallback.bind(this), {topology:4});

  var path = [];
  var pathCallback = function(x, y) {
    path.push([x, y]);
  }
  astar.compute(this._x, this._y, pathCallback);

  path.shift();
  if (path.length == 1) {
    Game.engine.lock();
    alert("Game over - you were captured by Zombie!");
  } else if (path.length > 1) {
    x = path[0][0];
    y = path[0][1];
    this._x = x;
    this._y = y;
    this._draw();
  } else {
    this._draw();
  }
}
  
Zombie.prototype._draw = function() {
  screenXY = convertMapCoordinatesToScreen(this._x, this._y);
  if (!Game.invalidScreenCoordinate(screenXY[0], screenXY[1])) {
    Game.display.draw(screenXY[0], screenXY[1], "Z", "red");
  }
}

Zombie.prototype._anotherZombieAtCoordinates = function(x, y) {
  for (var i = 0; i < Game.zombies.length; i++) {
    var zombie = Game.zombies[i];
    if (zombie._id == this._id) continue;

    if (zombie._x == x && zombie._y == y) {
      return true;
    }
  }

  return false;
}

function convertMapCoordinatesToScreen(x, y) {
  var screenWidth = Game.display._options.width;
  var screenHeight = Game.display._options.height;

  var screenTopLeftX = Math.floor(screenWidth/2.0) - Game.player.getX();
  var screenTopLeftY = Math.floor(screenHeight/2.0) - Game.player.getY();

  return [x + screenTopLeftX, y + screenTopLeftY];
}

function createBeing(what, freeCells) {
  var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  var key = freeCells.splice(index, 1)[0];
  var parts = key.split(",");
  var x = parseInt(parts[0]);
  var y = parseInt(parts[1]);

  if (typeof createBeing.idCounter == 'undefined') {
    createBeing.idCounter = 0;
  } else {
    createBeing.idCounter++;
  }

  return new what(x, y, createBeing.idCounter);
}
