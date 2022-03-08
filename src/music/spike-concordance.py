#!/usr/bin/python3
#
# License: CC0
#

# a simple estimate of "major" vs. "minor"
# estimate the number of spikes in the
# spectra of a high harmonic signal (square wave, say)
# and find the 'concordance' of (fourier
# coefficient) spikes that are near each
# other (cent_win, set to 5 cents below).
#

# [0,3] : 2
# [0,4] : 4
#
# [0,3,7]: 4
# [0,4,7]: 6
#

import math

HZ_MIN = 400
HZ_MAX = 20000

cent_win = 5.0

h0 = 440.0
h1 = math.pow(2,3/12)*h0
h2 = math.pow(2,4/12)*h0

h3 = math.pow(2,7/12)*h0

def spike_a2(h0, h1, hzmin, hzmax):

  a = []
  h = h0
  while h < HZ_MAX:
    a.append(h)
    h += 2*h0

  h = h1
  while h < HZ_MAX:
    a.append(h)
    h += 2*h1

  a.sort()
  return a

def spike_a3(h0, h1, h2, hzmin, hzmax):

  a = []
  h = h0
  while h < HZ_MAX:
    a.append(h)
    h += 2*h0

  h = h1
  while h < HZ_MAX:
    a.append(h)
    h += 2*h1

  h = h2
  while h < HZ_MAX:
    a.append(h)
    h += 2*h2

  a.sort()
  return a

def spike_concordance(a, ewin):
  count = 0
  for i in range(len(a)):
    for j in range(len(a)):
      if i==j: continue
      fn = math.pow(2, -ewin)*a[i]
      fp = math.pow(2, ewin)*a[i]
      if (fn <= a[j]) and (a[j] <= fp):
        count += 1
  return count

a_0_1 = spike_a2(h0,h1, HZ_MIN, HZ_MAX)
a_0_2 = spike_a2(h0,h2, HZ_MIN, HZ_MAX)

a_min = spike_a3(h0,h1,h3, HZ_MIN, HZ_MAX)
a_maj = spike_a3(h0,h2,h3, HZ_MIN, HZ_MAX)

print("a_0_1:", spike_concordance(a_0_1, cent_win/1200.0))
print("a_0_2:", spike_concordance(a_0_2, cent_win/1200.0))

print("----")


print("a_min:", spike_concordance(a_min, cent_win/1200.0))
print("a_maj:", spike_concordance(a_maj, cent_win/1200.0))


print("----")

