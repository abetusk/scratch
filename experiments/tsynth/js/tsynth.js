// https://pdm.lsupathways.org/3_audio/2_synthsandmusic/1_lesson_1/envelopes/
//

function noise_filter() {
  const filter = new Tone.Filter(1500, "highpass").toDestination();
  filter.frequency.rampTo(20000, 10);
  const noise = new Tone.Noise().connect(filter).start();
}

function noise_note() {

  let osc,
   ampEnv,
   ampLfo,
   highFilter,
   lowFilter,
   noise,
   ampEnvNoise;

  //function setup() {
  let reverb = new Tone.Reverb().toDestination();
  reverb.generate().then(() => {
     document.body.innerHTML = 'Reverb Ready! '
  });
    
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

  let notes = [297.898, 330, 335.238, 342.222, 391.111, 385, 440]; 
  let randomNote = Math.floor(Math.random()*notes.length); 
  console.log(notes[randomNote])
  osc.frequency.value = notes[randomNote]; 
  ampEnv.triggerAttackRelease(1);

  /*
  function keyPressed() {
   console.log(keyCode);
   if (keyCode == 32) {
      let notes = [297.898, 330, 335.238, 342.222, 391.111, 385, 440]; 
      let randomNote = Math.floor(Math.random()*notes.length); 
      console.log(notes[randomNote])
      osc.frequency.value = notes[randomNote]; 
    ampEnv.triggerAttackRelease(1);
   } else if (keyCode == ENTER) {
    ampEnv.attack = random(0.1, 2);
    ampEnv.decay = random(0.2, 0.5);
    ampEnv.release = random(0.1, 2);
    console.log(`attack: ${ampEnv.attack}, decay: ${ampEnv.decay}, release: ${ampEnv.release}`)
   } else if (keyCode == 49) {
      
    lfo2.frequency.value = 1;
    ampLfo.frequency.value = 2;
   } else if (keyCode == 50) {
    lfo2.frequency.value = 2;
    ampLfo.frequency.value = 4;

   } else if (keyCode == 51) {
    lfo2.frequency.value = 3;
    ampLfo.frequency.value = 6;

   } else if (keyCode == 52) {
    lfo2.frequency.value = 4;
    ampLfo.frequency.value = 8;
   }
  }
  */
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

var g_info = {};

function init3() {
  let _synth = new Tone.Synth({
    oscillator : {
      volume: 1,
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

  let synth = new Tone.PolySynth( Tone.Synth, _synth.get() ).toDestination();
  //const synth = new Tone.PolySynth( Tone.Synth ).toDestination();
  synth.set({ detune: -10 });
  synth.triggerAttackRelease(["C4", "E4", "A4"], 1);

  g_info.synth = synth;
}

function init4() {
  let _synth = new Tone.MonoSynth({
    oscillator : {
      volume: 1,
      count: 3,
      spread: 90,
      type : "fatsawtooth"
    },
    envelope : {
      attack: 2,
      decay: 1,
      sustain: 0.4,
      release: 4
    },
    filterEnvelope : {
      attack: 2,
      decay: 1,
      sustain: 0.4,
      release: 4
    }

  });

  let synth = new Tone.PolySynth( Tone.MonoSynth, _synth.get() ).toDestination();
  synth.set({ detune: -10 });
  //synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
  synth.triggerAttackRelease(["C4"], 1);

  g_info.synth = synth;
}

function multiple_osc_test() {
  let ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.2,
    sustain: 1.0,
    release: 0.8
  }).toDestination();

  let osc0 = new Tone.Oscillator(440, "sine");
  let osc1 = new Tone.Oscillator(440.5, "sawtooth");
  let osc2 = new Tone.Oscillator(439.5, "sawtooth");

  // create an oscillator and connect it
  //const osc123 = new Tone.Oscillator().connect(ampEnv).start();

  osc0.connect(ampEnv).start();
  osc1.connect(ampEnv).start();
  osc2.connect(ampEnv).start();

  ampEnv.triggerAttackRelease("8t");
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

