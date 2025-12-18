
var bard_data = {

  "note": [
    "c0", "c#0", "d0", "d#0", "e0", "f0", "f#0", "g0", "g#0", "a0", "a#0", "b0",
    "c1", "c#1", "d1", "d#1", "e1", "f1", "f#1", "g1", "g#1", "a1", "a#1", "b1",
    "c2", "c#2", "d2", "d#2", "e2", "f2", "f#2", "g2", "g#2", "a2", "a#2", "b2",
    "c3", "c#3", "d3", "d#3", "e3", "f3", "f#3", "g3", "g#3", "a3", "a#3", "b3",
    "c4", "c#4", "d4", "d#4", "e4", "f4", "f#4", "g4", "g#4", "a4", "a#4", "b4",
    "c5", "c#5", "d5", "d#5", "e5", "f5", "f#5", "g5", "g#5", "a5", "a#5", "b5",
    "c6", "c#6", "d6", "d#6", "e6", "f6", "f#6", "g6", "g#6", "a6", "a#6", "b6",
    "c7", "c#7", "d7", "d#7", "e7", "f7", "f#7", "g7", "g#7", "a7", "a#7", "b7",
    "c8", "c#8", "d8", "d#8", "e8", "f8", "f#8", "g8", "g#8", "a8", "a#8", "b8"
  ],

  "freq": [
    16.351597831287414, 17.323914436054505, 18.354047994837973, 19.445436482630054,
    20.60172230705437,  21.826764464562743, 23.124651419477154, 24.49971474885933,
    25.95654359874657,  27.5,               29.13523509488062,  30.867706328507758,

    32.70319566257483,  34.64782887210901,  36.70809598967595,  38.89087296526011,
    41.20344461410874,  43.653528929125486, 46.24930283895431,  48.99942949771866,
    51.91308719749314,  55,                 58.27047018976124,  61.735412657015516,

    65.40639132514966,  69.29565774421802,  73.4161919793519,   77.78174593052022,
    82.40688922821748,  87.30705785825097,  92.49860567790861,  97.99885899543732,
    103.82617439498628, 110,                116.54094037952248, 123.47082531403103,

    130.8127826502993,  138.59131548843604, 146.8323839587038,  155.56349186104043,
    164.81377845643496, 174.61411571650194, 184.99721135581723, 195.99771799087463,
    207.65234878997256, 220,                233.08188075904496, 246.94165062806206,
    
    261.6255653005986,  277.1826309768721,  293.6647679174076,  311.12698372208087,
    329.6275569128699,  349.2282314330039,  369.99442271163446, 391.99543598174927,
    415.3046975799451,  440,                466.1637615180899,  493.8833012561241,
    
    523.2511306011972,  554.3652619537442,  587.3295358348151,  622.2539674441617,
    659.2551138257398,  698.4564628660078,  739.9888454232689,  783.9908719634985,
    830.6093951598903,  880,                932.3275230361799,  987.7666025122483,
    
    1046.5022612023945, 1108.7305239074883, 1174.6590716696303, 1244.5079348883235,
    1318.5102276514797, 1396.9129257320155, 1479.9776908465378, 1567.981743926997,
    1661.2187903197805, 1760,               1864.6550460723597, 1975.5332050244965,

    2093.004522404789,  2217.4610478149766, 2349.3181433392606, 2489.015869776647,
    2637.0204553029594, 2793.825851464031,  2959.9553816930757, 3135.963487853994,
    3322.437580639561,  3520,               3729.3100921447194, 3951.066410048993,

    4186.009044809578,  4434.922095629953,  4698.636286678521,  4978.031739553294,
    5274.040910605919,  5587.651702928062,  5919.910763386151,  6271.926975707988,
    6644.875161279122,  7040,               7458.620184289439,  7902.132820097986
  ],

  "note2freq": {
    "c0": 16.351597831287414, "c#0": 17.323914436054505, "d0": 18.354047994837973,
    "d#0": 19.445436482630054, "e0": 20.60172230705437, "f0": 21.826764464562743,
    "f#0": 23.124651419477154, "g0": 24.49971474885933, "g#0": 25.95654359874657,
    "a0": 27.5, "a#0": 29.13523509488062, "b0": 30.867706328507758,

    "c1": 32.70319566257483, "c#1": 34.64782887210901, "d1": 36.70809598967595,
    "d#1": 38.89087296526011, "e1": 41.20344461410874, "f1": 43.653528929125486,
    "f#1": 46.24930283895431, "g1": 48.99942949771866, "g#1": 51.91308719749314,
    "a1": 55, "a#1": 58.27047018976124, "b1": 61.735412657015516,

    "c2": 65.40639132514966, "c#2": 69.29565774421802, "d2": 73.4161919793519,
    "d#2": 77.78174593052022, "e2": 82.40688922821748, "f2": 87.30705785825097,
    "f#2": 92.49860567790861, "g2": 97.99885899543732, "g#2": 103.82617439498628,
    "a2": 110, "a#2": 116.54094037952248, "b2": 123.47082531403103,

    "c3": 130.8127826502993, "c#3": 138.59131548843604, "d3": 146.8323839587038,
    "d#3": 155.56349186104043, "e3": 164.81377845643496, "f3": 174.61411571650194,
    "f#3": 184.99721135581723, "g3": 195.99771799087463, "g#3": 207.65234878997256,
    "a3": 220, "a#3": 233.08188075904496, "b3": 246.94165062806206,

    "c4": 261.6255653005986, "c#4": 277.1826309768721, "d4": 293.6647679174076,
    "d#4": 311.12698372208087, "e4": 329.6275569128699, "f4": 349.2282314330039,
    "f#4": 369.99442271163446, "g4": 391.99543598174927, "g#4": 415.3046975799451,
    "a4": 440, "a#4": 466.1637615180899, "b4": 493.8833012561241,

    "c5": 523.2511306011972, "c#5": 554.3652619537442, "d5": 587.3295358348151,
    "d#5": 622.2539674441617, "e5": 659.2551138257398, "f5": 698.4564628660078,
    "f#5": 739.9888454232689, "g5": 783.9908719634985, "g#5": 830.6093951598903,
    "a5": 880, "a#5": 932.3275230361799, "b5": 987.7666025122483,

    "c6": 1046.5022612023945, "c#6": 1108.7305239074883, "d6": 1174.6590716696303,
    "d#6": 1244.5079348883235, "e6": 1318.5102276514797, "f6": 1396.9129257320155,
    "f#6": 1479.9776908465378, "g6": 1567.981743926997, "g#6": 1661.2187903197805,
    "a6": 1760, "a#6": 1864.6550460723597, "b6": 1975.5332050244965,

    "c7": 2093.004522404789, "c#7": 2217.4610478149766, "d7": 2349.3181433392606,
    "d#7": 2489.015869776647, "e7": 2637.0204553029594, "f7": 2793.825851464031,
    "f#7": 2959.9553816930757, "g7": 3135.963487853994, "g#7": 3322.437580639561,
    "a7": 3520, "a#7": 3729.3100921447194, "b7": 3951.066410048993,

    "c8": 4186.009044809578, "c#8": 4434.922095629953, "d8": 4698.636286678521,
    "d#8": 4978.031739553294, "e8": 5274.040910605919, "f8": 5587.651702928062,
    "f#8": 5919.910763386151, "g8": 6271.926975707988, "g#8": 6644.875161279122,
    "a8": 7040, "a#8": 7458.620184289439, "b8": 7902.132820097986
  }


};

