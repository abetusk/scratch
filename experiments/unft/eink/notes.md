Notes
===

Following the [Medium tutorial](https://medium.com/swlh/create-an-e-paper-display-for-your-raspberry-pi-with-python-2b0de7c8820c).


| Header Pin | RPi Pin | Name | Description |
|---------|------|---|---|
| `17` | `3.3v`  | `3.3v` | power |
| `20` | `gnd` | `GND` | ground |
| `19` | `gpio 10/mosi` | `DIN` | data in |
| `23` | `gpio 11/slck` | `CLK` | clock |
| `24` | `gpio 8/ceo` | `CS` | chip select |
| `22` | `gpio 25` | `DC` | data/command selection |
| `11` | `gpio 17` | `RST` | reset |
| `18` | `gpio 24` | `BUSY` | busy indicator line |

Enable `SPI` through `raspi-config` (`Interface Options -> SPI -> Yes`) and `reboot`.

```
sudo bash
apt-get update
apt-get install -y python3-pip python3-pil python3-numpy
pip3 install RPi.GPIO
pip3 install spidev
```

```
git clone https://github.com/waveshare/e-Paper
```

As root (?):

```
sudo bash
cd e-Paper/RaspberryPi_JetsonNano/python/examples
python3 epd_4in2_test.py
```

... and it looks to be working.

---

Working Example
---

After making sure the `lib` and `pic` directories are copied over into your
working directory from the above repo:

```
#!/usr/bin/python3
#
#

import sys
import os

picdir = os.path.join("./", 'pic')
libdir = os.path.join("./", 'lib')
if os.path.exists(libdir): sys.path.append(libdir)

from waveshare_epd import epd4in2
import time
from PIL import Image,ImageDraw,ImageFont
import traceback

bmp_fn = "exquisite-corpse.bmp"

try:
 
  epd = epd4in2.EPD()

  print(">> init")
  epd.init()

  # 0: black, 255: white
  #
  print(">> clear")
  epd.Clear()
  
  font24 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 24)
  font18 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 18)
  font35 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 35)
  
  print(">>> loading bmp", bmp_fn)
  _image = Image.open(os.path.join(picdir, bmp_fn))
  epd.display(epd.getbuffer(_image))
  
  print(">> sleep")
  epd.sleep()
  
except IOError as e:
  print("exception:", e)

except KeyboardInterrupt:    
  epd4in2.epdconfig.module_exit()
  exit()

print(">> done")
```

Resources
---

* [e-ink tutorial](https://medium.com/swlh/create-an-e-paper-display-for-your-raspberry-pi-with-python-2b0de7c8820c)
* [Adafruit e-ink tutorial](https://learn.adafruit.com/raspberry-pi-e-ink-weather-station-using-python/python-setup)
* [Waveshare e-Paper GitHub repo](https://github.com/waveshare/e-Paper)
