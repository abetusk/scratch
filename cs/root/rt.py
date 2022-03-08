#!/usr/bin/python3

import numpy as np

coeff = [3.2,2,1]
rt = np.roots(coeff)

B = 32


for a in range(-B,B):
  for b in range(-B,B):
    for c in range(-B,B):
      coeff = [a,b,c]
      rt = np.roots(coeff)
      if (len(rt)==2) and (abs(rt[0].imag)<0.00001) and (abs(rt[1].imag)<0.00001) :
        if (abs(rt[0].real) < 2.0) and (abs(rt[1].real) < 2.0) :
          print(rt[0].real, rt[1].real)
          print(rt[1].real, rt[0].real)
      #for r in rt: print(r.real, r.imag)

