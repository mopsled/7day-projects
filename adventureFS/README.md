adventureFS
===========

adventureFS is a [FUSE](http://fuse.sourceforge.net/) file system written on top of [fusepy](https://github.com/terencehonles/fusepy) in python. The idea behind this project is to explore the possibilities of creating a traditional adventure-style text game using the file system as an interface.

Installation
------------

adventureFS requires python 3, [FUSE](http://fuse.sourceforge.net/)/[OSXFUSE](http://osxfuse.github.io/), and the [fusepy](https://github.com/terencehonles/fusepy) python module. It should work with any system and shell beyond that, but file systems are tricky. I have tested on:

- Mac OS X Mavericks with zsh
- Ubuntu Desktop 14.04 with bash

Running adventureFS
-------------------

Create a directory, mount adventureFS there, and use your terminal to play:

    > mkdir game
    > python3 adventureFS.py game
    # This will mount the file system on the current process and output logs to the terminal window
    
    # Open a new terminal and enter the file system directory
    > cd game

Some useful terminal commands when playing in adventureFS:

- `cd`: move between rooms
- `mv`: put items in inventory, combine items
- `cat`: inspect items
- `touch`: activate items like buttons
