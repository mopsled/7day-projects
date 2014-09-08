var Game = {
  display: null,
  map: [],
  engine: null,
  player: null,
  pedro: null,
  ananas: null,
  zombies: {},
  
  init: function() {
    this.display = new ROT.Display({spacing:1.1});
    document.body.appendChild(this.display.getContainer());
    
    this._generateMap();
    this._drawWholeMap();
    
    var scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    for (var i = 0; i < this.zombies.list.length; i++) {
      scheduler.add(this.zombies.list[i], true);
    }

    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },
  
  _generateMap: function() {
    this.mapWidth = 500;
    this.mapHeight = 200;
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

    this.zombies.list = [];
    this.zombies.locations = {};
    this.zombies.lookupById = {};
    for (var i = 0; i < 1000; i++) {
      var zombie = createBeing(Zombie, freeCells);
      this.zombies.list.push(zombie);
      this.zombies.locations[zombie._x + ',' + zombie._y] = zombie._id;
      this.zombies.lookupById[zombie._id] = zombie;
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
    for (var x = 0; x < this.display._options.width; x++) {
      for (var y = 0; y <= this.display._options.height; y++) {
        this._drawCell(x, y);
      }
    }
  },

  _drawCell: function(screenX, screenY, background) {
    var screenWidth = this.display._options.width;
    var screenHeight = this.display._options.height;

    var mapOffsetX = this.player.getX() - Math.floor(screenWidth/2.0);
    var mapOffsetY = this.player.getY() - Math.floor(screenHeight/2.0);

    var mapX = screenX + mapOffsetX;
    var mapY = screenY + mapOffsetY;
    var key = mapX + ',' + mapY;

    if (this.invalidScreenCoordinate(screenX, screenY) || this.invalidMapCoordinate(mapX, mapY)) {
      return;
    }

    if (this.player.getX() === mapX && this.player.getY() === mapY) {
      this.player._draw(screenX, screenY, background);
    } else if (key in Game.zombies.locations) {
      var id = Game.zombies.locations[key];
      var zombie = this.zombies.lookupById[id];
      zombie._draw(screenX, screenY, background);
    } else {
      if (background === undefined) {
        this.display.draw(screenX, screenY, this.map[mapX][mapY]);
      } else {
        this.display.draw(screenX, screenY, this.map[mapX][mapY], '#aaa', background);
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
  Game._drawWholeMap();
  Game.engine.lock();
  window.addEventListener("keydown", this);
  Game.display.getContainer().addEventListener('mousemove', aim);
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
  window.removeEventListener("keydown", this);
  Game.display.getContainer().removeEventListener('mousemove', aim);
  Game.engine.unlock();
}

Player.prototype._draw = function(x, y, background) {
  Game.display.draw(x, y, "@", "#ff0", background);
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
}
  
Zombie.prototype.getSpeed = function() { return 100; }
  
Zombie.prototype.act = function() {
  screenXY = convertMapCoordinatesToScreen(this._x, this._y);
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
  
  var passableCallback = function(x, y) {
    var mapPassable = Game.map[x][y] === '.';
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
    delete Game.zombies.locations[this._x + ',' + this._y];
    x = path[0][0];
    y = path[0][1];
    this._x = x;
    this._y = y;
    Game.zombies.locations[this._x + ',' + this._y] = this._id;
  }
}
  
Zombie.prototype._draw = function(x, y, background) {
  Game.display.draw(x, y, "Z", "red", background);
}

Zombie.prototype._anotherZombieAtCoordinates = function(x, y) {
  var key = x + ',' + y;
  if (Game.zombies.locations[key] == this._id) return false;
  if (key in Game.zombies.locations) return true;
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

var previouslyHighlighted = [];

var aim = function(e) {
  for (var i = 0; i < previouslyHighlighted.length; i++) {
    point = previouslyHighlighted[i];
    Game._drawCell(point[0], point[1]);
  }
  previouslyHighlighted = [];

  var cellX = e.offsetX / e.currentTarget.clientWidth * Game.display._options.width;
  cellX = Math.floor(cellX);
  var cellY = e.offsetY / e.currentTarget.clientHeight * Game.display._options.height;
  cellY = Math.floor(cellY);

  var playerCellX = Math.floor(Game.display._options.width / 2.0);
  var playerCellY = Math.floor(Game.display._options.height / 2.0);
  var radius = Math.floor(Math.sqrt(Math.pow(playerCellX - cellX, 2) + Math.pow(playerCellY - cellY, 2)));
  var gunEffectiveRange = 4;

  for (var x = playerCellX - radius; x < playerCellX + radius; x++) {
    for (var y = playerCellY - radius; y < playerCellY + radius; y++) {
      var distanceToCell = Math.floor(Math.sqrt(Math.pow(playerCellX - x, 2) + Math.pow(playerCellY - y, 2)));
      if (distanceToCell < radius) {
        var intensity;
        if (distanceToCell < gunEffectiveRange) {
          intensity = 150;
        } else {
          intensity = Math.floor(255 * 1/distanceToCell * 1.4);
        }
        
        if (intensity > 20) {
          Game._drawCell(x, y, ROT.Color.toRGB([intensity, 0, 0]));
          previouslyHighlighted.push([x, y]);
        }
      }
    }
  }
}
