#!/usr/bin/python3
#
# License: CC0
#

import sys
import math

EPS = 0.1
EFFICIENCY_THRESHOLD = 6
FAREY_BOUND = 32

if len(sys.argv) > 1:
  EPS = float(sys.argv[1])

print("# EPS:", EPS)
print("# EFFICIENCY_THRESHOLD:", EFFICIENCY_THRESHOLD)
print("# FAREY_BOUND:", FAREY_BOUND)

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

    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : 0.06, "p" : int(round(p)), "q" : int(q) } )
    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : EPS, "p" : int(round(p)), "q" : int(q), "qq" : int(qq), "pp" : int(round(pp)) } )
    #ret.append( { "n" : div, "r" : x, "v" : v, "eps" : EPS, "_p": _p, "_q": q, "p" : int(round(p)), "q" : int(q), "qq" : int(qq), "pp" : int(round(pp)) } )
    ret.append( { "n" : div, "r" : x, "v" : v, "eps" : EPS, "p": _p, "q": _q, "qq" : int(qq), "pp" : int(round(pp)) } )

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
    print( "# 2^{", x["r"], "/", x["n"], "} :", x["p"], "/", x["q"], "(", x["v"], ",", 1.0/float(x["v"]), ")", "((", x["pp"], "/", x["qq"], ") farey(", x["p"], "/", x["q"], "))")
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

