A Biased, Incomplete and Amateur Introduction to Music Theory
===

Forward
---

This document is to introduce the reader to the basics of music theory through the
lens of a software developer.

I am not a musician nor do I have extensive knowledge on music theory.
As such, this document will lack insight, breadth and depth that many
more rigorous documents will have.

This document is created in the hopes that it helps others, like me,
that found introductions to music theory lacking.

For someone just learning about music theory or how to create music,
the switching of contexts, from low level oscillator tweaking to higher level
musical score composition, can be daunting.
This text is an attempt to provide a brief, biased and highly amateurish
introduction to those concepts that can hopefully be used as a starting point
for further study.

Everything in this text should be considered an opinion, even when not
explicitly stated as such.
Evidence is provided where applicable and some of the discussion can get
technical.
The reader is encouraged to not get intimidated and to consider the technical
resources as a kind of "for your information", that are there should they
want to investigate further.

Introduction
---


Music encompasses many different aspects of perception, physics and
computation.
Instruments can be thought of as tones that are generated from underlying
oscillators that combine to create it's "timbre".
Each instrument is a complex combination of frequencies that are then
combined in different ways to produce notes.
Notes are combined in various patterns to create musical scores and songs,
each of which can be combined in different ways and at different tempos.

To give a cartoon of the hierarchy, a "Musical Hierarchy of Importance",
reminiscent of Maslow's "Hierarchy of Need" can be drawn:

| |
|---|
| ![Musical Hierarchy of Importance](img/music_theory_hierarchy_s.svg) |

Here, the "timbre" is meant to describe the "sound" of a particular
instrument, an oboe versus a flute, say.
The "tempo" is the pacing of the notes, including the beats per minute
and the note duration.
The "composition" is how to organize instruments and their melodies
into a larger score.
The top most tier, "effect", is a catch-all for what is arguably the end
goal of a musical score or piece, the story or emotional intent of
the musical piece.

Each level is not independent of the other, where timbre can influence
the composition and tempo, etc.
Nevertheless, the cartoon is an attempt to highlight the different
aspects of music theory and the importance of each stratification.
Most people will respond to the sound of the instruments first,
the tempo next and the composition later.

The other three tiers are, in some sense, the logistics in service
to the end goal, even though the delineation isn't clear cut.

This text will almost exclusively talk about the bottom three tiers
of the pyramid in the hopes that this will provide a foundation to
help with musical creation.


The Human Auditory System and Psychoacoustics
---

### Sound Wave and the Human Ear

Sound is a wave created by the vibration of air molecules.
The cochlea is an organ in the ear that transforms these waves to electrical
signals through shaping the wave in the cochlear cavity that vibrate the
nerve fibers.

The cochlea's cavity is wrapped in a spiral.
When unfurled, it can more easily understood to be a cavity that accepts
different resonate frequencies to then convert to electrical signals for
the brain to interpret.

| |
|---|
| ![Uncoiled cochlea with basilar membrane](img/Uncoiled_cochlea_with_basilar_membrane_s.png) |

The sound frequencies perceived by the human ear are not linear.
The human ear has a range of approximately 20Hz (vibrations per second)
to 20,000Hz (20kHz), depending on the individual person, age and other factors.
For most people, the sensitivity of the human ear peaks at around 3,000Hz to
4,000Hz.

![Perceived Human Hearing](img/Perceived_Human_Hearing.svg)

