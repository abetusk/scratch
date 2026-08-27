
var SYNTH;
var SYNTH_PRESET = {
  "_dungeon": {
    fAttack: 0.15, fDecay: 0.3, fSustain: 0.3, fRelease: 0.6,
    gAttack: 0.15, gDecay: 0.2, gSustain: 0.6, gRelease: 0.8,
    reverbWet: 0.45, reverbDecay: 2.0,
    filterLfoRate: 1.2, filterLfoDepth: 80, filterLfoWave: 'triangle',
    gainLfoRate: 0.8, gainLfoDepth: 0.08, gainLfoWave: 'triangle',
    reverbLfoRate: 0.4, reverbLfoDepth: 0.05, reverbLfoWave: 'triangle',
    masterVol: 0.6,
    osc1Wave: 'sawtooth', osc2Wave: 'square', osc3Wave: 'triangle',
    osc1Vol: 0.3, osc2Vol: 0.35, osc3Vol: 0.4,
    osc1Detune: -8, osc2Detune: 0, osc3Detune: 8,
    osc1LfoRate: 2.0, osc2LfoRate: 2.3, osc3LfoRate: 2.6,
    osc1LfoDepth: 0.15, osc2LfoDepth: 0.2, osc3LfoDepth: 0.25,
    filterFreq: 1200, filterQ: 0.8
  },

  "custom": {
    gAttack: 0.015, gDecay: 0.1, gSustain: 0.6, gRelease: 0.1,
    fAttack: 0.015, fDecay: 0.1, fSustain: 0.6, fRelease: 0.1,
    reverbWet: 1.0, reverbDecay: 0.08,

    filterLfoRate: 0.02,  filterLfoDepth: 0.08, filterLfoWave:  'sin',
    gainLfoRate:   0.8,   gainLfoDepth:   0.08, gainLfoWave:    'sin',
    reverbLfoRate: 0.1,   reverbLfoDepth: 0.05, reverbLfoWave:  'sin',

    masterVol: 0.8,

    osc1Wave:   'sawtooth', osc2Wave:   'square', osc3Wave: 'triangle',
    osc1Vol:    0.8,        osc2Vol:    0.8,      osc3Vol: 0.8,
    osc1Detune: -8,         osc2Detune: 0,        osc3Detune: 8,

    osc1LfoRate:  2.0,  osc2LfoRate:  2.3, osc3LfoRate: 2.6,
    osc1LfoDepth: 0.15, osc2LfoDepth: 0.2, osc3LfoDepth: 0.25,

    filterFreq: 1200, filterQ: 0.8
  },

  "dungeon": {
    fAttack: 0.015, fDecay: 0.3, fSustain: 0.3, fRelease: 0.1,
    gAttack: 0.05, gDecay: 0.4, gSustain: 0.6, gRelease: 0.1,
    reverbWet: 0.9, reverbDecay: 0.45,
    filterLfoRate: 1.2, filterLfoDepth: .080, filterLfoWave: 'triangle',
    gainLfoRate: 0.8, gainLfoDepth: 0.08, gainLfoWave: 'triangle',
    reverbLfoRate: 0.4, reverbLfoDepth: 0.05, reverbLfoWave: 'triangle',
    masterVol: 0.8,
    osc1Wave: 'sawtooth', osc2Wave: 'square', osc3Wave: 'triangle',
    osc1Vol: 0.8, osc2Vol: 0.8, osc3Vol: 0.8,
    osc1Detune: -8, osc2Detune: 0, osc3Detune: 8,
    osc1LfoRate: 2.0, osc2LfoRate: 2.3, osc3LfoRate: 2.6,
    osc1LfoDepth: 0.15, osc2LfoDepth: 0.2, osc3LfoDepth: 0.25,
    filterFreq: 1200, filterQ: 0.8
  },

  "cathedral": {
    fAttack: 0.02, fDecay: 0.5, fSustain: 0.4, fRelease: 1.0,
    gAttack: 0.02, gDecay: 0.3, gSustain: 0.7, gRelease: 1.2,
    reverbWet: 1.0, reverbDecay: 0.8,
    filterLfoRate: 0.6, filterLfoDepth: 50, filterLfoWave: 'sine',
    gainLfoRate: 0.3, gainLfoDepth: 0.05, gainLfoWave: 'sine',
    reverbLfoRate: 0.2, reverbLfoDepth: 0.03, reverbLfoWave: 'sine',
    masterVol: 0.85,
    osc1Wave: 'sine', osc2Wave: 'sine', osc3Wave: 'triangle',
    osc1Vol: 0.8, osc2Vol: 0.8, osc3Vol: 0.8,
    osc1Detune: -12, osc2Detune: 0, osc3Detune: 12,
    osc1LfoRate: 1.0, osc2LfoRate: 1.3, osc3LfoRate: 1.6,
    osc1LfoDepth: 0.1, osc2LfoDepth: 0.15, osc3LfoDepth: 0.2,
    filterFreq: 800, filterQ: 0.6
  },

  "goblin": {
    fAttack: 0.02, fDecay: 0.1, fSustain: 0.2, fRelease: 0.2,
    gAttack: 0.01, gDecay: 0.08, gSustain: 0.4, gRelease: 0.15,
    reverbWet: 1.0, reverbDecay: 0.4,
    filterLfoRate: 4.0, filterLfoDepth: 150, filterLfoWave: 'square',
    gainLfoRate: 3.0, gainLfoDepth: 0.2, gainLfoWave: 'square',
    reverbLfoRate: 1.5, reverbLfoDepth: 0.1, reverbLfoWave: 'square',
    masterVol: 0.8,
    osc1Wave: 'square', osc2Wave: 'sawtooth', osc3Wave: 'square',
    osc1Vol: 0.8, osc2Vol: 0.8, osc3Vol: 0.8,
    osc1Detune: -24, osc2Detune: 0, osc3Detune: 24,
    osc1LfoRate: 5.0, osc2LfoRate: 4.5, osc3LfoRate: 5.5,
    osc1LfoDepth: 0.4, osc2LfoDepth: 0.3, osc3LfoDepth: 0.35,
    filterFreq: 800, filterQ: 1.5
  }

};