class Synth {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;

    // Master output
    this.output = audioCtx.createGain();
    this.output.gain.value = 0.25;

    // Effects chain
    this.filter = audioCtx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1200;

    this.delay = audioCtx.createDelay(1.0);
    this.delay.delayTime.value = 0.25;

    this.delayFeedback = audioCtx.createGain();
    this.delayFeedback.gain.value = 0.3;

    this.chorusDelay = audioCtx.createDelay(0.03);
    this.chorusDelay.delayTime.value = 0.015;

    this.chorusLFO = audioCtx.createOscillator();
    this.chorusLFO.frequency.value = 0.8;

    //----
    //
    // Chorus LFO routing
    //
    this.chorusLFOGain = audioCtx.createGain();
    this.chorusLFOGain.gain.value = 0.005;

    this.chorusLFO.connect(this.chorusLFOGain);
    this.chorusLFOGain.connect(this.chorusDelay.delayTime);
    this.chorusLFO.start();

    // ~> F -> D -> Dc -> O
    //         ^\
    //         | v
    //         --Df
    //
    //
    // LFO -> Gc -> Dc

    // Connect effects chain
    //
    this.filter.connect(this.delay);
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.chorusDelay);
    this.chorusDelay.connect(this.output);
  }

  playNote(freq, adsr) {
    const now = this.audioCtx.currentTime;

    // Create multiple oscillators
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const osc3 = this.audioCtx.createOscillator();

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    osc3.frequency.value = freq * 0.5;

    // LFO for pitch
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.value = 5;
    lfoGain.gain.value = 10; // pitch modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);
    lfoGain.connect(osc3.frequency);
    lfo.start();

    // Envelope
    const amp = this.audioCtx.createGain();
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(adsr.attackLevel, now + adsr.attack);
    amp.gain.linearRampToValueAtTime(adsr.sustainLevel, now + adsr.attack + adsr.decay);

    // Connect oscillators
    osc1.connect(amp);
    osc2.connect(amp);
    osc3.connect(amp);

    amp.connect(this.filter);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    // Stop after release
    amp.gain.setTargetAtTime(0, now + adsr.duration, adsr.release);

    osc1.stop(now + adsr.duration + adsr.release + 0.1);
    osc2.stop(now + adsr.duration + adsr.release + 0.1);
    osc3.stop(now + adsr.duration + adsr.release + 0.1);
  }
}

