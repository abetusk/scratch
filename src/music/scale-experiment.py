#!/usr/bin/python3
#
# License: CC0
#

import sys
import math
import functools

EPS = 0.1
EFFICIENCY_THRESHOLD = 6
FAREY_BOUND = 24

if len(sys.argv) > 1:
  #EPS = float(sys.argv[1])
  FAREY_BOUND = int(sys.argv[1])
  if len(sys.argv) > 2:
    EFFICIENCY_BOUND = int(sys.argv[2])

print("# EPS:", EPS)
print("# EFFICIENCY_THRESHOLD:", EFFICIENCY_THRESHOLD)
print("# FAREY_BOUND:", FAREY_BOUND)

###

def count_freq(hz0,hz1,lb,ub,t):
  a = []
  h = hz0
  while h < ub:
    if (h >= lb):
      a.append(int(h))
    h += hz0

  h = hz1
  while h < ub:
    if (h >= lb):
      a.append(int(h))
    h += hz1

  a.sort()

  count = 1
  for idx in range(len(a)-1):
    if (a[idx+1] - a[idx]) > t:
      count += 1
  #print(count, a)

  return count
  
def list_count_freq():
  print("---")

  lb = 400
  ub = 20000
  wn = 20
  r_list = [ [3,2], [4,3], [5,4], [6,5] ]
  for f in [ 440, math.pow(2, 3/12)*440, math.pow(2,4/12)*440 ]:
    for r_a in r_list:
      s = str(r_a[0]) + "/" + str(r_a[1])
      print(int(f), s, count_freq(f, int(r_a[0]*f/r_a[1]), lb, ub, wn))
    print("---")


list_count_freq()

###

# from https://www.johndcook.com/blog/2010/10/20/best-rational-approximation/
#
def farey(x, N):
  a, b = 0, 1
  c, d = 1, 1
  while (b <= N and d <= N):
    mediant = float(a+c)/(b+d)
    if x == mediant:
      if b + d <= N:
        return a+c, b+d
      elif d > b:
        return c, d
      else:
        return a, b
    elif x > mediant:
      a, b = a+c, b+d
    else:
      c, d = a+c, b+d

  if (b > N):
    return c, d
  else:
    return a, b

def find_q(v, eps):
  M = 100

  for m in range(2,M):
    if abs( v*float(m) - round( v *float(m)) ) <= eps:
      return m
  return -1


def find_freq_ratio():

  div = 12

  res = {}

  for s in range(1,div):
    res[str(s)] = {}

  r = math.pow(2.0, 1.0/float(div))

  for denom_bound in range(2,32):
    for s in range(1,12):
      v = math.pow(r, s)
      p,q = farey(1.0/v, denom_bound)

      str_pq = str(p) + "/" + str(q)
      res[str(s)][str_pq] = 1

  return res


def ratio_sort_str(a,b):

  tok_a = a.split("/")
  tok_b = b.split("/")
  if int(tok_a[1]) != int(tok_b[1]):
    v = int(tok_a[1]) -  int(tok_b[1])
    if (v < 0): return -1
    if (v > 0): return 1
    return 0
  v  = int(tok_a[0]) - int(tok_b[1])
  if (v < 0): return -1
  if (v > 0): return 1
  return 0


def chord_inversion(a):
  return [ a[1], a[2], a[0]+12 ]

def chord_del(a):
  return [ a[1] - a[0], a[2] - a[1], a[2] - a[0] ]

def chord_str(a):
  return "[" + str(a[0]) + "," + str(a[1]) + "," + str(a[2]) + "]"

###
###
###

ratio_array = []
ratio_info  = find_freq_ratio()

## construct (unique) column list of values, sorted
##
found = {}
for s in ratio_info:
  for r in ratio_info[s]:
    if r in found: continue
    if r == "1/1": continue
    ratio_array.append(r)
    found[r] = True
column_ratio_array = sorted(ratio_array, key=functools.cmp_to_key(ratio_sort_str))



#print(column_ratio_array)

chord_list = []
chord_list.append( [0,3,7] )
chord_list.append( [0,4,7] )

chord_list.append( chord_inversion([0,3,7]) )
chord_list.append( chord_inversion([0,4,7]) )

