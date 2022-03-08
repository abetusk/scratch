# License: CC0
#

IDIR=.
CC=gcc
CFLAGS=-I$(IDIR) -g
LIBS=-lfftw3 -lm

fspike: fspike.c
	$(CC) -o $@ $^ $(CFLAGS) $(LIBS)

.PHONY: clean
clean:
	rm -f fspike