Though sensitivity is variable throughout the 20Hz to 20kHz spectrum,
a good approximation is to consider human hearing as having logarithmic
sensitivity  ([\*](#Note-0)). 
This means that, for the most part, humans will perceive a doubling of frequency
as a single increment in tone.

For example, an increment of a 4,000Hz tone by 100Hz will most likely be close
to imperceptible, whereas an increase of a 100Hz tone by a 100Hz tone will be
perceived as having the same increment as increasing a 4,000Hz tone to an 8,000Hz tone.

The reason for this is most likely evolutionary, as nature evolved to perceive both
the stampeding of elephants (~20Hz) to the buzzing of a mosquitoes (~400Hz) to recognizing
bird song (~8kHz).
A logarithmic scale prioritizes fidelity of the exponent in favor of the 'low order bits' for
the same amount of "hardware" ([\*\*](#Note-1)).

### Language

![Tempo, Pitch shift](img/tempo_pitch_s.png)

Humans are the only animal, as far as we know, that can do both beat synchronization and
melody pitch shifting.
That is, humans are the only animals that can recognize a beat and recognize a melody that's
also been doubled in frequency, or shifted up an octave.
It is the author's opinion that these differences most likely stem from humans being the only
animal on earth that also have complex language.

Though the reasons for why we perceive music the way we do is open for debate, there is good
evidence for some basic facts of why people find certain tones, combinations of tones and beat tempos
pleasing.

### Rhythm

![Metronome pyramide svg petit droite_s svg](img/Metronome_pyramide_svg_petit_droite_s.svg)

Rhythm or tempo, in this context, is the placement, timing and length of musical sounds or notes.

It has been observed and well accepted that music follows many of the patterns of language.
This includes rhythm and tempo, matching features of the tempo or pacing of speech and word length.

One insight from the perception of rhythm is that recognizing a melody's tempo is considered by some to be the
most defining musical characteristic ([8](#8)).
This means that though the individual notes are important, the tempo is the characteristic that is
most strongly recognized.
There is some research to suggest that language might have an influence on the types of rhythm that show
up in their corresponding culture ([9](#9)), giving further evidence for the connection between language
and musical rhythm.

Most people will find notes played to a steady single beat note rhythm to be monotonous.
Different note lengths can be added to provide variation to a melody.

Once choice of generating randomness can be a Pareto, Zipf or other power law (like) distribution, though,
for the melody lengths involved, these might be overkill and a uniform random number might suffice.

Power laws ([2](#2)) are ubiquitous in nature, including showing up in musical rhythm spectra ([3](#3)) as
well as word frequency and word length ([4](#4)). 
Though beyond the scope of this document, power laws show up because of their 'stability' property ([5](#5))
and are the convergent distribution for sums of identically distributed random variables ([\*\*\*](#Note-2)).
There are many methods of generating power law distributions, some of which quite simple ([6](#6)) ([\*\*\*\*](#Note-3)).

Though the correspondence with language is highlighted to provide context for why certain tempos or tempo patterns
are pleasing, they can just as easily be ignored for the practical consideration that note or beat tempo
should be varied and not monotonous.

### Scale

A musical scale is a set of discrete notes ordered by increasing frequency.
The quantization into distinct notes allows us to treat music as a language of sorts.

Usually, a musical scale denotes the set of notes within an octave, where an octave is the frequency
interval between a particular pitch and its double.
For example, an octave could be the interval from 440Hz to 880Hz.

For most "western" music, a 12 note scale is used, often called the "chromatic scale".
Though the choice of frequency for each note within a scale can be intricate, one simple
choice is to take each note in the chromatic scale as the 12th root of 2 ([\*\*\*\*\*](#Note-4)).

This choice means that by the 12th note, the frequency doubles, feeding into a new octave.

Here are the frequencies of a chromatic scale starting at the root note 440Hz (rounded down):

```
[440,466,493,523,554,587,622,659,698,739,783,830]
```

The tone `440Hz` is often labelled as the note `A4`, with note names chosen to be
from the ordered set $(A, A^\sharp or B^\flat, B, B, C, C^\sharp or D^\flat, D, E, F, F^\sharp or G^\flat, G^\sharp or A^\flat)$.

There is some overlap in note names.
For example $A^\sharp$ and $B^\flat$ represent the same note.
The reason for the note naming conventions, including the redundancy in note names, is probably a historical
artifact and won't be discussed much further in this document.
Unless specifically needed, the "sharp" notation (${\sharp}$) will be used over the "flat" notation (${\flat}$).

### Chords

A chords is a combination of notes played at the same time.
If we restrict ourselves to the 12 note scale (the "chromatic scale"), most people
will not find an arbitrary combination of notes played together as acoustically pleasing.

Though subjective, most people find combinations of notes acoustically pleasing when
the ratio of frequencies has small integral numerator and denominator when their ratio is reduced.
This observation is the basis of most named chords ("major", "minor", etc.) and diatonic scales or "modes" ("Ionian", "Dorian", etc.).

For example, most people will not find the following combination of notes unpleasant when played at the same time: `[ 440, 523, 659 ]` (or `(A4, C4, E4)`), whereas
most people will find the following set of notes to be unpleasant or incongruous when played at the same time: `[440, 466, 493]`.

By a certain measure, the 12 note scale produces a rich set of combinations of notes that have a small reduced fraction
representation and enough variety ([10](#10)).
Care has to be taken when using mathematics of this sort to validate cultural norms.
The 12 note scale is a western product and other cultures have different scale sizes, variations within the note scales in
addition to a host of other differentiating factors.
The 12 note scale is most probably a cultural artifact but, under the right set of assumptions,
the 12 note equal-tempered scale can be considered a reasonable scale choice.

To illustrate this point further, consider taking the ratio of frequencies of two note pairs, $r$,
and taking the smallest integral $p,q$ such that $| \frac{p}{q} - r | < \epsilon$, for some given ${\epsilon}$.
Here is a table of the ratio of the larger frequency to the smaller one for ${\epsilon} = 0.06$:

| Note ratio | Fractional Approximation |
|---|---|
| $2^{ \frac{ 1 }{ 12 }}$ | ${\frac{ 17 }{ 16 }}$ |
| $2^{ \frac{ 2 }{ 12 }}$ | ${\frac{ 9 }{ 8 }}$ |
| $2^{ \frac{ 3 }{ 12 }}$ | ${\frac{ 6 }{ 5 }}$ |
| $2^{ \frac{ 4 }{ 12 }}$ | ${\frac{ 5 }{ 4 }}$ |
| $2^{ \frac{ 5 }{ 12 }}$ | ${\frac{ 4 }{ 3 }}$ |
| $2^{ \frac{ 6 }{ 12 }}$ | ${\frac{ 17 }{ 12 }}$ |
| $2^{ \frac{ 7 }{ 12 }}$ | ${\frac{ 3 }{ 2  }}$ |
| $2^{ \frac{ 8 }{ 12 }}$ | ${\frac{ 19 }{ 12 }}$ |
| $2^{ \frac{ 9 }{ 12 }}$ | ${\frac{ 5 }{ 3 }}$ |
| $2^{ \frac{ 10 }{ 12 }}$ | ${\frac{ 16 }{ 9 }}$ |
| $2^{ \frac{11 }{ 12} }$ | ${\frac{ 17 }{ 9 }}$ |

Taking two notes right next to each other in this 12 note scale produces a reduced fraction that is "large" ([\*\*\*\*\*\*](#Note-5)),
whereas taking the third and the seventh produce reduced fractions that are "small".

There's a lot of ways to waive away the complexity.
The choice of epsilon is arbitrary, what one considers a "large" versus a "small" reduction fraction is arbitrary among
other choice.
Further, it's not completely clear why the human perceptual system would prefer "nice" ratios over others.

With the caveats in mind, hopefully this gives at least a little motivation for the subsequent sections where we'll talk
about named chords and diatonic scales.

Some common chords are named in the following tables:

| Chord Name | Note Offset | Example |
|-------|------|---------|
| Major | `[+0,+4,+7]` | `[c,e,g]` |
| Minor | `[+0,+3,+7]` | `[c,d#,g]` |
| Augmented | `[+0,+4,+8]` | `[c,e,g#]` |
| Diminished / Diminished triad | `[+0,+3,+6]` | `[c,d#,f#]` |


### Diatonic Scales

A diatonic scale, or "mode", is a further restriction of the 12 note scale with the following additional constraints:

* Consists of 7 notes
* Includes five whole steps and two half steps
* The half step notes are separated from each other by two or three whole steps

Before we delve further into these constraints and discuss the implications, the motivation for the further
restriction of the 12 note scale to the diatonic scale is in order.

Choosing some note combination to either play as a chord or as a sequence in a melody from the full 12 note
scale might produce cacophonous note combinations or sequences.
Using the previous section on chords as motivation for choosing note combinations out of the 12,
we can try to restrict ourselves to only using the notes that "sound good" together.
If we settle on choosing 7 out of the twelve, we can see that removing as many neighboring notes as we
can and further separating the two "left over" notes that are forced to be right next to some other note,
we arrive at the diatonic scales.

Another way to say this is that if we settle on 7 notes and make sure the notes that are only a
single step apart are as far away to each other as can be, there are only 7 permutations of
of this "whole step" and "half step" sequence.

The restrictions from above give us 7 different combinations leading to the diatonic scales.
Each of these combinations has their own name which are listed here:

| Diatonic Scale | Note Offset | example | Step Sequence |
|------|------|---------|---------------|
| Ionian / Major | `[0,2,4,5,7,9,11]` | `[c,d,e,f,g,a,b]` |       `[2,2,1,2,2,2,1]` |
| Dorian | `[0,2,3,5,7,9,10]` | `[c,d,d#,f,g,a,a#]` |     `[2,1,2,2,2,1,2]` |
| Phrygian | `[0,1,3,5,7,8,10]` | `[c,c#,d#,f,g,g#,a#]` | `[1,2,2,2,1,2,2]` |
| Lydian | `[0,2,4,6,7,9,11]` | `[c,d,e,f#,g,a,b]` |      `[2,2,2,1,2,2,1]` |
| Mixolydian | `[0,2,4,5,7,9,10]` | `[c,d,e,f,g,a,a#]` |  `[2,2,1,2,2,1,2]` |
| Aeolian / Minor | `[0,2,3,5,7,8,10]` | `[c,d,d#,f,g,g#,a#]` |   `[2,1,2,2,1,2,2]` |
| Locrian | `[0,1,3,5,6,8,10]` | `[c,c#,d#,f,f#,g#,a#]` | `[1,2,2,1,2,2,2]` |


Where a "whole step" is an offset of 2 notes and a "half step" is an offset of 1 note.

Restricting to notes within the diatonic scale allows a restriction of notes
that generally sound good with each other while still allowing enough variation.

Once a diatonic scale is chosen, one can then build three note chords from within them.
If the constructed 3 note chords follow a restriction that each note
can only be 3 or 4 steps from the previous note in the chord, a table of all
possible chords can be built.

Here is the table of 3 chords for each of the diatonic scales, along with the names of each of
the chords:

| Diatonic Scale | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Ionian / Major | `I` `[0,4,7]` | `ii` `[2,5,9]` | `iii` `[4,7,11]` | `IV` `[5,9,12]` | `V` `[7,11,14]` | `vi` `[9,12,16]` | `viid` `[11,14,17]` |
| Dorian | `i` `[0,3,7]` | `ii` `[2,5,9]` | `III` `[3,7,10]` | `IV` `[5,9,12]` | `v` `[7,10,14]` | `vid` `[9,12,15]` | `VII` `[10,14,17]` |
| Phyrgian | `i` `[0,3,7]` | `II` `[1,5,8]` | `III` `[3,7,10]` | `iv` `[5,8,12]` | `vd` `[7,10,13]` | `VI` `[8,12,15]` | `vii` `[10,13,17]` |
| Lydian | `I` `[0,4,7]` | `II` `[2,6,9]` | `iii` `[4,7,11]` | `ivd` `[6,9,12]` | `V` `[7,11,14]` | `vi` `[9,12,16]` | `vii` `[11,14,18]` |
| Mixolydian | `I` `[0,4,7]` | `ii` `[2,5,9]` | `iiid` `[4,7,10]` | `IV` `[5,9,12]` | `v` `[7,10,14]` | `vi` `[9,12,16]` | `VII` `[10,14,17]` |
| Aeolian / Minor | `i` `[0,3,7]` | `iid` `[2,5,8]` | `III` `[3,7,10]` | `iv` `[5,8,12]` | `v` `[7,10,14]` | `VI` `[8,12,15]` | `VII` `[10,14,17]` |
| Locrian | `id` `[0,3,6]` | `II` `[1,5,8]` | `iii` `[3,6,10]` | `iv` `[5,8,12]` | `V` `[6,10,13]` | `VI` `[8,12,15]` | `vii` `[10,13,17]` |


Another way to see this is to ask which chords are "valid" within a diatonic scale that are a major, minor, augmented or
diminished chord.
Each of the 3 note chords, or triads, in each of the diatonic scales, are often labelled in Greek numeral format for their position
in the scale and modified by whether the chord is a major, minor, augmented or diminished chord.
A capital Greek numeral is used if it's a major chord (`[+0,+4,+7]`), a lower case numeral is used if it's a minor chord (`[+0,+3,+7]`)
and a small 'o' is placed as a superscript if it's a diminished chord (`[+0,+3,+6]`).

The choice of wording for "major" or "minor" chords is meant to denote that a major chord will feel more "resolved" or "powerful"
than a minor chord, which is often described as "unresolved" or "sour".
Though I can agree that major and minor chords have those perceptual characteristics, I find it a bit confusing as there are only
three combinations of notes in each chord with the equivalent reduced fraction representation.
The only reason that I can come up with is that perhaps the lower frequency notes are heard as louder than the higher frequency
notes and so their spectrum dominates the perception.

---

An observant reader will notice that each of the diatonic scales in the above is constructed from the pattern
`[2,2,1,2,2,2,1]` (or `[w,w,h,w,w,w,h]`) cyclically rotated.
This means that technically two diatonic scales can be equivalent to each other by a judicious choice of root notes in each, but for
an octave change.
For example, Ionian chosen with `c4` as its root note is equivalent to Dorian with `d4` chosen as it's root note, with perhaps
an octave change up or down, depending.

The hidden assumption with a choice of diatonic scale is that any melody or note choice will 'hover' around the root note or chord.
This root note is often called a "tonic note".
The implication is that any melody in a scale will dance around the tonic note with some general combination of hitting the tonic
note at periodic intervals or staying close to the tonic note.

---

As a final note, the diatonic scales are said to have "moods" associated with them.
Though obviously highly subjective and almost surely culturally dependent, here is a list:

| Diatonic Scale |  "Mood" |
|------|------|
| Ionian / Major | happy/bland |
| Dorian |  mellow/smooth |
| Phrygian |  dark/tense |
| Lydian |  sci-fi/spacy |
| Mixolydian |  bright/upbeat |
| Aeolian / Minor | dark/sad |
| Locrian | | ? |

The author's opinion is that the moods are most likely tied to how often the frequent chords that have
shorter distances to each other appear.
Notes that are inharmonious sound "sour" and, sprinkled in judiciously, add a touch of sadness or tension.

Regardless, the reader is invited to make up their own mind and the above is only provided in the hopes
of shedding some folk wisdom that, at the very least, can be used as a starting point for further investigation.



### Summation

To give a brief overview of this section, here are the salient points:

* As a good approximation of the human auditory system, frequencies are perceived on a logarithmic scale
* Rhythm is tied heavily with language and the tempo of speech, word length and frequency
* Note combinations sound more "pleasing" when the ratio of their frequencies are small as reduced fractions 
* The 12 note chromatic scale is a good compromise of number of notes and enough pleasantly sounding note combinations
* The 12 note chromatic scale is generated from a base frequency of 440Hz multiplied by the twelfth roots of 2
* The 12 note chromatic scale can be further restricted to the diatonic scales to help further restrict the note
  set to allow for ease of composition

Instrument Synthesis
---

The quality of a musical instrument's sound is often called it's "timbre".
Though the definition of timbre is hard to pin down, for the purposes of this text, it will be
roughly understood to be the Fourier coefficients as they evolve through time.

For example, though a violin and a clarinet can both play an `A4` note (440Hz), to most people
these instruments playing the same note will sound different.
Most of the 'signal' of the sound that the instrument produces is centered on the 440Hz
fundamental frequency where all the other frequencies as they evolve through time give each
instrument their characteristic sound or "timbre".

The scope of instrument design can quickly balloon to be out of scope of this text.
We will restrict ourselves to percussive and synthesizer instruments.

Focusing on synthesizer instruments, we can start with some common building blocks of how to create sound.

Synthesizers are often constructed from some combination of four fundamental oscillating waveforms:

* Sine wave
* Triangle wave
* Saw wave
* Square wave

Because of the square waves steep descent in each period, there are many higher order frequency components that
give it a 'buzzing' sound.
That is, the Fourier coefficients of the square wave have many high order terms.
So to with the triangle and saw wave, though less so as they don't have as steep of a hill as the square wave.

The four fundamental waveforms can be combined with varying amplitudes or frequencies to combine to create different
sounds.

#### Attack, Decay, Sustain, Release (ADSR)

![ADSR envelope](img/ADSR_parameter.svg)

One common way to create sounds is to do a so-called 'subtractive' synthesis.

This involves putting an "envelope" over some fundamental or combination of waveforms that is split into
an 'attack', 'decay', 'sustain' and 'release' portion.
A common value is the amplitude of an instrument, rising up quickly in the 'attack' portion, decaying slightly
in the 'decay' portion, keeping at a level in the 'sustain' portion until it's final decay to zero in the 'release'
portion.

This can be though of as a simulation of how a physical note might be played.
For example, if a string were to be plucked, there would be an initial amount of energy transferred (the 'attack')
with it quickly falling off (the 'decay') to a sustained note (the 'sustain') until it eventually stopped or
was damped forcefully to quiet it (the 'release').

The amplitude (aka the volume) of the instrument could be one choice of envelope but the same envelope could be used
for many different aspects, as we will see.

#### Detuning

One common way is to combine two of the same or different waveforms at the same fundamental frequency and then 'detune'
them to be slightly larger or smaller in frequency with each other.

This 'detuning' allows for a richer sound as the slightly offset frequencies can interact in interesting ways.
"Detuning" by too large amount will amount to playing two different notes, but within a small range, the human
ear will fold them into each other and consider them one note or instrument.

#### Low Frequency Oscillators (LFO)

To give richness or variety to a sound or to introduce other effects, 'low frequency oscillators' (LFOs) are often
used.

LFOs are usually in the range of 0-120Hz.
As frequencies lower than 120 or so are not really heard as sound, they are given their own classification.

#### Filters

Often, dealing in frequency space of an instruments waveform gives more control over it's sound.

Filters are often used to shape the frequency.
Some common filters are lowpass, highpass, bandpass, notch or comb, depending on which frequencies they allow
through.

For example, the lowpass filter allows low frequencies to pass through, cutting off higher frequencies,
give the sound a 'muffled' quality.
Highpass filters cutoff low order frequencies, giving the sound a more 'tinny' or sharp sound.

Filters can get complex.


Composition
---

Further up the abstraction hierarchy is music composition.

Most of a musical pieces quality will come from the choice of instrument but
once instrumentation is settled on, next is the tempo, melody and higher
level constructions of a musical piece.

As music composition can be broad, this section will specifically deal
with song generation limited to drums, bass, some lead instruments and various effects.
There will be a further focus on electronic music though this restriction
should still have applicability beyond the genre style choice.







Notes
---

###### Note 0
As opposed to linear, say.

###### Note 1
Where 'hardware' here is the amount of cells and other human processing power devoted to converting, decoding and interpreting sound information in
humans.

###### Note 2
Assuming the sum of the independent, identically distributed (I.I.D.) random variables (R.V.) converge to a distribution.

###### Note 3
Though there is debate about whether particular distributions are power law or log-normal (See [7](#7)),
for the purposes of this discussion (musical tempo), the difference is probably academic as the region of interest
is too small to effectively determine, or notice, the difference between a 'true' power law or a log-normal distribution.

###### Note 4
Often called "twelve-tone equal temperament" ([wiki](https://en.wikipedia.org/wiki/12_equal_temperament))

###### Note 5
Large in the sense that the numerator and denominator are large in absolute value, relative to the other elements
in the list, with the further restriction the 12 note scale is take to be "equal-tempered".


Code
---

### Scale.0

```
var scale = []
for (var exponent=0; exponent<12; exponent++) { scale.push( Math.floor(440.0*Math.pow(2.0, exponent/12.0))) ; }
```

Synth
---

```

 ---------------------------------
 |                               |
 |       osc                     |
 |     ---------                 |
 |     |       |                 |
 |     | square|                 |
 |     | sine  |     filter      v  amplitude     speaker
 |     | saw   |   ----------   ------------    ----------
 |     | pwm   |   |        |   |          |    |        |
 |     |       |   |        |   |          |    |        |
note ->|       |-->|        |-->|          |--->|        |
 |     ---------   ----------   ------------    ----------
 |                      ^          ^
 |                      |          |  adsr
 |                 ----------    ----------
 |                 |        |    |        |
 |                 |        |    |        |
 |                 |        |    |        |
 |                 ----------    ----------
 |                 modulation      ^
 |                                 |
 -----------------------------------

```


License
---

Unless explicitly stated otherwise, the license of this text,
code and any other digital artifact, insofar as its able to, is licensed under a CC0 (Creative Commons 0) license

The following is a list of media and their respective licenses:

| File | License | Author | Source |
|---|---|---|---|
| `Uncoiled_cochlea_with_basilar_membrane.png` | CC-BY | Mike.lifeguard | [src](https://en.wikibooks.org/wiki/File:Uncoiled_cochlea_with_basilar_membrane.png) |
| `Metronome_pyramide_svg_petit_droite.svg` CC-BY-SA | | Cdang | [src](https://commons.wikimedia.org/wiki/File:Metronome_pyramide_svg_petit_droite.svg) |


References
---

* [0](https://legacy.cs.indiana.edu/~port/teach/641/audition.for.linguists.Sept1.html) [a](https://web.archive.org/web/20201207061057/https://legacy.cs.indiana.edu/~port/teach/641/audition.for.linguists.Sept1.html)
* [1](https://www.youtube.com/watch?v=Xb33zXpEgCc) [a](https://web.archive.org/web/20201207070348if_/https://www.youtube.com/watch?v=Xb33zXpEgCc)
* [2](https://en.wikipedia.org/wiki/Power_law)
* [3](https://github.com/abetusk/papers/blob/release/Music/2012-Levitin_PNAS_2012-wSI.pdf)
* [4](https://en.wikipedia.org/wiki/Zipf%27s_law)
* [5](https://en.wikipedia.org/wiki/Stable_distribution)
* [6](https://github.com/abetusk/papers/blob/release/Probability/1089229510-mitzemacher.pdf)
* [7](https://github.com/abetusk/papers/blob/release/ComplexityCriticality/scale-free-networks-are-rare_broido-clauset.pdf)
* [8](https://github.com/abetusk/papers/blob/release/Music/patel2003.pdf)
* [9](https://github.com/abetusk/papers/blob/release/Music/rhythm-music_Patel_Daniel.pdf)
* [10](https://github.com/abetusk/papers/blob/release/Music/measures-consonances_honingh.pdf)
* [11](https://www.youtube.com/watch?v=aEjcK5JFEFE)

* [xxx](https://www.renegadeproducer.com/audio-synthesis.html)

TODO
---

* add sample song that illustrates each of the hierarchy points layered in ('happy birthday'?) (introduction)
* ~picture of cochlea (human auditory system section)~
* add "log scale" description to perceived human hearing graph (human auditory system section)
* add frequency slider that goes from 0 to 44khz in linear and logarithmic to highlight difference  (human auditory system section)
* add picture of elephants stampeding, mosquitoes buzzing and birds singing (human auditory system section)
* ~add graphic depiction of beat synchronization and melody pitch shifting (human auditory system section, language)~
* add graphic of power law vs. gaussian vs exponential (human auditory system section, rhythm)
* add note on sums of random variables of power law vs. gaussian (human auditory system section, rhythm)
* add overview graphic of scales (human auditory system section, scale)
* add chromatic scale with frequencies (and maybe colors?) (human auditory system section, scale)
* find reference to monks and c-major vs. a-major note notation and add note about why we use c-major now (human auditory system section, scale)
* add graphic overview of chords (human auditory system section, scale)
* add chord play sample for (a4,c4,e4) and the incongruous note (human auditory system section, chords)
* add code note on showing "optimality" of the 12 note scale (human auditory system section, chords)
* add playable two note chord for each of the ratios presented (human auditory system section, chords)
* add visual demo of peaks/troughs of reduced fraction notes to highlight why it might be pleasing (human auditory system section, chords)
* add overview graphic of diatonic scale (human auditory system section, diatonic scales)
* add specific example (c-major, a-minor) to highlight scale/mode equivalence (human auditory system section, diatonic scales)
* add note about locrian 'mood' (human auditory system section, diatonic scales)
* add graphics for each of the four basic wave types (instrument synthesis)
* add a better graphic for ADSR and highlight that adr are usually time whereas s is proportion (instrument synthesis, adsr)
* add adsr graphic for envelope effect on amplitude (instrument synthesis, adsr)
* add simple synth with adsr envelope and 2-3 oscs to play with, along with some presets (instrument synthesis, adsr)
* add simple synth with detune parameter (instrument synthesis, detune)
* add simple synth with lfo parameter (instrument synthesis, lfo)
* add animation graphic of adsr for filter (instrument synthesis, filter)
* add graphic of each of the basic types of filter, in freq. space, for the different filters (instrument synthesis, filter)
* talk about resonance for the cutoff filter (lowpass?) (instrument synthesis, filter)
* talk about the names of each of the filters (instrument synthesis, filter)
* add simple synth with adsr for filter (instrument synthesis, filter)
* add section about common effects (reverb, chorus, bitcrush, etc.) (instrument synthesis, effects)
* construct learning synth with n oscs, adsr amp, adsr filter, some simple effects and gen tune, presets (instrument synthesis, basic synth)
* talk about the 'polishing' effects, such as lfos to various knobs/filters, detuning, etc. (instrument synthesis, production effects)
* song parts (drums, base, lead, arp., misc.) (composition)
  - talk about layering and different layering techniques (voices, composition lfos, variation in melody/base/chord prog, misc. voices)
* drum patterns (composition)
* generative random drum creation code (composition)
* chord progression techniques and chord progression choices as it relates to different sections (composition)
* generative chord progression code (composition)
* melody creation (composition)
* make sure to mention tempo variation as opposed to standard common markov model creation (composition)
* generative melody creation code (composition)
* composition effects (composition)
  - talk about fiddling with effects for richer sounds (some overlap with instrument synthesis but slower in time so more appropriate to composition) (composition)
* add 'acid banger like' section (generative drum + melody + composition effects) (composition)
* add basic pop song structure section (composition)
* add generative pop song creator (composition)
* talk about short comings of above ideas (rap, rnb, some pop songs, etc.) (discussion)



