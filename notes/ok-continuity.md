ok continuity
===

Using `2019-07-10-raspbian-buster-full.img`.

as `root`:

```
systemctl enable ssh
apt-get purge -y libreoffice libreoffice-base-core libreoffice-common \
      libreoffice-core libreoffice-help-common libreoffice-help-en-gb \
      libreoffice-help-en-us libreoffice-l10n-en-gb \
      libreoffice-style-colibre libreoffice-style-tango \
      wolfram-engine scratch scratch2
apt-get autoremove

apt-get install -y \
  python3-virtualenv python3-scipy python3-numpy libatlas-base-dev python3-audio \
  vim espeak mplayer jq
pip3 uninstall virtualenv
pip3 install virtualenv
pip3 install deepspeech-tflite pyaudio
usermod -a -G audio pi

```

I'm having trouble getting `virtualenv` running properly.
Here's my makeshift solution (run as pi):


```
mkdir ~/bin
pushd bin
cat > virtualenv <<EOF
#!/bin/bash

python3 /usr/lib/python3/dist-packages/virtualenv.py "$@"
EOF
popd

echo 'PATH=$PATH:$HOME/bin' >> .bashrc
. .bashrc

# issues with sound cutting out a bit
# https://raspberrypi.stackexchange.com/questions/26364/sound-is-being-cut-off
#
vcgencmd force_audio hdmi 1
```

Which should create a local script `virtualenv` that will allow you to follow instructions
as per normal install (`pip3 show virtualenv` will show where `virtualenv` is located).

---

Now we can start to install DeepSpeech ([src](https://deepspeech.readthedocs.io/en/v0.9.3/?badge=latest)):

```
virtualenv -p python3 $HOME/tmp/deepspeech-venv/
source $HOME/tmp/deepspeech-venv/bin/activate

pip3 install deepspeech pyaudio webrtcvad halo scipy
mkdir data
cd data
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.tflite
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz
tar xvf audio-0.9.3.tar.gz
rm ./audio-0.9.3.tar.gz


```

```
https://github.com/mozilla/DeepSpeech-examples
```


References
---

* [DeepSpeech on RPi](https://github.com/touchgadget/DeepSpeech)

