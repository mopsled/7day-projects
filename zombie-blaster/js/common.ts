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
