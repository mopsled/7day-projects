/// <reference path="rot.js-TS/rot.d.ts" />

class Point {
  constructor(public x: number, public y: number) { }
}

interface InventoryManager {
  ammo: number;
}

interface StatusManager {
  setStatus(status: string);
}

interface CoordinateManager {
	convertMapCoordinatesToScreen(x: number, y: number);
	convertScreenCoordinatesToMap(x: number, y: number);
  invalidScreenCoordinate(x: number, y: number);
  invalidMapCoordinate(x: number, y: number);
}

interface ScreenDrawer {
	drawScreen();
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