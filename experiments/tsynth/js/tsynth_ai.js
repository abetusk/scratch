
var g_data = {
};

function ui_button() {
  console.log("bang");

  tsynth_ai_init();
  tsynth_ai_play();
}

function tsynth_ai_init_0() {
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

  let osc2 = new Tone.PolySynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 }
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
  lfoPitch.connect(osc0.get().detune);
  //g_data.lfo["pitch"] = lfoPitch;

  // Routing
  osc0.connect(filter);
  osc1.connect(filter);
  osc2.connect(filter);

  filter.chain(delay, reverb, Tone.Destination);
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
