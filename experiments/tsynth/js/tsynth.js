// https://pdm.lsupathways.org/3_audio/2_synthsandmusic/1_lesson_1/envelopes/
//

function noise_filter() {
	const filter = new Tone.Filter(1500, "highpass").toDestination();
	filter.frequency.rampTo(20000, 10);
	const noise = new Tone.Noise().connect(filter).start();
}

function tsynth(f) {
  let synth_opt = {
    "oscillator": {
      "volume": 0.9,
      "count": 3,
      //"spread": 40,
      "spread": 10,
      //"type": "square"
      "type": "sawtooth"
    },
    "envelope": {
      "attack": 0.5,
      "decay": 0.5,
      "sustain": 1,
      "release": 5
    },
    "detune": -1,

    "filterEnvelope": {
      "attack": 0.5,
      "decay": 0.5,
      "sustain": 1,
      "release": 5
    },

    "filter" : {
      "type": "lowpass",
      //"gain": 1,
      "frequency": f,
      "rolloff" : -12,
      "Q": 0.25
    }

  };

  let _xx = {
    "filterEnvelope": {
      "attack": -100.5,
      "decay": 0.5,
      "sustain": 1,
      "release": 100
    }
  };

  let amp_opt = {
    "attack": 0.1,
    "decay": 0.2,
    "sustain": 1.0,
    "release": 0.8
  };


  let filt_opt = {
    "type": "lowpass",
    //"gain": 1,
    "frequency": f,
    "rolloff" : -12,
    "Q": 1
  };

  //let filter = new Tone.Filter(filt_opt);
  let filter = new Tone.Filter(f, "lowpass");
  let delay = new Tone.FeedbackDelay(0.125, 0.125);

  let synth =
    new Tone.PolySynth( Tone.MonoSynth,
                        synth_opt );
  synth.connect(filter);
  filter.connect(delay);

  //synth.connect(delay);

  delay.toDestination();
  //filter.toDestination();

  //synth = synth.connect(delay);


  //synth = synth.connect(filter);
  //synth = synth.toDestination();


  //synth.triggerAttackRelease("C4", "8n");
  synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
}


function init() {

  const synth = new Tone.Synth().toDestination();

  //play a middle 'C' for the duration of an 8th note
  synth.triggerAttackRelease("C4", "8n");

}

function init1() {
  const synth1 = new Tone.Synth({
    oscillator : {
      volume: 5,
      count: 3,
      spread: 40,
      type : "fatsawtooth"
    }
  }).toDestination();
  synth1.triggerAttackRelease("C4", "8n");
}

function init2() {
  const synth = new Tone.PolySynth().toDestination();
  // set the attributes across all the voices using 'set'
  synth.set({ detune: -1200 });
  // play a chord
  synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
}

function init3() {
  let _synth = new Tone.Synth({
    oscillator : {
      volume: 5,
      count: 3,
      spread: 90,
      type : "fatsawtooth"
    },
    envelope : {
      attack: 2,
      decay: 1,
      sustain: 0.4,
      release: 4
    }
  });

  const synth = new Tone.PolySynth( Tone.Synth, _synth.get() ).toDestination();
  //const synth = new Tone.PolySynth( Tone.Synth ).toDestination();
  synth.set({ detune: -1200 });
  synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
}

function _x() {

  let ampEnvelope;
  let noise;
  let filterCutoff; 

  ampEnvelope = new Tone.AmplitudeEnvelope({
    "attack": 0.1,
    "decay": 0.2,
    "sustain": 1.0,
    "release": 0.8
  }).toDestination(); 

  // lets put a filter between the noise and envelope
  //   hi pass filter - lets the highs pass through
  filter = new Tone.Filter({
    "type" : "lowpass", //change the filter type to see differnt results
    "Q" : 3
  }).connect(ampEnvelope)

   //   see: https://tonejs.github.io/docs/r13/Noise
  noise = new Tone.Noise()
    .connect(filter)
    .start();

  filter.frequency.value = 200
  noise.type = 'pink' // brown, white, pink 

  filterCutoff = createSlider(200, 10000, 1000, 0.1); 
  filterCutoff.position(100, 300);
}

function _x1() {
  let osc,
   ampEnv,
   ampLfo,
   highFilter,
   lowFilter,
   noise,
   ampEnvNoise;

  let reverb = new Tone.Reverb().toDestination();
  ampLfo = new Tone.LFO('4n', -60, -3).start();
  lfo2 = new Tone.LFO(10, 50, 500).start();

  highFilter = new Tone.Filter(200, "highpass");
  lowFilter = new Tone.Filter(200, "lowpass");

  osc = new Tone.AMOscillator({
   frequency: '440',
   type: "sine",
   modulationType: "square"
  }).start();

  noise = new Tone.Noise().start();

  ampEnv = new Tone.AmplitudeEnvelope({
   "attack": 0.1,
   "decay": 0.2,
   "sustain": 1,
   "release": 0.8
  }).connect(reverb);

  // where the LFO is connected to what its modulating 
  ampLfo.connect(osc.volume);
  lfo2.connect(lowFilter.frequency);

  highFilter.connect(ampEnv);
  lowFilter.connect(ampEnv);

  osc.connect(highFilter);
  noise.connect(lowFilter);
}

