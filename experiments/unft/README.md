`unft`
===

```
sudo apt-get install -y imagemagick pwgen
```

Converting images with extent:

```
# for e-ink
convert orig.png -gravity center -resize 300x400 -extent 300x400 eink_tarot.bmp
# for thermal
convert orig.png -gravity center -resize 384 -extent 384 therm_tarot.png
```

Quick Information
---

| | |
|---|---|
| E-Paper Module 4.2" | `300x400` | [link](https://www.waveshare.com/4.2inch-e-paper-module.htm) [wii](https://www.waveshare.com/wiki/4.2inch_e-Paper_Module) |
| Thermal Printer | `384x...` | [link](https://www.adafruit.com/product/2752) |
