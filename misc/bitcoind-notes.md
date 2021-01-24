`bitcoind` notes
===

[src](https://github.com/bitcoin/bitcoin/blob/master/doc/build-unix.md)


```
$ sudo apt-get install build-essential libtool autotools-dev automake pkg-config bsdmainutils python3
$ sudo apt-get install libevent-dev libboost-dev
$ sudo add-apt-repository ppa:bitcoin/bitcoin
# sudo apt-get update
# sudo apt-get install libdb4.8-dev libdb4.8++-dev
$ git clone https://github.com/bitcoin/bitcoin ; cd bitcoin
$ ./autogen.sh
$ ./configure
$ make
```

Using `Ubuntu 18.04`

I don't know if the `libboost-dev` is needed.

The `ppa:bitcoin/bitcoin` addition is needed for the `libdb4.8` which can be done away with if you don't want
a wallet (`./configure ----without-bdb`).

Note that this needs upwards of 2Gb of RAM, compilation might fail due to memory exhaustion.

---


References
---

* [0](https://hackernoon.com/a-complete-beginners-guide-to-installing-a-bitcoin-full-node-on-linux-2018-edition-cb8e384479ea)
* [1](https://en.bitcoinwiki.org/wiki/Bitcoind)
* [2](https://github.com/bitcoin/bitcoin/blob/master/doc/build-unix.md)