//-----
//-----
//-----


class Sequencer_naive {
  constructor(audioCtx, synth, bpm = 120) {
    this.audioCtx = audioCtx;
    this.synth = synth;
    this.bpm = bpm;
    this.steps = [];
    this.isPlaying = false;
  }

  setSequence(steps) { this.steps = steps; }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    let stepIndex = 0;
    const stepTime = 60 / this.bpm;

    const loop = () => {
      if (!this.isPlaying) return;

      const freq = this.steps[stepIndex];
      if (freq) {
        this.synth.playNote(freq, {
          attack: 0.05,
          attackLevel: 0.8,
          decay: 0.1,
          sustainLevel: 0.5,
          duration: 0.2,
          release: 0.2
        });
      }

      stepIndex = (stepIndex + 1) % this.steps.length;
      setTimeout(loop, stepTime * 1000);
    };

    loop();
  }

  stop() { this.isPlaying = false; }
}

class StepSequencer {
  constructor(audioCtx, synth, bpm = 120) {
    this.audioCtx = audioCtx;
    this.synth = synth;
    this.bpm = bpm;

    this.steps = [];
    this.currentStep = 0;

    this.lookahead = 0.025;   // 25ms
    this.scheduleAhead = 0.1; // 100ms
    this.nextNoteTime = 0;
    this.isPlaying = false;
  }

  setSequence(steps) { this.steps = steps; }

  nextStep() {
    const secondsPerBeat = 60 / this.bpm;
    this.nextNoteTime += secondsPerBeat;

    this.currentStep = (this.currentStep + 1) % this.steps.length;
  }

  scheduleNote(stepIndex, time) {
    const freq = this.steps[stepIndex];
    if (freq) {
      this.synth.playNote(freq, {
          attack: 0.01,
          attackLevel: 1.0,
          decay: 0.1,
          sustainLevel: 0.6,
          duration: 0.2,
          release: 0.1
      }, time);
    }
  }

  scheduler() {
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAhead) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextStep();
    }

    if (this.isPlaying) {
      setTimeout(() => this.scheduler(), this.lookahead * 1000);
    }
  }

  start() {
    if (this.isPlaying) { return; }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;

    this.scheduler();
  }

  stop() { this.isPlaying = false; }
}


function bard_init() {

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const synth = new Synth(audioCtx);
  synth.output.connect(audioCtx.destination);

  //const seq = new Sequencer(audioCtx, synth, 120);
  const seq = new StepSequencer(audioCtx, synth, 120);

  // C major arpeggio
  seq.setSequence([
      261.63, 329.63, 392.00, 523.25,
      392.00, 329.63, 261.63, null
  ]);

  document.querySelector("#start").onclick = () => {
      audioCtx.resume();
      seq.start();
  };

  document.querySelector("#stop").onclick = () => seq.stop();

}