function _bard_game_init() {
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  synth = new Synth(audioCtx);
  synth.output.connect(audioCtx.destination);

  var seq = new StepSequencer(audioCtx, synth, 120);

  // C major arpeggio
  seq.setSequence([
    261.63,
    261.63,
    329.63, 392.00, 523.25,
    392.00, 329.63, 261.63, null
  ]);

  console.log("???", synth);

  seq.start();

}

// slop lute
//
var g_lute = {};
function bard_game_init() {
  var lute = new ChiptuneLute({ decay: 0.8, gain: 0.6, detune: 18 });

  console.log("...");

  g_lute = lute;


  let ui_id_enable_list = [
    'ui_example',
    'ui_ok',
    'ui_ex1_1', 'ui_ex1_2', 'ui_ex1_3',
    'ui_ex1_4', 'ui_ex1_5', 'ui_ex1_6'
  ];

  for (let i=0; i<ui_id_enable_list.length; i++) {
    let _id = ui_id_enable_list[i];
    let ele = document.getElementById(_id);
    ele.style.pointerEvents = 'auto';
    ele.style.opacity = 1.0;
  }

}

function bard_note2tune_note(bard_note) {

  let dur_map = {
    "o": 1, "*": 0.5, "+": 0.25, ":":0.125, ".":1/16
  };

  let note_map = {
    "c": "C", "u": "C#", "d": "D", "v": "D#",
    "e": "E",
    "f": "F", "w": "F#", "g": "G", "x": "G#", "a": "A", "y": "A#",
    "b": "B",
    "z": "z"
  };

  if (bard_note == 'z') {
    return { "note": "z", "duration": 0.25 };
  }


  let _dur = dur_map[ bard_note[0] ];
  let _basenote  = note_map[ bard_note[1] ];
  let _octave  = ((bard_note.length == 3) ? bard_note[2] : "");

  let _note = _basenote + _octave;

  return { "note":_note, "duration":_dur };
}

function melody2tune(M) {

  let _tune = [];

  for (let measure_idx=0; measure_idx<M.length; measure_idx++) {
    for (let pos_idx=0; pos_idx<M[measure_idx].length; pos_idx++) {
      _tune.push( bard_note2tune_note( M[measure_idx][pos_idx] ) );
    }
  }

  return _tune;
}

function bard_game_btn_ok(_name) {
  let ele = document.getElementById("ui_text");

  let s = ele.value;

  let M = s2melody(s);

  let _tune = melody2tune(M);

  let bpm = 60;

  slop_lute_stop_melody( g_lute );
  slop_lute_start_melody( g_lute, _tune, bpm);
}

function bard_game_btn_sol(_name) {
  console.log(">>", _name);

  let example_sol = {};
  example_sol["ex1.1"] = ex1_1_example_solution();
  example_sol["ex1.2"] = ex1_2_example_solution();
  example_sol["ex1.3"] = ex1_3_example_solution();
  example_sol["ex1.4"] = ex1_4_example_solution();
  example_sol["ex1.5"] = ex1_5_example_solution();
  example_sol["ex1.6"] = ex1_6_example_solution();

  if (_name in example_sol) {
    let ele = document.getElementById("ui_text");
    ele.value = example_sol[_name];
  }

}

function bard_game_test_tune() {
  slop_lute_start_melody(g_lute, furElise, 80);
}

function __bard_game_init() {
  synth = new SynthEngine();

  synth.loadPreset( SYNTH_PRESET['custom'] );

  console.log("load");
}