chord_list.append( chord_inversion(chord_inversion([0,3,7])) )
chord_list.append( chord_inversion(chord_inversion([0,4,7])) )

def str_line(line, w):
  sline = ""
  for v in line:
    if len(v) < w:
      sline += " "*(w - len(str(v)))
    sline += str(v)
    sline += "."

  return sline


col_names = ["chord", "dchord"]
for v in column_ratio_array:
  col_names.append(v)

col_width = 9
print(str_line(col_names, col_width))
for ch in chord_list:
  line = []
  dch = chord_del(ch)

  #line.append(str(ch))
  #line.append(str(dch))
  line.append(chord_str(ch))
  line.append(chord_str(dch))
  for r in column_ratio_array:
    ele = ""
    for d in dch:
      #print(r,d, ratio_info[str(d)])
      if r in ratio_info[str(d)]:
        ele += "x"
        #line.append('x')
      #else:
      #  line.append('')
    line.append(ele)

  print(str_line(line, col_width))


def debug_print_ratio_info(ri):
  print(ratio_info)
  for s in range(1,12):
    kv = ri[str(s)]
    for k in kv:
      print(s, k)

debug_print_ratio_info(ratio_info)
sys.exit(0)



###
###
###


def get_semi(div):
  #eps = 0.06
  d = 1.0 / float(div)

  r = math.pow(2.0, d)

  ret = []

  for x in range(1, div):
    v = math.pow(r, x)
    q = find_q(v, EPS)
    qq = find_q( 1.0 / v, EPS)
    p = q*v
    pp = qq/v

    _p, _q = farey(1.0/v, FAREY_BOUND)
    #_p, _q = farey(v - 1.0, FAREY_BOUND)

    tp,  tq  = farey(v, FAREY_BOUND)
    _note = "( v: " + str(tp) + " / " + str(tq)

    tp,  tq  = farey(1.0/v, FAREY_BOUND)
    _note += ", 1/v: " + str(tp) + " / " + str(tq) 

    tp,  tq  = farey(v-1.0, FAREY_BOUND)
    _note += ", v - 1: " + str(tp) + " / " + str(tq) 

    _note += ")"

    info = { "n" : div, "r" : x, "v" : v, "eps" : EPS, "p": _p, "q": _q, "qq" : int(qq), "pp" : int(round(pp)), "note": _note }

    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : 0.06, "p" : int(round(p)), "q" : int(q) } )
    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : EPS, "p" : int(round(p)), "q" : int(q), "qq" : int(qq), "pp" : int(round(pp)) } )
    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : EPS, "_p": _p, "_q": q, "p" : int(round(p)), "q" : int(q), "qq" : int(qq), "pp" : int(round(pp)) } )
    ret.append( info )

  return ret
              

def list_semi(div):
  d = 1.0 / float(div)

  r = math.pow(2.0, d)

  for x in range(1, div):
    v = math.pow(r, x)
    q = find_q(v, EPS)
    p = q*v
    print( x, ":", int(round(p)), "/", q, "(", v, "->", p, ")")

#print find_q( math.pow(2.0, 1.0/12.0), 0.06 )

for p in range(2, 64):

  r = get_semi(p)
  print("#")
  print("#************************")
  print("#", p, "semitones:")
  print("#---")

  count = 0

  for x in r:
    print( "# 2^{", x["r"], "/", x["n"], "} :", x["p"], "/", x["q"], "(", x["v"], ",", 1.0/float(x["v"]), ")", "((", x["pp"], "/", x["qq"], ") farey(", x["p"], "/", x["q"], "))", x["note"])
    #if (x["p"] < x["n"]) and (x["q"] < x["n"]):
    #if (x["p"] < 10) and (x["q"] < 10):
    #if (x["p"] < EFFICIENCY_THRESHOLD) and (x["q"] < EFFICIENCY_THRESHOLD):

    if x["q"] < EFFICIENCY_THRESHOLD:
      count+=1

  print( "#count:", count, ", efficiency:", float(count) / float(p))
  print(p, float(count)/float(p))
  #list_semi(p)

  #r = get_semi(p)
  #print r
  print( "#************************")

