I2C on Raspberry Pi
===

Following [Ozzmaker](https://ozzmaker.com/i2c/):

```
apt-get update
apt-get install -y i2c-tools libi2c-dev python-smbus
sed -i 's/^i2c-bcm2708/#i2c-bcm2708/' /etc/modprobe.d/raspi-blacklist.conf

echo -e 'i2c-dev\ni2c-bcm2708' >> /etc/modules

echo -e 'dtparam=i2c_arm=on\ndtparam=i2c1=on' >> /boot/config.txt
```

From doing `raspi-config` and selection `Interfacing Options -> I2C`, it looks like the only thing
from the above that happened was the `dtparam=i2c_arm=on` in `/boot/config.txt`.

```
shutdown -r now
```

---

Once rebooted, look for connected devices:

```
i2cdetect -y 1
```

Presumably this is looking at `/dev/i2c-1`.


