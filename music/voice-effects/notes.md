Notes
---

```
espeak -x -p 20 -s 120 -z -w superawesome.wav superawesome
sox -D superawesome.wav
sox superawesome.wav out.wav speed 0.5
sox out.wav out1.wav pitch 1200
mplayer superawesome.wav out1.wav 
```
