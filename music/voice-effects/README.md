Voice Effects
---


Notes on voice effects.

---

Enable 'low-latency' recording from mic to speaker:

```
pactl load-module module-loopback latency_msec=1
pactl unload-module module-loopback
```

---

Attempts at using `arecord` to `aplay` to go from mic to speaker:

```
stdbuf -o 0 arecord --buffer-size=512 | stdbuf -o 0 -i 0 aplay -
```


