#!/usr/bin/python3

import os
import sys
import math

def ff(v,w):
  s = [0.0,0.0]
  for idx in range(len(v)):
    s[0] += v[idx] * w[idx][0]
    s[1] += v[idx] * w[idx][1]
  return s

def _v(n):
  s = 16
  v = []
  for idx in range(s):
    if n & (1<<(s-idx-1)):
      v.append(1.0)
    else:
      v.append(0.0)
  return v



S = 16

w = []
for idx in range(S):
  w.append( [math.cos(float(idx)*math.pi*2.0/float(S)), math.sin(float(idx)*math.pi*2.0/float(S)) ])
  #print(w[idx][0], w[idx][1])




for n in range(1<<S):
  a = ff(_v(n), w)
  print(a[0], a[1])

