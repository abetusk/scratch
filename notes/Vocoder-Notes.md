Vocoder Notes
===

###### 2021-08-08

These are notes on creating a vocoder with some 'off-the-shelf'
tools.

---

As a simple proof of concept, one could do the following:

* Create a phoneme representation of a sentence with `espeak`

```
$ /usr/bin/espeak -q -x 'hello there'
 h@l'oU D'e@
```

* With `'` and ` ` as separators, do any alignment you need and then feed in each
  phoneme to `espeak` to get the base voice audio output and pump it through something
  like `ffmpeg` to change duration and pitch.
* There's still experimentation that needs to be done to find out what the 'base' frequency
  of whatever `espeak` voice is using.

```
r=0.9
sentence='hello there friend'
pos=0
for x in ` /usr/bin/espeak -q -x "$sentence" | tr "' " '\n' ` ; do
  echo $x
  ph="[["$x"]]"
  /usr/bin/espeak --stdout "$ph" > _$pos.wav
  ffmpeg -y -i _$pos.wav -f wav -af "asetrate=44100*$r,aresample=44100,atempo=1/$r" $pos.wav
  pos=`echo "$pos+1" | bc`
done
```

The above uses the factor `0.9` which should be adjusted based on whatever base frequency the
`espeak` is using (`0.5` for half of the base frequency, `2` for twice, etc.).

Stretching audio can be done with adjusting the `atempo` parameter, though this might not
give great results. There is a [SO](https://superuser.com/questions/1131923/how-to-stretch-the-wav-file-to-the-same-video-length)
answer talking about the `rubberband` [tool](https://breakfastquay.com/rubberband/index.html).

Maybe using `autotalent` to force the voice to be autotuned might work?

At any rate, the point is to match phonemes to note frequency and length.
Once the melody and phoneme pattern are settled on, alignment can be done
which informs what frequency and length each phoneme(s) will be.

---

As a test, generate a melody in some key/scale, generate a note pattern with some random length
and pump in some text to see if it actually works or sounds good.
