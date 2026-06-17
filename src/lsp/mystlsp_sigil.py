#!/usr/bin/env python3
#
# To the extent possible under law, the person who associated CC0 with
# this project has waived all copyright and related or neighboring rights
# to this project.
# 
# You should have received a copy of the CC0 legalcode along with this
# work.  If not, see <http:#creativecommons.org/publicdomain/zero/1.0/>.
#

# setup instructions:
#
# sudo apt install cairosvg python3-cairosvg
# python3 -m venv mystlsp
# source mystlsp/bin/activate
# python3 -m pip install "drawsvg~=2.0"
# python3 -m pip install cairosvg
#

import drawsvg as draw
import math

def drawsvg_example():
  d = draw.Drawing(200, 100, origin='center')

  # Draw an irregular polygon
  d.append(draw.Lines(-80, 45,
                       70, 49,
                       95, -49,
                      -90, -40,
                      close=False,
              fill='#eeee00',
              stroke='black'))

  # Draw a rectangle
  r = draw.Rectangle(-80, -50, 40, 50, fill='#1248ff')
  r.append_title("Our first rectangle")  # Add a tooltip
  d.append(r)

  # Draw a circle
  d.append(draw.Circle(-40, 10, 30,
          fill='red', stroke_width=2, stroke='black'))

  # Draw an arbitrary path (a triangle in this case)
  p = draw.Path(stroke_width=2, stroke='lime', fill='black', fill_opacity=0.2)
  p.M(-10, -20)  # Start path at point (-10, -20)
  p.C(30, 10, 30, -50, 70, -20)  # Draw a curve to (70, -20)
  d.append(p)

  # Draw text
  d.append(draw.Text('Basic text', 8, -10, -35, fill='blue'))  # 8pt text at (-10, -35)
  d.append(draw.Text('Path text', 8, path=p, text_anchor='start', line_height=1))
  d.append(draw.Text(['Multi-line', 'text'], 8, path=p, text_anchor='end', center=True))

  # Draw multiple circular arcs
  d.append(draw.ArcLine(60, 20, 20, 60, 270,
          stroke='red', stroke_width=5, fill='red', fill_opacity=0.2))
  d.append(draw.Arc(60, 20, 20, 90, -60, cw=True,
          stroke='green', stroke_width=3, fill='none'))
  d.append(draw.Arc(60, 20, 20, -60, 90, cw=False,
          stroke='blue', stroke_width=1, fill='black', fill_opacity=0.3))

  # Draw arrows
  arrow = draw.Marker(-0.1, -0.51, 0.9, 0.5, scale=4, orient='auto')
  arrow.append(draw.Lines(-0.1, 0.5, -0.1, -0.5, 0.9, 0, fill='red', close=True))
  p = draw.Path(stroke='red', stroke_width=2, fill='none',
          marker_end=arrow)  # Add an arrow to the end of a path
  p.M(20, 40).L(20, 27).L(0, 20)  # Chain multiple path commands
  d.append(p)
  d.append(draw.Line(30, 20, 0, 10,
          stroke='red', stroke_width=2, fill='none',
          marker_end=arrow))  # Add an arrow to the end of a line

  d.set_pixel_scale(2)  # Set number of pixels per geometry unit
  #d.set_render_size(400, 200)  # Alternative to set_pixel_scale
  d.save_svg('example.svg')
  d.save_png('example.png')

  # Display in Jupyter notebook
  #d.rasterize()  # Display as PNG
  d  # Display as SVG

def sigil_exec():

  R = 20.0
  pnt = []
  for idx in range(5):
    p = (idx*2) % 5
    a = -(math.pi/2.0) + (2.0*math.pi*float(p)/5.0)
    pnt.append( [R*math.cos(a), R*math.sin(a)] )

  d = draw.Drawing(100,100, origin='center')
  d.append( draw.Lines( pnt[0][0], pnt[0][1],
                        pnt[1][0], pnt[1][1],
                        pnt[2][0], pnt[2][1],
                        pnt[3][0], pnt[3][1],
                        pnt[4][0], pnt[4][1],
                        close=True,
            fill='none',
            stroke='black'))
  d.save_svg("sigil/sigil_exec.svg")

def sigil_def():

  R = 20.0

  pnt = []
  for idx in range(3):
    a = -(math.pi/2.0) + (2.0*math.pi*float(idx)/3.0)
    pnt.append( [R*math.cos(a), R*math.sin(a)] )

  sr = math.sqrt(2.0)*(R) / 2.0
  L = math.sqrt(2.0)*R
  
  d = draw.Drawing(100,100, origin='center')
  d.append( draw.Circle(0,0, R, fill='none', stroke='black') )

  d.append( draw.Lines( pnt[0][0], pnt[0][1],
                        pnt[1][0], pnt[1][1],
                        pnt[2][0], pnt[2][1],
                        fill='none',
                        stroke='black',
                        close=True))

  #d.append( draw.Rectangle(-sr,-sr,L,L, fill='none', stroke='black') )
  d.save_svg("sigil/sigil_def.svg")


def sigil_add():

  R = 20.0
  d = draw.Drawing(100,100, origin='center')

  pnt = []
  for idx in range(3):
    a = (math.pi/6.0) - (2.0*math.pi*float(idx)/3.0)
    pnt.append( [R*math.cos(a), R*math.sin(a)] )


  d.append( draw.Lines( pnt[0][0], pnt[0][1],
                        pnt[1][0], pnt[1][1],
                        pnt[2][0], pnt[2][1],
                        close=False,
                        fill='none',
                        stroke='black') )
  d.append( draw.Lines( 0, 0, 0,-R/2.0, close=False, fill='none', stroke='black'))
  d.append( draw.Lines( -10,-R/4.0, 10,-R/4.0, close=False, fill='none', stroke='black'))
  d.save_svg("sigil/sigil_add.svg")


def sigil_xxx():
  pass

sigil_exec()
sigil_def()
sigil_add()
print("...")
