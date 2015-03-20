#!/usr/bin/env python

import logging
logging.basicConfig()

from collections import defaultdict
from errno import ENOENT, EACCES, EFBIG, EPERM, EEXIST
from stat import S_IFDIR, S_IFLNK, S_IFREG
from sys import argv, exit
from time import time
import os

from fuse import FUSE, FuseOSError, Operations, LoggingMixIn

def setupStory():
	root = Location('neighborhood')

	river = Location('river', 'a torrent of cool water from the mountains')
	key = Item('key', 'single key on corroded key chain')
	river.hold(key)

	house = LockedLocation('house', 'old abandoned house')
	house.lockWith(key)
	
	bedroom = Location('bedroom', 'rotted bed against the wall, closet in the corner')
	closet = Location('closet', 'dark, smells like mildew')
	battery = Item('battery', 'generic brand battery')
	closet.hold(battery)
	bedroom.hold(closet)

	livingRoom = Location('living-room', 'torn carpet, couch has been propped against a window')
	tv = Item('tv', "blares static but it doesn't seem to be plugged in")
	tv.movable = False
	couch = Item('couch', 'ugly patterned monstrosity')
	couch.movable = False
	bookcase = Item('bookcase', 'untouched playthings for the literate')
	bookcase.movable = False
	livingRoom.hold(tv, couch, bookcase)

	kitchen = Location('kitchen', 'utensils are gone, table is broken')
	deadRemote = Item('remote-control', 'lifeless plastic parasite')
	kitchen.hold(deadRemote)

	poweredRemote = ActivatableItemOnTouch('powered-remote', 'entertainment stick')
	def openBookcase():
		livingRoom.unhold(bookcase)

		ajarBookcase = Location('ajar-bookcase', 'staircases lead up and down')
		attic = Location('attic', 'dark and dusty')
		pictures = Item('pictures', 'whole family of easily forgotten faces')
		attic.hold(pictures)

		basement = Location('basement', 'dark. you feel a switch on the wall')
		lightSwitch = ActivatableItemOnTouch('switch')
		def illuminateBasement():
			basement.setDescription('small shadows scuttle in the corners')
			bombShelter = Location('bomb-shelter', 'mostly scavenged concrete tomb')
			cannedFood = Item('canned-food', 'preserved precooked meat product')
			bombShelter.hold(cannedFood)

			def showEpilogue():
				epilogue = Item('epilogue', "this is the first time you've eaten all week. your voracious appetite doesn't allow you to savor any bite. the can quickly becomes empty. you'll rest for now, and face the world again tomorrow")
				bombShelter.hold(epilogue)

			getCombiner().addFormulaWithAction([cannedFood, knife], showEpilogue)
			basement.hold(bombShelter)
		lightSwitch.action = illuminateBasement
		basement.hold(lightSwitch)

		ajarBookcase.hold(attic, basement)
		livingRoom.hold(ajarBookcase)

	poweredRemote.action = openBookcase
	getCombiner().addFormula([deadRemote, battery], poweredRemote)

	house.hold(bedroom, livingRoom, kitchen)

	park = Location('park', 'unused swings hang on rusty chains. the grass is long overgrown')
	knife = Item('knife', 'discolored stainless steel')
	park.hold(knife)

	prologue = Item('prologue', "you are hungry. it's been days")
	root.hold(prologue, park, river, house)

	return root

class Item:
	def __init__(self, name, description='plain item'):
		self.name = name
		self.description = description + '\n'
		self.movable = True

		now = time()
		self._attributes = {
			'st_mode': (S_IFREG | 0o444),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 1, 'st_size': len(self.description)}

	def getAttributes(self):
		return self._attributes

	def onTouched(self):
		pass

class ActivatableItem(Item):
	def __init__(self, name, description='magic item'):
		super(ActivatableItem, self).__init__(name, description)
		self._attributes['st_mode'] = (S_IFREG | 0o777)
		self.action = None

	def activate(self):
		if self.action is not None:
			self.action()

class ActivatableItemOnTouch(ActivatableItem):
	def onTouched(self):
		if self.action is not None:
			self.action()
			self.action = None

