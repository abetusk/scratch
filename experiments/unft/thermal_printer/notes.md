
From [Adafruit](https://learn.adafruit.com/pi-thermal-printer/raspberry-pi-software-setup)

```
sudo apt-get install git cups wiringpi build-essential libcups2-dev libcupsimage2-dev python-serial python-pil python-unidecode
cd ~
git clone https://github.com/adafruit/zj-58
cd zj-58
make
sudo ./install
sudo lpadmin -p ZJ-58 -E -v serial:/dev/serial0?baud=9600 -m zjiang/ZJ-58.ppd
sudo lpoptions -d ZJ-58
```

The option `zjiang/ZJ-58.ppd` is verbatim what it needs to put in as.


```
git clone https://github.com/adafruit/Python-Thermal-Printer
```

Test with `printertest.py` but the baud rate needs to be changed to `9600`:

```
cd Python-Thermal-Printer
python3 printertest9600.py
```

---

Here is a minimal test script for printing PNGs:

```
#!/usr/bin/python3
#
# License: CC0 (https://creativecommons.org/publicdomain/zero/1.0/)
#
# To the extent possible under law, all copyright and related or neighboring rights are waived
# on this file.
# This work is published from: United States.
#

# For use with https://github.com/adafruit/Python-Thermal-Printer
#
# example usage:
#
#  ./thermprint doggo_400.png

from __future__ import print_function
from PIL import Image
from Adafruit_Thermal import *

import os, sys, getopt

BAUD_RATE = 9600
SER_DEV = "/dev/serial0"
TIMEOUT = 5

n_feed_after = 2
n_feed_before = 0
png_fn = ""

def show_help(ofp):
  ofp.write("\nusage:\n\n  thermprint [-h] [-B baud] [-D dev] [-T timeout] [-a feed_after] [-b feed_before] [png]\n")
  ofp.write("\n")
  ofp.write("  [png]      PNG to print\n")
  ofp.write("  [-B baud]  baud rate (default " + str(BAUD_RATE) + ")\n")
  ofp.write("  [-D dev]   serial device (default " + str(SER_DEV) + ")\n")
  ofp.write("  [-T t]     timeout (default " + str(TIMEOUT) + ")\n")
  ofp.write("  [-b B]     print B line feeds before image (default " + str(n_feed_before) + ")\n")
  ofp.write("  [-a A]     print A line feeds after image (default " + str(n_feed_after) + ")\n")
  ofp.write("  [-h]       help (this screen)\n")
  ofp.write("\n")

try:
  opts, args = getopt.getopt(sys.argv[1:], "ha:b:B:D:T:")
  for o,a in opts:
    if o == "-h":
      show_help(sys.stdout)
      sys.exit(0)
    elif o == "-B": BAUD_RATE = int(a)
    elif o == "-D": SER_DEV = a
    elif o == "-T": TIMEOUT = int(a)
    elif o == "-a": n_feed_after = int(a)
    elif o == "-b": n_feed_before = int(a)
    else:
      show_help(sys.stderr)
      sys.exit(-1)
except getopt.GetoptError as err:
  sys.stderr.write(str(err))
  sys.stderr.write("\n")
  show_help(sys.stderr)
  sys.exit(-1)

if len(args) == 0:
  show_help(sys.stderr)
  sys.exit(-1)

if len(args) > 0: png_fn = args[0]

printer = Adafruit_Thermal(SER_DEV, BAUD_RATE, timeout=TIMEOUT)

if n_feed_before > 0: printer.feed(n_feed_before)
if len(png_fn) > 0: printer.printImage(png_fn, True)
if n_feed_after > 0: printer.feed(n_feed_after)

```

References
---

* [GH: adafruit/Python-Thermal-Printer](https://github.com/adafruit/Python-Thermal-Printer)
* [Adafruit: RPi Thermal Printer Tutorial (printer setup)](https://learn.adafruit.com/pi-thermal-printer/raspberry-pi-software-setup)
* [Adafruit: RPi Thermal Printer Tutorial (code examples)](https://learn.adafruit.com/pi-thermal-printer/pi-setup-part-3)
