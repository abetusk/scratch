#!/usr/bin/python3.6
#
# License: CC0

# insipration
# https://www.youtube.com/watch?v=7ezeYJUz-84&t=2254s

import sys
import os
from PIL import Image
from PIL import ImageDraw

if len(sys.argv) < 3:
  print("provide image file and face landmark")
  print("")
  print("  face-glitch image.jpg image.facegp")
  print("")
  print("")
  sys.exit(0)


fn = sys.argv[1]
fmapfn = sys.argv[2]

face_area = {
  "nose_bridge":[],
  "left_eye":[],
  "nose_tip":[],
  "chin":[],
  "right_eye":[],
  "left_eyebrow":[],
  "bottom_lip":[],
  "right_eyebrow":[],
  "top_lip":[]
}

component = ""
with open(fmapfn, "r") as fp:
  for line in fp:
    line = line.strip()
    if len(line)==0: continue
    if line[0] == '#':
      tok = line.split(" ")
      if len(tok) < 2: continue
      component = tok[1]
      continue
    else:
      if component in face_area:
        xy = line.split(" ")
        face_area[component].append([ int(xy[0]), int(xy[1]) ])

img = Image.open(fn)
pixel = img.load()
draw = ImageDraw.Draw(img)

X = img.size[0]
Y = img.size[1]

def calc_bbox(pgn):
  first = True
  b = [[-1,-1],[-1,-1]]
  for p in pgn:
    if first:
      b[0][0] = p[0]
      b[0][1] = p[1]
      b[1][0] = p[0]
      b[1][1] = p[1]
      first = False
      continue
    if p[0] < b[0][0]: b[0][0] = p[0]
    if p[0] > b[1][0]: b[1][0] = p[0]
    if p[1] < b[0][1]: b[0][1] = p[1]
    if p[1] > b[1][1]: b[1][1] = p[1]
  return b


def face_square(img, face_landmark):
  global draw

  bbox_le = calc_bbox(face_landmark["left_eye"])
  bbox_re = calc_bbox(face_landmark["right_eye"])
  bbox_mouth = calc_bbox(face_landmark["bottom_lip"])

  draw.line( (bbox_le[0][0], bbox_le[0][1], bbox_le[1][0], bbox_le[0][1] ), fill = 128)
  draw.line( (bbox_le[1][0], bbox_le[0][1], bbox_le[1][0], bbox_le[1][1] ), fill = 128)
  draw.line( (bbox_le[1][0], bbox_le[1][1], bbox_le[0][0], bbox_le[1][1] ), fill = 128)
  draw.line( (bbox_le[0][0], bbox_le[1][1], bbox_le[0][0], bbox_le[0][1] ), fill = 128)
  

  draw.line( (bbox_re[0][0], bbox_re[0][1], bbox_re[1][0], bbox_re[0][1] ), fill = 128)
  draw.line( (bbox_re[1][0], bbox_re[0][1], bbox_re[1][0], bbox_re[1][1] ), fill = 128)
  draw.line( (bbox_re[1][0], bbox_re[1][1], bbox_re[0][0], bbox_re[1][1] ), fill = 128)
  draw.line( (bbox_re[0][0], bbox_re[1][1], bbox_re[0][0], bbox_re[0][1] ), fill = 128)
  

  draw.line( (bbox_mouth[0][0], bbox_mouth[0][1], bbox_mouth[1][0], bbox_mouth[0][1] ), fill = 128)
  draw.line( (bbox_mouth[1][0], bbox_mouth[0][1], bbox_mouth[1][0], bbox_mouth[1][1] ), fill = 128)
  draw.line( (bbox_mouth[1][0], bbox_mouth[1][1], bbox_mouth[0][0], bbox_mouth[1][1] ), fill = 128)
  draw.line( (bbox_mouth[0][0], bbox_mouth[1][1], bbox_mouth[0][0], bbox_mouth[0][1] ), fill = 128)

  dw = 50

  bbox_le[0][0] -= dw
  bbox_le[0][1] -= dw
  bbox_le[1][0] += dw
  bbox_le[1][1] += dw

  bbox_re[0][0] -= dw
  bbox_re[0][1] -= dw
  bbox_re[1][0] += dw
  bbox_re[1][1] += dw

  bbox_mouth[0][0] -= dw
  bbox_mouth[0][1] -= dw
  bbox_mouth[1][0] += dw
  bbox_mouth[1][1] += dw

  le_wh = [ int(bbox_le[1][0] - bbox_le[0][0]), int(bbox_le[1][1] - bbox_le[0][1]) ]
  re_wh = [ int(bbox_re[1][0] - bbox_re[0][0]), int(bbox_re[1][1] - bbox_re[0][1]) ]
  mouth_wh = [ int(bbox_mouth[1][0] - bbox_mouth[0][0]), int(bbox_mouth[1][1] - bbox_mouth[0][1]) ]

  com_le = [ int((bbox_le[0][0] + bbox_le[1][0]) / 2), int((bbox_le[0][1] + bbox_le[1][1])/2) ]
  com_re = [ int((bbox_re[0][0] + bbox_re[1][0]) / 2), int((bbox_re[0][1] + bbox_re[1][1])/2) ]
  com_mouth = [ int((bbox_mouth[0][0] + bbox_mouth[1][0]) / 2), int((bbox_mouth[0][1] + bbox_mouth[1][1])/2) ]

  img_le = img.crop( ( bbox_le[0][0], bbox_le[0][1], bbox_le[1][0], bbox_le[1][1] ) )
  img_re = img.crop( ( bbox_re[0][0], bbox_re[0][1], bbox_re[1][0], bbox_re[1][1] ) )
  img_mouth = img.crop( ( bbox_mouth[0][0], bbox_mouth[0][1], bbox_mouth[1][0], bbox_mouth[1][1] ) )

  draw.rectangle( [bbox_le[0][0], bbox_le[0][1], bbox_le[1][0], bbox_le[1][1] ], fill = 128)
  draw.rectangle( [bbox_re[0][0], bbox_re[0][1], bbox_re[1][0], bbox_re[1][1] ], fill = 128)
  draw.rectangle( [bbox_mouth[0][0], bbox_mouth[0][1], bbox_mouth[1][0], bbox_mouth[1][1] ], fill = 128)


  #img.paste(img_le, (bbox_le[0][0], bbox_le[0][1]))
  #img.paste(img_le, (bbox_le[1][0], bbox_le[1][1]))

  s_e = [20,10]
  s_m = [5,10]
  img.paste(img_le, (com_le[0] - int(le_wh[0]/2) - s_e[0], com_le[1] - int(le_wh[1]/2) + s_e[1]) )
  img.paste(img_re, (com_re[0] - int(re_wh[0]/2) + s_e[0], com_re[1] - int(re_wh[1]/2) + s_e[1]) )
  img.paste(img_mouth, (com_mouth[0] + s_m[0] - int(mouth_wh[0]/2), com_mouth[1] + s_m[1] - int(mouth_wh[1]/2)) )




def test():

  prv_p = []
  for idx,p in enumerate(face_area["left_eye"]):
    if idx==0:
      prv_p = p
      continue

    draw.line( ( prv_p[0], prv_p[1], p[0], p[1]), fill = 128);
    prv_p = p

    for ix in range(5):
      for iy in range(5):
        pixel[p[0] + ix, p[1] + iy] = (255,0,0)

face_square(img, face_area)

img.show()