class Location:
	def __init__(self, name, description=None):
		self.name = name
		self._inside = []
		if description is not None:
			self.setDescription(description)

		now = time()
		self._attributes = {
			'st_mode': (S_IFDIR | 0o755),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 2}

	def getInside(self):
		return self._inside + [getInventory()]

	def getAttributes(self):
		return self._attributes
	
	def hold(self, *things):
		self._inside.extend(things)

	def unhold(self, thing):
		self._inside.remove(thing)

	def setDescription(self, description):
		self._inside = [item for item in self._inside if item.name != '_description']
		descriptionItem = Item('_description', description)
		descriptionItem.movable = False
		self._inside.append(descriptionItem)

class LockedLocation(Location):
	def __init__(self, name, description=None):
		super(LockedLocation, self).__init__(name, description)
		self.lockedWith = None

	def lockWith(self, item):
		self.lockedWith = item

	def locked(self):
		if self.lockedWith is None:
			return False
		elif self.lockedWith in getInventory().getInside():
			return False
		return True

	def getAttributes(self):
		if self.locked():
			self._attributes['st_mode'] = (S_IFDIR | 0o000)
		else:
			self._attributes['st_mode'] = (S_IFDIR | 0o755)
		return self._attributes

class Inventory(Location):
	def __init__(self):
		super(Inventory, self).__init__('_inventory')

	def getInside(self):
		return self._inside

def getInventory():
	return getInventory.inventory
getInventory.inventory = Inventory()

class ItemCombiner:
	def __init__(self):
		self.formulae = defaultdict(None)

	def addFormula(self, items, result):
		def action():
			return result
		self.addFormulaWithAction(items, action)

	def addFormulaWithAction(self, items, action):
		self.formulae[self.setForItems(items)] = action

	def canCombine(self, *items):
		return self.setForItems(items) in self.formulae

	def combine(self, *items):
		action = self.formulae.get(self.setForItems(items), None)
		if action is not None:
			return action()

	def setForItems(self, items):
		return frozenset([i.description for i in items])

def getCombiner():
	return getCombiner.combiner
getCombiner.combiner = ItemCombiner()

class AdventureFS(LoggingMixIn, Operations):
	def __init__(self):
		self.fd = 0
		self.root = setupStory()

	def access(self, path, mode):
		location = self.getLocation(path)
		try:
			if mode == 1 and location.locked():
				raise FuseOSError(EACCES)
		except AttributeError:
			# Location doesn't respond to 'locked()'
			pass

	def getattr(self, path, fh=None):
		location = self.getLocation(path)
		if location is None:
			raise FuseOSError(ENOENT)
		else:
			return location.getAttributes()

	def getxattr(self, path, name, position=0):
		return bytes()

	def open(self, path, flags):
		self.fd += 1
		return self.fd

	def read(self, path, size, offset, fh):
		location = self.getLocation(path)
		return bytes(location.description[offset:offset + size], 'utf-8')
		
	def readdir(self, path, fh):
		location = self.getLocation(path)
		return ['.', '..'] + [f.name for f in location.getInside()]

	def rename(self, oldPath, newPath):
		item = self.getLocation(oldPath)
		if isinstance(item, Item):
			if not item.movable:
				raise FuseOSError(EACCES)
			oldParent = self.getParentLocation(oldPath)
			newParent = self.getParentLocation(newPath)
			combiningItem = self.getLocation(newPath)
			if combiningItem is None:
				item.name = os.path.basename(newPath) 
				oldParent.unhold(item)
				newParent.hold(item)
			elif getCombiner().canCombine(item, combiningItem):
				oldParent.unhold(item)
				newParent.unhold(combiningItem)
				combined = getCombiner().combine(item, combiningItem)
				if combined is not None:
					newParent.hold(combined)
			else:
				raise FuseOSError(EEXIST)
		else:
			raise FuseOSError(EFBIG)

	def utimens(self, path, times):
		item = self.getLocation(path)
		item.onTouched()

	def statfs(self, path):
		return dict(f_bsize=512, f_blocks=4096, f_bavail=2048)

	def getLocation(self, path):
		location = self.root
		for part in filter(None, path.split('/')):
			inside = location.getInside()
			location = next(filter(lambda x: x.name == part, inside), None)
			if location is None:
				return None
		return location

	def getParentLocation(self, path):
		parentPath = os.path.dirname(path)
		return self.getLocation(parentPath)

if __name__ == '__main__':
	if len(argv) != 2:
		print('usage: %s <game mount point>' % argv[0])
		exit(1)

	logging.getLogger().setLevel(logging.DEBUG)
	fuse = FUSE(AdventureFS(), argv[1], foreground=True)
