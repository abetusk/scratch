
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


