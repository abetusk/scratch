Fiber Laser Notes
===

As of this writing a 20W system is $1.5k ([link](https://www.aliexpress.com/item/1005002419218342.html))

```
modded
—————————————————–
LFB120 A1 88 E4 15 10 C3 90 90 90 90 90 90 90 90 90 90 31 C0 FF C8 A3 88 E4 15 10 C3 90 90 90 90 90 90 ¡ˆä..Ã1À.È£ˆä..Ã
original
RFB120 A1 88 E4 15 10 C3 90 90 90 90 90 90 90 90 90 90 8B 44 24 04 A3 88 E4 15 10 C3 90 90 90 90 90 90 ¡ˆä..Ã‹D$.£ˆä..Ã
```

```
L27320    04 00 00 00 00 00 00 00 04 00 00 00 01 00 00 00 08 00 00 00 00 00 00 00 00 40 7F 40 08 00 00 00
R27320    04 00 00 00 01 00 00 00 04 00 00 00 01 00 00 00 08 00 00 00 00 00 00 00 00 40 7F 40 08 00 00 00
```

```
$ strings -e l Color\ marking-60W.ezd  | wc
    257     257    2057
$ strings -e l Color\ marking-60W.ezd  | sort | uniq -c
    256 Default
      1 EZCADUNI
```

Looks like `Default` "pen" fields are 636 bytes?







References
---

* [\[YT\] Which Fiber Laser You Should Buy in 2021](https://www.youtube.com/watch?v=Y7tknUioLwY)
* [RFL-P60M.pdf](https://cdn.specpick.com/images/photonics/products/RFL-P60M.pdf)
* [Charlie X blog post about reverse engineering](https://charliex2.wordpress.com/2020/01/31/fibre-laser-arrives-let-the-games-begin/) ([gh](https://github.com/charlie-x/fibrelasertools) [cnczone forum](https://www.cnczone.com/forums/laser-control-software/397562-60w-mopa-ezcad2-2.html?s=925fc1c6787516359fe6cbe88b91cd63))

#### USB sniffing

* [wireshark](https://wiki.wireshark.org/CaptureSetup/USB)
* [usbmon](https://web.archive.org/web/20140503004846/http://biot.com/blog/usb-sniffing-on-linux)
* [usb monitoring](https://web.archive.org/web/20180106084840/http://tjworld.net/wiki/Linux/Ubuntu/USBmonitoring)
* [so](https://stackoverflow.com/questions/18137206/how-do-i-intercept-messages-from-a-usb-device-on-linux)
