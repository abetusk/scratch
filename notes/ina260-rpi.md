INA260 on Raspberry Pi (Zero W)
===

After enabling i2c:

```
pip3 install adafruit-circuitpython-ina260
```

Here is a minimal example (from [Adafruit](https://learn.adafruit.com/adafruit-ina260-current-voltage-power-sensor-breakout/python-circuitpython)):

```
#!/usr/bin/python3

import time
import board
import adafruit_ina260

from datetime import datetime
import json

i2c = board.I2C()
ina260 = adafruit_ina260.INA260(i2c)
while True:
  sec = time.time()
  now = datetime.fromtimestamp(sec)
  dtstr = now.strftime("%Y-%m-%d_%H:%M:%S.%f")

  data = {
    "s" : sec,
    "datetime" : dtstr,
    "current_ma" : ina260.current,
    "voltage" : ina260.voltage,
    "power_mw" : ina260.power
  }

  print(json.dumps(data))

  #print("Current: %.2f mA Voltage: %.2f V Power:%.2f mW"
  #  % (ina260.current, ina260.voltage, ina260.power)
  #)
  time.sleep(0.25)
```

References
---

* [Adafruit INA260 Current + Voltage + Power Sensor Breakout](https://learn.adafruit.com/adafruit-ina260-current-voltage-power-sensor-breakout/python-circuitpython)
