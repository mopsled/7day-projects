/// <reference path="rot.js-TS/rot.d.ts" />

class Point {
  constructor(public x: number, public y: number) { }
}

interface InventoryManager {
  ammo: number;
}

interface GameOverManager {
  setGameOver(killedHow: string, killedByWhat: string);
}

interface StatusManager {
  setStatus(status: string);
}

interface MapPassibilityManager {
  mapPassableAtLocation(location: Point);
}

class Entity {
  location: Point;
  id: number;
  static idCounter = 0;

  constructor(location: Point) {
    this.location = location;
    Entity.idCounter++;
    this.id = Entity.idCounter;
  }
}