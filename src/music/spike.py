#!/usr/bin/python3

import sys
import os
import math

freq = 440.0
LB = 400.0
UB = 20000.0
alpha = -0.5

if len(sys.argv) > 1:
  freq = float(sys.argv[1])
  if len(sys.argv) > 2:
    LB = float(sys.argv[2])
    if len(sys.argv) > 3:
      UB = float(sys.argv[3])


c=1.0
cur_freq = freq
while cur_freq  < UB:
  if (cur_freq < LB):
    cur_freq += freq
    continue
  print('{:f}'.format(cur_freq), '{:f}'.format(math.exp(alpha*c)))
  c += 1.0
  cur_freq += freq 
