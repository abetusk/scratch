#!/usr/bin/python3

import sys

hz = 440
maxhz=20000
if len(sys.argv)>1:
  hz = int(sys.argv[1])
  if len(sys.argv)>2:
    maxhz=int(sys.argv[2])

for f in range(hz,maxhz,2*hz):
  #print(f-1, 0.1)
  print(f, 1)
  #print(f+1, 0.1)

