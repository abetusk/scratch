INSTALLDIR=/usr/local/bin

src = $(wildcard *.cpp *c)
hdr = $(wildcard *.h *.hpp)

CC=g++
#COPT=-g -std=c++11 -I.
COPT=-O3 --std=c++11

noimg: $(src) $(hdr)
	$(CC) $(COPT) -o $@ $^

.PHONY: clean
clean:
	rm -f *.o noimg

.PHONY: install
install: noimg
	mkdir -p $(INSTALLDIR)
	cp $< $(INSTALLDIR)

