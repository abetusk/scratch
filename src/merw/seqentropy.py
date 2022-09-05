#!/usr/bin/python3

import sys
import math

freq = {}
tot = 0

for line in sys.stdin:
  line = line.strip()
  if not (line in freq):
    freq[line] = 0
  freq[line]+=1
  tot+=1

if (tot==0):
  sys.exit(0);

S = 0
for ele in freq:
  p = float(freq[ele])/float(tot)
  s = -p*math.log(p)
  S += s
  #print(ele, freq[ele], p, s)

print("S=", S)


