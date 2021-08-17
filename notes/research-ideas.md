Research Ideas
===

### Speech Recognition

This will probably be effectively done by neural networks or some other
standard ML process but here's a quick thought on how to use a dataset
of sentences with their corresponding text, like that used in Mozilla
Deepspeech.

The problem comes with trying to identify the regions of audio that
correspond to phonemes or words.
The basic idea is to run the audio through a digest, either doing
Fourier, wavelet analysis or even peak detection, and then
align some window to other sentences with the same phonemes in them.

If you have enough cross over, you can effectively pick out the phonemes
they have in common and then use other methods to position the phonemes
relative to the other phonemes in the sentence.
It gets a bit tricky needing to vary the window size but in theory
there's a sort of range that can be done and maybe even some normalization
that can happen to help that along.


