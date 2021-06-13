#!/usr/bin/python
#
# gnuplot (from http://www.gnuplotting.org/images-within-a-graph/):
# plot 'face.jpeg' binary filetype=jpg with rgbimage


import sys
import face_recognition as face

fn = sys.argv[1]

#img = face.load_image_file("face.jpeg")
img = face.load_image_file(fn)
landmark = face.face_landmarks(img)

Y = len(img[0])

for idx in range(len(landmark)):
  for key in landmark[idx]:
    print "#", key
    for _ii in range(len(landmark[idx][key])):
      #print landmark[idx][key][_ii][0], Y - landmark[idx][key][_ii][1]
      print landmark[idx][key][_ii][0], landmark[idx][key][_ii][1]
    print ""

