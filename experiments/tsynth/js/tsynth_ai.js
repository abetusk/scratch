
var g_data = {
};

function _simple_lfo1() {
  let audioCtx = new AudioContext();

  let osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.type = 'sawtooth';
  osc.frequency.value = 220; // base frequency (A3)

  // LFO oscillator (low frequency)
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 5; // 5 Hz LFO

  // Connect LFO → Gain → Oscillator frequency
  lfo.connect(osc.frequency);

  // Connect main oscillator to speakers
  osc.connect(audioCtx.destination);

  // Start both oscillators
  osc.start();
  lfo.start();

  g_data['osc'] = osc;
  g_data['lfo'] = lfo;
}

function _simple_lfo() {
  let audioCtx = new AudioContext();

  let osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.type = 'sawtooth';
  osc.frequency.value = 220; // base frequency (A3)

  // LFO oscillator (low frequency)
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 5; // 5 Hz LFO

  // Gain node to control modulation depth
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 50; // modulation depth in Hz

  // Connect LFO → Gain → Oscillator frequency
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Connect main oscillator to speakers
  osc.connect(audioCtx.destination);

  // Start both oscillators
  osc.start();
  lfo.start();
}

function ui_button() {
  console.log("bang");

//_simple_lfo1();
//  return;

  tsynth_ai_init();
  tsynth_ai_play();
}


function __tsynth_ai_init() {
  let osc1 = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 1 }
  });

  let osc2 = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.8 }
  });

  let osc3 = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 }
  });

  let osc4 = new Tone.PolySynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 }
  });


  g_data["osc"] = [ osc1, osc2, osc3, osc4 ];

  // Detune oscillators
  osc1.oscillator.detune.value = -10; // slightly flat
  osc2.oscillator.detune.value = 0;   // center
  osc3.oscillator.detune.value = 10;  // slightly sharp


  // Amplitude filter
  const filter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    rolloff: -24,
    Q: 1
  });

  g_data["filter"] = filter;

  // Effects: Reverb + Delay
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.3 });
  const delay = new Tone.FeedbackDelay("8n", 0.3);

  g_data["reverb"] = reverb;
  g_data["delay"] = delay;

  // LFOs
  const lfoFilter = new Tone.LFO("4n", 200, 2000).start();
  lfoFilter.connect(filter.frequency);

  g_data["lfo"] = {};
  g_data.lfo["filter"] = lfoFilter;

  const lfoPitch = new Tone.LFO("8n", -20, 20).start();
  lfoPitch.connect(osc1.oscillator.detune);

  g_data.lfo["pitch"] = lfoPitch;

  // Routing
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);

  filter.chain(delay, reverb, Tone.Destination);
}

function tsynth_ai_init() {
  let osc0 = new Tone.PolySynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 1 }
  });

  let osc1 = new Tone.PolySynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.8 }
  });

  //!!!!!
  //
  //
  /*

  class DetunableSynth extends Tone.Synth {
    constructor(options) {
      super(options);
            // detune is already a public AudioParam on Tone.Synth
    }
  };
  let osc2 = new Tone.PolySynth(DetunableSynth);
  */

  let osc2 = new Tone.PolySynth({
    "oscillator": { type: "triangle" },
    "envelope": { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 }
  });


  g_data["osc"] = [ osc0, osc1, osc2 ];

  osc0.set({"detune": -10});
  osc1.set({"detune": 0});
  osc2.set({"detune": 10});


  // Amplitude filter
  const filter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    rolloff: -24,
    Q: 1
  });

  g_data["filter"] = filter;

  // Effects: Reverb + Delay
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.3 });
  const delay = new Tone.FeedbackDelay("8n", 0.3);

  g_data["reverb"] = reverb;
  g_data["delay"] = delay;

  // LFOs
  const lfoFilter = new Tone.LFO("4n", 200, 2000).start();
  lfoFilter.connect(filter.frequency);

  g_data["lfo"] = {};
  g_data.lfo["filter"] = lfoFilter;

  const lfoPitch = new Tone.LFO("8n", -20, 20).start();
  lfoPitch.connect(osc0.get("detune"));
  g_data.lfo["pitch"] = lfoPitch;

  // Routing
  osc0.connect(filter);
  osc1.connect(filter);
  osc2.connect(filter);

  filter.chain(delay, reverb, Tone.Destination);
}

function blech() {
// Create a PolySynth
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// Create an LFO to modulate detune
const lfo = new Tone.LFO({
  frequency: "5hz",   // vibrato speed
  min: -20,           // detune range in cents
  max: 20
}).start();

// Connect the LFO to the synth's detune parameter
lfo.connect(synth.detune);

// Play some notes
synth.triggerAttackRelease(["C4", "E4", "G4"], "2n");
}


async function tsynth_ai_play() {

  let osc = g_data.osc;

  await Tone.start(); // unlock audio
  osc[0].triggerAttackRelease("C4", "2n");
  osc[1].triggerAttackRelease("E4", "2n");
  osc[2].triggerAttackRelease("G4", "2n");

  /*
    // Play button
    document.getElementById("play").addEventListener("click", async () => {
      await Tone.start(); // unlock audio
      osc1.triggerAttackRelease("C4", "2n");
      osc2.triggerAttackRelease("E4", "2n");
      osc3.triggerAttackRelease("G4", "2n");
    });
    */
}
