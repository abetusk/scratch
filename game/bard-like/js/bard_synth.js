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
