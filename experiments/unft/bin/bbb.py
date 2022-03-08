#!/usr/bin/python3


import time, sys, random

import pigpio

pi = pigpio.pi() # connect to local Pi

start_time = time.time()

while (time.time()-start_time) < 60: 
  for p in range(0, 255):
    pi.set_PWM_dutycycle(18, p)
    time.sleep(0.05)
  for p in range(255,0,-1):
    pi.set_PWM_dutycycle(18, p)
    time.sleep(0.05)

