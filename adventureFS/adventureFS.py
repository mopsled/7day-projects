#!/usr/bin/env python

import logging
logging.basicConfig()

from collections import defaultdict
from errno import ENOENT, EACCES, EFBIG
from stat import S_IFDIR, S_IFLNK, S_IFREG
from sys import argv, exit
from time import time
import os

from fuse import FUSE, FuseOSError, Operations, LoggingMixIn

class Item:
	def __init__(self, name, description='An item\n'):
		self.name = name
		self.description = description
		self.movable = True

		now = time()
		self._attributes = {
			'st_mode': (S_IFREG | 0o444),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 1, 'st_size': len(self.description)}

	def getAttributes(self):
		return self._attributes

class ActivatableItem(Item):
	def __init__(self, name, description='An activatable item\n'):
		super(ActivatableItem, self).__init__(name, description)
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

class AdventureFS(LoggingMixIn, Operations):
	def __init__(self):
		west = Location('west', 'mountains and wind\n')
		east = Location('east', 'shoreline and sand\n')
		key = Item('key', 'A simple skeleton key\n')
		east.hold(key)

		house = LockedLocation('house', 'old abandoned house\n')
		house.lockWith(key)

		remoteControl = ActivatableItem('remote-control', 'a comically large remote control with one big button\n')
		def openAttic():
			attic = Location('attic', 'dusty and dark\n')
			note = Item('note', 'You win!\n')
			attic.hold(note)
			house.hold(attic)
		remoteControl.action = openAttic

		house.hold(remoteControl)
		
		self.root = Location('root')
		self.root.hold(west, east, house)

		self.fd = 0

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
			item.name = os.path.basename(newPath) 
			oldParent = self.getParentLocation(oldPath)
			newParent = self.getParentLocation(newPath)
			oldParent.unhold(item)
			newParent.hold(item)
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
