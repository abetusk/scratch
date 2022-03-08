#!/usr/bin/python

import time
from smbus import SMBus
import sys

addr = 0x8
bus = SMBus(1)


ch = ord('a')

print( "...", ch)

msg = "hello, friend\n"

while True:

  for ch in msg:
    bus.write_byte(addr, ord(ch))

  x = bus.read_byte(addr)
  print ">>", x

  time.sleep(0.1)

