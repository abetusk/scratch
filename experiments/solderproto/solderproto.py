#!/usr/bin/python3

nr = 20
nc = 10

sx = 0
sy = 0

dx = 120
dy = 120

wx = 100
wy = 100

def _mm2thou(mm):
  return 10000.0 * float(mm)/(25.4)

def draw_square(x,y,wx,wy):
  print("")
  print(x+wx/2.0,y+wy/2.0)
  print(x+wx/2.0,y-wy/2.0)
  print(x-wx/2.0,y-wy/2.0)
  print(x-wx/2.0,y+wy/2.0)

for r in range(nr):
  for c in range(nc):
    x = sx + dx*float(r)
    y = sy + dy*float(c)


    draw_square(x,y,wx,wy)

    
