
var g_voco_sched = [
  { "pho": "l", "dt": 88 },
  { "pho": "U", "dt": 69 },
  { "pho": "k", "dt": 138 },
  { "pho": "Q", "dt": 63 },
  { "pho": "n", "dt": 94 },
  { "pho": "m", "dt": 88 },
  { "pho": "aI", "dt": 89 },
  { "pho": "w", "dt": 88 },
  { "pho": "3:", "dt": 136 },
  { "pho": "k", "dt": 136 },
  { "pho": "s", "dt": 188 },
  { "pho": "_", "dt": 274 },
  { "pho": "_", "dt": 1 },
  { "pho": "j", "dt": 88 },
  { "pho": "i:", "dt": 64 },
  { "pho": "m", "dt": 88 },
  { "pho": "aI", "dt": 134 },
  { "pho": "t", "dt": 126 },
  { "pho": "I", "dt": 149 },
  { "pho": "_", "dt": 274 },
  { "pho": "_", "dt": 1 },
  { "pho": "{", "dt": 44 },
  { "pho": "n", "dt": 92 },
  { "pho": "d", "dt": 88 },
  { "pho": "d", "dt": 88 },
  { "pho": "I", "dt": 41 },
  { "pho": "s", "dt": 119 },
  { "pho": "p", "dt": 87 },
  { "pho": "e@", "dt": 300 },
  { "pho": "_", "dt": 616 },
  { "pho": "_", "dt": 1 }
];

function init() {
  let t = 0;
  for (let ii=0; ii<g_voco_sched.length; ii++) {
    g_voco_sched[ii]["t"] = t / 1000.0;
    t += g_voco_sched[ii].dt;
  }
}

init();

function hellotone() {
  //create a synth and connect it to the main output (your speakers)
  const synth = new Tone.Synth().toDestination();

  //play a middle 'C' for the duration of an 8th note
  synth.triggerAttackRelease("C4", "8n");
}

function attackrelease() {
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now()
  // trigger the attack immediately
  synth.triggerAttack("C4", now)
  // wait one second before triggering the release
  synth.triggerRelease(now + 1)
}

function trigger_attack_release() {
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now()
  synth.triggerAttackRelease("C4", "8n", now)
  synth.triggerAttackRelease("E4", "8n", now + 0.5)
  synth.triggerAttackRelease("G4", "8n", now + 1)
}

function player() {
  //const player = new Tone.Player("data/ozymandias_of_egypt_shelley_krs_64kb.mp3").toDestination();
  const player = new Tone.Player("data/ozymandias_of_egypt_shelley_krs_64kb.mp3");
  player.toDestination();

  player.autostart = true;
}

var g_fs = {};
var g_ps = {};
var g_player = {};

function player_pitchshift() {
  g_ps = new Tone.PitchShift();
  g_player = new Tone.Player("data/ozymandias_of_egypt_shelley_krs_64kb.mp3");

  g_ps.pitch = 12;

  g_player.connect(g_ps);
  g_ps.toDestination();
  g_player.autostart = true;
}

function crnd(a) {
  let n = Math.floor(Math.random()*a.length);
  return a[n];
}

function player_pitchshift1() {
  g_ps = new Tone.PitchShift();
  g_player = new Tone.Player("data/ozymandias_of_egypt_shelley_krs_64kb.mp3");

  g_ps.windowSize = 0.05;
  g_ps.pitch = 0;

  Tone.Transport.scheduleRepeat((t) => {
    g_ps.pitch = crnd( [0-12,2-12,3-12,5-12,7-12,8-12,10-12,0,2,3,5,7,8,10,12] );
    console.log(">>", g_ps.pitch);
  }, "4n");
  Tone.Transport.start();


  g_player.connect(g_ps);
  g_ps.toDestination();
  g_player.autostart = true;
}

function player_pitchshift2_s() {
  for (let ii=0; ii<g_voco_sched.length; ii++) {
    Tone.Transport.schedule( function(t) {
      g_ps.pitch = crnd( [0-12,2-12,3-12,5-12,
          7-12,8-12,10-12,0,2,3,5,7,
          7-12,8-12,10-12,0,2,3,5,7,
               8-12,10-12,0,2,3,5,
                    10-12,0,2,3,
                          0,2,
                          0,
          8,10,12] );
      console.log(">>", t, g_ps.pitch);
    }, g_voco_sched[ii].t );

  }

  Tone.Transport.start();

}

var g_gain, g_lim, g_reverb;

function player_pitchshift3() {

  Tone.Transport.stop();

  g_gain = new Tone.Gain(0.5);
  g_ps = new Tone.PitchShift();
  g_player = new Tone.Player("data/ozy.wav", player_pitchshift2_s);
  g_lim = new Tone.Limiter(-20);

  g_reverb = new Tone.Reverb();
  g_reverb.set({
    "wet" : 0
  });

  g_ps.windowSize = 0.05;
  g_ps.pitch = 0;

  g_player.connect(g_ps);
  g_ps.connect(g_lim);
  g_lim.connect(g_reverb);
  g_reverb.connect(g_gain);
  g_gain.toDestination();
  g_player.autostart = true;
}

function player_pitchshift2() {

  Tone.Transport.stop();

  g_gain = new Tone.Gain(0.5);
  g_ps = new Tone.PitchShift();
  g_player = new Tone.Player("data/ozy.wav", player_pitchshift2_s);
  g_lim = new Tone.Limiter(-20);

  g_ps.windowSize = 0.05;
  g_ps.pitch = 0;

  g_player.connect(g_ps);
  g_ps.connect(g_lim);
  g_lim.connect(g_gain);
  g_gain.toDestination();
  g_player.autostart = true;
}

// not relevant for htis
//
function player_freqshift() {
  g_fs = new Tone.FrequencyShifter();
  g_player = new Tone.Player("data/ozymandias_of_egypt_shelley_krs_64kb.mp3");

  g_fs.frequency = 20;

  g_player.connect(g_fs);
  g_fs.toDestination();
  g_player.autostart = true;
}


