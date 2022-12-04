#!/bin/bash

g++ -I/usr/include/eigen3 -L../bin -I$HOME/lib/include -I/usr/include/eigen3 -I../../include climcut.cpp -o climcut -lmcut -I/usr/include/eigen3
