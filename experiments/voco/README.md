notes
===

```
$echo 'hello' | espeak-ng -v mb-en1 -s 50 --stdout > hello.wav 
$ echo 'hello'  | espeak-ng -v mb-en1 -s 50 --pho
h       125
@       71       0 94 20 95 40 96 59 97 80 99 100 99
l       118
@U      460      0 102 80 76 100 76
_       885
_       1
```

The second column is ms length of phoneme output.

Looks like available english voices are `mb-en1`, `mb-us1`, `mb-us2` and `mb-us3`.

---

References
---

* [espeak-ng](https://github.com/espeak-ng/espeak-ng)
* [MBROLA](https://github.com/numediart/MBROLA)
* [Tone.js PitchShift](https://tonejs.github.io/docs/r13/PitchShift)

