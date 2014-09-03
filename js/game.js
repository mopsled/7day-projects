var Game = {
  display: null,
  map: [],
  engine: null,
  player: null,
  pedro: null,
  ananas: null,
  
  init: function() {
    this.display = new ROT.Display({spacing:1.1});
    document.body.appendChild(this.display.getContainer());
    
    this._generateMap();
    this._drawWholeMap(); 
    
    var scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    // scheduler.add(this.pedro, true);

    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  },
  
  _generateMap: function() {
    this.mapWidth = 200;
    this.mapHeight = 100;
    for (var i = 0; i < this.mapWidth; i++) {
      row = [];
      for (var j = 0; j < this.mapHeight; j++) {
        row.push(' ');
      }
      this.map.push(row);
    }

    var digger = new ROT.Map.Digger(this.mapWidth, this.mapHeight);
    var freeCells = [];
    
    var digCallback = function(x, y, wall) {
      if (wall) { return; }

      this.map[x][y] = '.';
      freeCells.push(x + "," + y);
    }
    digger.create(digCallback.bind(this));
    
    // this._generateBoxes(freeCells);
    this.player = this._createBeing(Player, freeCells);
    // this.pedro = this._createBeing(Pedro, freeCells);
  },
  
  _createBeing: function(what, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new what(x, y);
  },
  
  // _generateBoxes: function(freeCells) {
  //   for (var i=0;i<10;i++) {
  //     var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  //     var key = freeCells.splice(index, 1)[0];
  //     this.map[key] = "*";
  //     if (!i) { this.ananas = key; } /* first box contains an ananas */
  //   }
  // },
  
  _drawWholeMap: function() {
    var screenWidth = this.display._options.width;
    var screenHeight = this.display._options.height;

    var mapOffsetX = this.player.getX() - Math.floor(screenWidth/2.0);
    var mapOffsetY = this.player.getY() - Math.floor(screenHeight/2.0);

    for (var x = 0; x < screenWidth; x++) {
      for (var y = 0; y <= screenHeight; y++) {
        if (this._invalidScreenCoordinate(x, y)) { continue; }

        if (this._invalidMapCoordinate(x + mapOffsetX, y + mapOffsetY)) {
          this.display.draw(x, y, 'x');
        } else {
          this.display.draw(x, y, this.map[x + mapOffsetX][y + mapOffsetY]);
        }
        
      }
    }

    this.player._draw();
  },

  _invalidScreenCoordinate: function(x, y) {
    var screenWidth = this.display._options.width;
    var screenHeight = this.display._options.height;
    return x < 0 || x >= screenWidth ||
           y < 0 || y >= screenWidth;
  },
  _invalidMapCoordinate: function(x, y) {
    var mapWidth = this.map.length;
    var mapHeight = this.map[0].height;
    return x < 0 || x >= mapWidth ||
           y < 0 || y >= mapHeight;
  }
};

var Player = function(x, y) {
  this._x = x;
  this._y = y;
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
  
// Player.prototype._checkBox = function() {
//   var key = this._x + "," + this._y;
//   if (Game.map[key] != "*") {
//     alert("There is no box here!");
//   } else if (key == Game.ananas) {
//     alert("Hooray! You found an ananas and won this game.");
//     Game.engine.lock();
//     window.removeEventListener("keydown", this);
//   } else {
//     alert("This box is empty :-(");
//   }
// }
  
// var Pedro = function(x, y) {
//   this._x = x;
//   this._y = y;
//   this._draw();
// }
  
// Pedro.prototype.getSpeed = function() { return 100; }
  
// Pedro.prototype.act = function() {
//   var x = Game.player.getX();
//   var y = Game.player.getY();

//   var passableCallback = function(x, y) {
//     return (x+","+y in Game.map);
//   }
//   var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

//   var path = [];
//   var pathCallback = function(x, y) {
//     path.push([x, y]);
//   }
//   astar.compute(this._x, this._y, pathCallback);

//   path.shift();
//   if (path.length == 1) {
//     Game.engine.lock();
//     alert("Game over - you were captured by Pedro!");
//   } else {
//     x = path[0][0];
//     y = path[0][1];
//     Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
//     this._x = x;
//     this._y = y;
//     this._draw();
//   }
// }
  
// Pedro.prototype._draw = function() {
//   Game.display.draw(this._x, this._y, "P", "red");
// }