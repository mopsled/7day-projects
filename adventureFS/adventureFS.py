#!/usr/bin/env python

import logging
logging.basicConfig()

from collections import defaultdict
from errno import ENOENT, EACCES
from stat import S_IFDIR, S_IFLNK, S_IFREG
from sys import argv, exit
from time import time
import os

from fuse import FUSE, FuseOSError, Operations, LoggingMixIn

class Item:
	def __init__(self, name, description='An Item\n'):
		self.name = name
		self.description = description

		now = time()
		self._attributes = {
			'st_mode': (S_IFREG | 0o444),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 1, 'st_size': len(self.description)}

	def getAttributes(self):
		return self._attributes

class Location:
	def __init__(self, name):
		self.name = name
		self._inside = []

		now = time()
		self._attributes = {
			'st_mode': (S_IFDIR | 0o755),
			'st_ctime': now, 'st_mtime': now, 'st_atime': now,
			'st_nlink': 2}

	def getInside(self):
		return self._inside + [getInventory()]

	def getAttributes(self):
		return self._attributes
	
	def hold(self, thing):
		self._inside.append(thing)

	def unhold(self, thing):
		self._inside.remove(thing)

class LockedLocation(Location):
	def __init__(self, name):
		self.lockedWith = None
		super(LockedLocation, self).__init__(name)

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
		west = Location('west')
		east = Location('east')
		key = Item('key')
		east.hold(key)

		house = LockedLocation('house')
		house.lockWith(key)
		note = Item('note', 'You win!\n')
		house.hold(note)

		self.root = Location('root')
		self.root.hold(west)
		self.root.hold(east)
		self.root.hold(house)

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
		oldParent = self.getParentLocation(oldPath)
		newParent = self.getParentLocation(newPath)
		oldParent.unhold(item)
		newParent.hold(item)

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
