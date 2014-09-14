#!/usr/bin/env python

import logging
logging.basicConfig()

from collections import defaultdict
from errno import ENOENT, EACCES
from stat import S_IFDIR, S_IFLNK, S_IFREG
from sys import argv, exit
from time import time

from fuse import FUSE, FuseOSError, Operations, LoggingMixIn

if not hasattr(__builtins__, 'bytes'):
	bytes = str

class AdventureFS(LoggingMixIn, Operations):
	def __init__(self):
		self.filesUnder = {}
		self.fileAttributes = {}
		self.data = defaultdict(bytes)
		self.fd = 0
		now = time()
		self.fileAttributes['/'] = dict(st_mode=(S_IFDIR | 0755), st_ctime=now, st_mtime=now, st_atime=now, st_nlink=2)
		self.filesUnder['/'] = ['door', 'key']
		self.fileAttributes['inventory'] = dict(st_mode=(S_IFDIR | 0755), st_ctime=now, st_mtime=now, st_atime=now, st_nlink=3)
		self.fileAttributes['/door'] = dict(st_mode=(S_IFDIR | 0000), st_ctime=now,
											st_mtime=now, st_atime=now, st_nlink=3)
		self.filesUnder['/door'] = ['message']
		self.data['/door/message'] = 'You Win!\n'
		self.fileAttributes['/door/message'] = dict(st_mode=(S_IFREG | 0666), st_ctime=now, st_mtime=now, st_atime=now, st_nlink=1, st_size=len(self.data['/door/message']))
		self.data['/key'] = 'A simple skeleton key\n'
		self.fileAttributes['/key'] = dict(st_mode=(S_IFREG | 0666), st_ctime=now, st_mtime=now, st_atime=now, st_nlink=1, st_size=len(self.data['/key']))
		self.inventory = []

	def access(self, path, mode):
		if path == '/door' and not ('key' in self.inventory):
			raise FuseOSError(EACCES)

	def getattr(self, path, fh=None):
		if path.endswith('/inventory'):
			path = 'inventory'
		elif '/inventory/' in path:
			item = path.split('/')[-1]
			if item in self.inventory:
				path = 'inventory/' + item
				now = time()
				attributes = dict(st_mode=(S_IFREG | 0666), st_ctime=now, st_mtime=now, st_atime=now, st_nlink=1)
				if self.data[path]:
					attributes['st_size'] = len(self.data[path])
				return attributes

		if path not in self.fileAttributes:
			raise FuseOSError(ENOENT)

		return self.fileAttributes[path]

	def getxattr(self, path, name, position=0):
		if path.endswith('/inventory'):
			path = 'inventory'

		attrs = self.fileAttributes[path].get('attrs', {})

		try:
			return attrs[name]
		except KeyError:
			return ''       # Should return ENOATTR

	def open(self, path, flags):
		self.fd += 1
		return self.fd

	def read(self, path, size, offset, fh):
		if '/inventory/' in path:
			item = path.split('/')[-1]
			if item in self.inventory:
				path = 'inventory/' + item
		return self.data[path][offset:offset + size]

	def readdir(self, path, fh):
		if path.endswith('/inventory'):
			return ['.', '..'] + self.inventory
		return ['.', '..', 'inventory'] + self.filesUnder[path]

	def rename(self, old, new):
		if old == '/key' and new == '/inventory/key' and 'key' in self.filesUnder['/']:
			self.inventory.append('key')
			self.data['inventory/key'] = self.data['/key']
			self.filesUnder['/'].remove('key')
			del self.data['/key']
		else:
			raise FuseOSError(ENOENT)

	def statfs(self, path):
		return dict(f_bsize=512, f_blocks=4096, f_bavail=2048)

if __name__ == '__main__':
	if len(argv) != 2:
		print('usage: %s <game mount point>' % argv[0])
		exit(1)

	logging.getLogger().setLevel(logging.DEBUG)
	fuse = FUSE(AdventureFS(), argv[1], foreground=True)
