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
	west = Location('west', 'mountains and wind')
	east = Location('east', 'shoreline and sand')
	key = Item('key', 'skeleton key')
	east.hold(key)

	house = LockedLocation('house', 'old abandoned house')
	house.lockWith(key)

	battery = Item('battery', 'generic brand battery')
	remote = Item('remote-control', 'lifeless plastic parasite')
	poweredRemote = ActivatableItem('powered-remote-control', 'entertainment stick')
	getCombiner().addFormula([battery, remote], poweredRemote)

	def openAttic():
		attic = Location('attic', 'dusty and dark')
		note = Item('note', 'you win')
		attic.hold(note)
		house.hold(attic)
		poweredRemote.action = None
	poweredRemote.action = openAttic

	house.hold(battery)
	house.hold(remote)
	
	root = Location('root')
	root.hold(west, east, house)
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

class ActivatableItem(Item):
	def __init__(self, name, description='magic item'):
		super(ActivatableItem, self).__init__(name, description)
		self._attributes['st_mode'] = (S_IFREG | 0o777)
		self.action = None

	def activate(self):
		if self.action is not None:
			self.action()

class Location:
	def __init__(self, name, description=None):
		self.name = name
		self.description = description
		self._inside = []

		now = time()
		self._attributes = {
			'st_mode': (S_IFDIR | 0o755),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 2}

	def getInside(self):
		defaults = self._inside + [getInventory()]
		if self.description is None:
			return defaults
		else:
			description = Item('description', self.description)
			description.movable = False
			return defaults + [description]

	def getAttributes(self):
		return self._attributes
	
	def hold(self, *things):
		self._inside.extend(things)

	def unhold(self, thing):
		self._inside.remove(thing)

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
		super(Inventory, self).__init__('inventory')

	def getInside(self):
		return self._inside

def getInventory():
	return getInventory.inventory
getInventory.inventory = Inventory()

class ItemCombiner:
	def __init__(self):
		self.formulae = defaultdict(None)

	def addFormula(self, items, result):
		self.formulae[self.setForItems(items)] = result

	def canCombine(self, *items):
		return self.setForItems(items) in self.formulae

	def combine(self, *items):
		return self.formulae.get(self.setForItems(items), None)

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
				combined = getCombiner().combine(item, combiningItem)
				oldParent.unhold(item)
				newParent.unhold(combiningItem)
				newParent.hold(combined)
			else:
				raise FuseOSError(EEXIST)
		else:
			raise FuseOSError(EFBIG)

	def utimens(self, path, times):
		item = self.getLocation(path)
		if isinstance(item, ActivatableItem):
			item.activate()

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
