# Bare bones makefile

INSTALL_PLUGINS_DIR	=	/usr/local/lib/ladspa/

###############################################################################
#
# GENERAL
#

INCLUDES	=	-I.
LIBRARIES	=	-lm
CFLAGS		=	$(INCLUDES) -Wall -Werror -O3 -msse2 -mfpmath=sse -fPIC
CC		=	cc

vocoder.so:	vocoder.c
	$(CC) $(CFLAGS) -o vocoder.o -c vocoder.c
	$(LD) $(LIBRARIES) -o vocoder.so vocoder.o -shared

###############################################################################
#
# TARGETS
#

install:	targets
	-mkdir -p $(INSTALL_PLUGINS_DIR)
	cp *.so $(INSTALL_PLUGINS_DIR)

targets:	vocoder.so

clean:
	-rm -f *.o *.so *~ core

###############################################################################
