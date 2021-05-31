// https://youtu.be/uasGsHf7UYA
//

var g_ctx = {
  "actx" : null,
  "osc" : null,
  "note" : {
    "c4" : 261.626,
    "c#4" : 277.183,
    "c5"  : 523.251
  }
};

function __() {
  AudioParam.value = value;
  AudioParam.setValueAtTime();
  AudioParam.linearRampToValueAtTime();
  AudioParam.exponentialrampToValueAtTime();
  AudioParam.setTargetAtTime();
  AudioParma.setValueCurveAtTime();
  AudioParam.cancelScheduledValues();
}

function experiment0() {
  var osc = g_ctx.actx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = g_ctx.note["c4"];
  osc.connect(g_ctx.actx.destination);
  osc.start();
  osc.stop(g_ctx.actx.currentTime + 2);
}

function experiment1() {
  var actx = g_ctx.actx;
  var freq = g_ctx.note['c4'];

  var osc_bank = [];
  var detune = [0,-10,10];

  for (var ii=0; ii<3; ii++) {
    var osc = actx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.detune.value = detune[ii];
    osc.connect(actx.destination);
    osc.start();

    osc.stop(actx.currentTime + 2);

    osc_bank.push(osc);
  }

}

function experiment2_on() {
  var actx = g_ctx.actx;
  var freq = g_ctx.note['c4'];

  var osc_bank = [];
  var detune = [0,-10,10];

  var _T = 2;

  var adsr = {
    'attack':0.2, 
    'decay':0.0, 
    'sutatin':1,
    'release':0.3
  };

  gain_node.gain.cancelScheduledValues();

  var osc = createOscillator(freq);
  osc.connect(gain_node);

  var now = actx.currentTime;
  var a_dur = adsr.attack * _T;
  var a_end = now + a_dur;
  var d_dur = adsr.decay * _T;

  gain_node.gain.setValueAtTime(0, actx.currentTime);
  gain_node.gain.linearRampToValueAtTime(1, a_end);
  gain_node.gain.setTargetAtTime(adsr.sustain, a_end, d_dur);

}

function experiment2_off() {
  var actx = g_ctx.actx;

  var _T = 2;

  var adsr = {
    'attack':0.2, 
    'decay':0.0, 
    'sutatin':1,
    'release':0.3
  };

  gain_node.gain.cancelScheduledValues();

  var now = actx.currentTime;
  var r_dur = adsr.release * _T;
  var r_end = now + r_dur;

  gain_node.gain.setValueAtTime(gain_node.gain.value, now);
  asdr_node.gain.linearRampToValueAtTime(0, r_end);

}

function experiment3() {
  var actx = g_ctx.actx;
  var max_filt_freq = actx.sampleRate/2;

  var val_f = 1000;
  var val_Q = 10;

  var filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = val_f * max_filt_freq;
  filter.Q.value =  val_Q;

  osc.connect(filter);
  filter.connect(actx.destination);

}

function init() {
  g_ctx.actx = new (AudioContext || webkitAudiotContext)();
}

