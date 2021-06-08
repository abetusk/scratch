// https://codepen.io/njmcode/pen/rNebvPe#_=_
// 
// Copyright (c) 2021 by Neil McCallion (https://codepen.io/njmcode/pen/rNebvPe)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in the
// Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so, subject
// to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


const NOTES = {
  "A-0": 27.5, "A#0": 29.1352, "B-0": 30.8677, 
  "C-1": 32.7032, "C#1": 34.6478, "D-1": 36.7081, "D#1": 38.8909, "E-1": 41.2034, "F-1": 43.6535, "F#1": 46.2493, "G-1": 48.9994, "G#1": 51.9131, "A-1": 55, "A#1": 58.2705, "B-1": 61.7354,
  "C-2": 65.4064, "C#2": 69.2957, "D-2": 73.4162, "D#2": 77.7817, "E-2": 82.4069, "F-2": 87.3071, "F#2": 92.4986, "G-2": 97.9989, "G#2": 103.826, "A-2": 110, "A#2": 116.541, "B-2": 123.471,
  "C-3": 130.813, "C#3": 138.591, "D-3": 146.832, "D#3": 155.563, "E-3": 164.814, "F-3": 174.614, "F#3": 184.997, "G-3": 195.998, "G#3": 207.652, "A-3": 220, "A#3": 233.082, "B-3": 246.942,
  "C-4": 261.626, "C#4": 277.183, "D-4": 293.665, "D#4": 311.127, "E-4": 329.628, "F-4": 349.228, "F#4": 369.994, "G-4": 391.995, "G#4": 415.305, "A-4": 440, "A#4": 466.164, "B-4": 493.883,
  "C-5": 523.251, "C#5": 554.365, "D-5": 587.33, "D#5": 622.254, "E-5": 659.255, "F-5": 698.456, "F#5": 739.989, "G-5": 783.991, "G#5": 830.609, "A-5": 880, "A#5": 932.328, "B-5": 987.767,
  "C-6": 1046.5, "C#6": 1108.73, "D-6": 1174.66, "D#6": 1244.51, "E-6": 1318.51, "F-6": 1396.91, "F#6": 1479.98, "G-6": 1567.98, "G#6": 1661.22, "A-6": 1760, "A#6": 1864.66, "B-6": 1975.53,
  "C-7": 2093, "C#7": 2217.46, "D-7": 2349.32, "D#7": 2489.02, "E-7": 2637.02, "F-7": 2793.83, "F#7": 2959.96, "G-7": 3135.96, "G#7": 3322.44, "A-7": 3520, "A#7": 3729.31, "B-7": 3951.07,
  "C-8": 4186.01 ,

  "a0": 27.5, "a#0": 29.1352, "b0": 30.8677, 
  "c1": 32.7032, "c#1": 34.6478, "d1": 36.7081, "d#1": 38.8909, "e1": 41.2034, "f1": 43.6535, "f#1": 46.2493, "g1": 48.9994, "g#1": 51.9131, "a1": 55, "a#1": 58.2705, "b1": 61.7354,
  "c2": 65.4064, "c#2": 69.2957, "d2": 73.4162, "d#2": 77.7817, "e2": 82.4069, "f2": 87.3071, "f#2": 92.4986, "g2": 97.9989, "g#2": 103.826, "a2": 110, "a#2": 116.541, "b2": 123.471,
  "c3": 130.813, "c#3": 138.591, "d3": 146.832, "d#3": 155.563, "e3": 164.814, "f3": 174.614, "f#3": 184.997, "g3": 195.998, "g#3": 207.652, "a3": 220, "a#3": 233.082, "b3": 246.942,
  "c4": 261.626, "c#4": 277.183, "d4": 293.665, "d#4": 311.127, "e4": 329.628, "f4": 349.228, "f#4": 369.994, "g4": 391.995, "g#4": 415.305, "a4": 440, "a#4": 466.164, "b4": 493.883,
  "c5": 523.251, "c#5": 554.365, "d5": 587.33, "d#5": 622.254, "e5": 659.255, "f5": 698.456, "f#5": 739.989, "g5": 783.991, "g#5": 830.609, "a5": 880, "a#5": 932.328, "b5": 987.767,
  "c6": 1046.5, "c#6": 1108.73, "d6": 1174.66, "d#6": 1244.51, "e6": 1318.51, "f6": 1396.91, "f#6": 1479.98, "g6": 1567.98, "g#6": 1661.22, "a6": 1760, "a#6": 1864.66, "b6": 1975.53,
  "c7": 2093, "c#7": 2217.46, "d7": 2349.32, "d#7": 2489.02, "e7": 2637.02, "f7": 2793.83, "f#7": 2959.96, "g7": 3135.96, "g#7": 3322.44, "a7": 3520, "a#7": 3729.31, "b7": 3951.07,
  "c8": 4186.01

};

// ***************************************
// ***************************************
// ***
// *** https://github.com/velipso/adsrnode
// ***
// ***************************************
// ***************************************

// (c) Copyright 2018, Sean Connelly (@voidqk), http://sean.cm
// MIT License
// Project Home: https://github.com/voidqk/adsrnode

(function(){

var DEBUG = false;

function ADSRNode(ctx, opts){
	// `ctx` is the AudioContext
	// `opts` is an object in the format:
	// {
	//   base:         <number>, // output     optional    default: 0
	//   attack:       <number>, // seconds    optional    default: 0
	//   attackCurve:  <number>, // bend       optional    default: 0
	//   peak:         <number>, // output     optional    default: 1
	//   hold:         <number>, // seconds    optional    default: 0
	//   decay:        <number>, // seconds    optional    default: 0
	//   decayCurve:   <number>, // bend       optional    default: 0
	//   sustain:      <number>, // output     required
	//   release:      <number>, // seconds    optional    default: 0
	//   releaseCurve: <number>  // bend       optional    default: 0
	// }

	function getNum(opts, key, def){
		if (typeof def === 'number' && typeof opts[key] === 'undefined')
			return def;
		if (typeof opts[key] === 'number')
			return opts[key];
		throw new Error('[ADSRNode] Expecting "' + key + '" to be a number');
	}

	var attack = 0, decay = 0, sustain, sustain_adj, release = 0;
	var base = 0, acurve = 0, peak = 1, hold = 0, dcurve = 0, rcurve = 0;

	function update(opts){
		base    = getNum(opts, 'base'        , base   );
		attack  = getNum(opts, 'attack'      , attack );
		acurve  = getNum(opts, 'attackCurve' , acurve );
		peak    = getNum(opts, 'peak'        , peak   );
		hold    = getNum(opts, 'hold'        , hold   );
		decay   = getNum(opts, 'decay'       , decay  );
		dcurve  = getNum(opts, 'decayCurve'  , dcurve );
		sustain = getNum(opts, 'sustain'     , sustain);
		release = getNum(opts, 'release'     , release);
		rcurve  = getNum(opts, 'releaseCurve', rcurve );
		sustain_adj = adjustCurve(dcurve, peak, sustain);
	}

	// extract options
	update(opts);

	// create the node and inject the new methods
	var node = ctx.createConstantSource();
	node.offset.value = base;

	// unfortunately, I can't seem to figure out how to use cancelAndHoldAtTime, so I have to have
	// code that calculates the ADSR curve in order to figure out the value at a given time, if an
	// interruption occurs
	//
	// the curve functions (linearRampToValueAtTime and setTargetAtTime) require an *event*
	// preceding the curve in order to calculate the correct start value... inserting the event
	// *should* work with cancelAndHoldAtTime, but it doesn't (or I misunderstand the API).
	//
	// therefore, for the curves to start at the correct location, I need to be able to calculate
	// the entire ADSR curve myself, so that I can correctly interrupt the curve at any moment.
	//
	// these values track the state of the trigger/release moments, in order to calculate the final
	// curve
	var lastTrigger = false;
	var lastRelease = false;

	// small epsilon value to check for divide by zero
	var eps = 0.00001;

	function curveValue(type, startValue, endValue, curTime, maxTime){
		if (type === 0)
			return startValue + (endValue - startValue) * Math.min(curTime / maxTime, 1);
		// otherwise, exponential
		return endValue + (startValue - endValue) * Math.exp(-curTime * type / maxTime);
	}

	function adjustCurve(type, startValue, endValue){
		// the exponential curve will never hit its target... but we can calculate an adjusted
		// target so that it will miss the adjusted value, but end up hitting the actual target
		if (type === 0)
			return endValue; // linear hits its target, so no worries
		var endExp = Math.exp(-type);
		return (endValue - startValue * endExp) / (1 - endExp);
	}

	function triggeredValue(time){
		// calculates the actual value of the envelope at a given time, where `time` is the number
		// of seconds after a trigger (but before a release)
		var atktime = lastTrigger.atktime;
		if (time < atktime){
			return curveValue(acurve, lastTrigger.v,
				adjustCurve(acurve, lastTrigger.v, peak), time, atktime);
		}
		if (time < atktime + hold)
			return peak;
		if (time < atktime + hold + decay)
			return curveValue(dcurve, peak, sustain_adj, time - atktime - hold, decay);
		return sustain;
	}

	function releasedValue(time){
		// calculates the actual value of the envelope at a given time, where `time` is the number
		// of seconds after a release
		if (time < 0)
			return sustain;
		if (time > lastRelease.reltime)
			return base;
		return curveValue(rcurve, lastRelease.v,
			adjustCurve(rcurve, lastRelease.v, base), time, lastRelease.reltime);
	}

	function curveTo(param, type, value, time, duration){
		if (type === 0 || duration <= 0)
			param.linearRampToValueAtTime(value, time + duration);
		else // exponential
			param.setTargetAtTime(value, time, duration / type);
	}

	node.trigger = function(when){
		if (typeof when === 'undefined')
			when = this.context.currentTime;

		if (lastTrigger !== false){
			if (when < lastTrigger.when)
				throw new Error('[ADSRNode] Cannot trigger before future trigger');
			this.release(when);
		}
		var v = base;
		var interruptedLine = false;
		if (lastRelease !== false){
			var now = when - lastRelease.when;
			v = releasedValue(now);
			// check if a linear release has been interrupted by this attack
			interruptedLine = rcurve === 0 && now >= 0 && now <= lastRelease.reltime;
			lastRelease = false;
		}
		var atktime = attack;
		if (Math.abs(base - peak) > eps)
			atktime = attack * (v - peak) / (base - peak);
		lastTrigger = { when: when, v: v, atktime: atktime };

		this.offset.cancelScheduledValues(when);

		if (DEBUG){
			// simulate curve using triggeredValue (debug purposes)
			for (var i = 0; i < 10; i += 0.01)
				this.offset.setValueAtTime(triggeredValue(i), when + i);
			return this;
		}

		if (interruptedLine)
			this.offset.linearRampToValueAtTime(v, when);
		else
			this.offset.setTargetAtTime(v, when, 0.001);
		curveTo(this.offset, acurve, adjustCurve(acurve, v, peak), when, atktime);
		this.offset.setTargetAtTime(peak, when + atktime, 0.001);
		if (hold > 0)
			this.offset.setTargetAtTime(peak, when + atktime + hold, 0.001);
		curveTo(this.offset, dcurve, sustain_adj, when + atktime + hold, decay);
		this.offset.setTargetAtTime(sustain, when + atktime + hold + decay, 0.001);
		return this;
	};

	node.release = function(when){
		if (typeof when === 'undefined')
			when = this.context.currentTime;

		if (lastTrigger === false)
			throw new Error('[ADSRNode] Cannot release without a trigger');
		if (when < lastTrigger.when)
			throw new Error('[ADSRNode] Cannot release before the last trigger');
		var tnow = when - lastTrigger.when;
		var v = triggeredValue(tnow);
		var reltime = release;
		if (Math.abs(sustain - base) > eps)
			reltime = release * (v - base) / (sustain - base);
		lastRelease = { when: when, v: v, reltime: reltime };
		var atktime = lastTrigger.atktime;
		// check if a linear attack or a linear decay has been interrupted by this release
		var interruptedLine =
			(acurve === 0 && tnow >= 0 && tnow <= atktime) ||
			(dcurve === 0 && tnow >= atktime + hold && tnow <= atktime + hold + decay);
		lastTrigger = false;

		this.offset.cancelScheduledValues(when);
		node.baseTime = when + reltime;

		if (DEBUG){
			// simulate curve using releasedValue (debug purposes)
			for (var i = 0; true; i += 0.01){
				this.offset.setValueAtTime(releasedValue(i), when + i);
				if (i >= reltime)
					break;
			}
			return this;
		}

		if (interruptedLine)
			this.offset.linearRampToValueAtTime(v, when);
		else
			this.offset.setTargetAtTime(v, when, 0.001);
		curveTo(this.offset, rcurve, adjustCurve(rcurve, v, base), when, reltime);
		this.offset.setTargetAtTime(base, when + reltime, 0.001);
		return this;
	};

	node.reset = function(){
		lastTrigger = false;
		lastRelease = false;
		var now = this.context.currentTime;
		this.offset.cancelScheduledValues(now);
		this.offset.setTargetAtTime(base, now, 0.001);
		node.baseTime = now;
		return this;
	};

	node.update = function(opts){
		update(opts);
		return this.reset();
	};

	node.baseTime = 0;

	return node;
}

// export appropriately
if (typeof window === 'undefined')
	module.exports = ADSRNode;
else
	window.ADSRNode = ADSRNode;

})();

// ***************************************
// ***************************************
// ***
// *** https://github.com/velipso/adsrnode
// ***
// ***************************************
// ***************************************



function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}

const sequencerTimer = (() => {

  let NUM_STEPS = 16, NUM_BEATS = 4;

  // time in s
  //
  let READ_AHEAD_TIME = 0.005;

   // time in ms
   //
  let UPDATE_INTERVAL = 10;

  //let tempo = 120;
  let tempo = 60;

  // 16 steps/bar
  //
  let stepDuration = 60 / tempo / NUM_BEATS;

  let playStartTime = 0;
  let nextStepTime = 0;
  let currentStepIndex = 0;
  let isPlaying = false;

  let ti;
  let stepCallbacks = [];

  // Advance the 'playhead' in the sequence (w/ looping)
  //
  const nextStep = () => {
    if (!isPlaying) return false;
    currentStepIndex++;
    if (currentStepIndex === NUM_STEPS) currentStepIndex = 0;
    nextStepTime += stepDuration;
  };

  // Schedule callbacks to fire for every step within 
  // the current 'window', and check again in a moment
  const update = () => {
    while (nextStepTime < Synth.AC.currentTime + READ_AHEAD_TIME) {
      stepCallbacks.forEach(cb => cb(currentStepIndex, nextStepTime));
      nextStep();
    }
    ti = setTimeout(() => { update(); }, UPDATE_INTERVAL); };

  const registerStepCallback = callback => { stepCallbacks.push(callback); };
  const unregisterStepCallback = callback => { stepCallbacks = stepCallbacks.filter(cb => cb !== callback); };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;
    currentStepIndex = 0;
    nextStepTime = Synth.AC.currentTime;
    update();
  };

  const stop = () => {
    isPlaying = false;
    clearTimeout(ti);
  };

  return {
    start,
    stop,
    registerStepCallback,
    unregisterStepCallback };
})();


// Synth class

class Synth {
  constructor(params = {}) {
    _defineProperty(this, "getAnalyserData",
     () => {
        this.nodes.analyser.getByteTimeDomainData(this.analyserData);
        return this.analyserData;
      }
    );

    _defineProperty(this, "setParam",
      (param, value = this.params[param]) => {
        if (param && param in this.params) this.params[param] = value;

        switch (param) {
          case 'volume':
            this.nodes.volume.gain.value = value;
            break;
          case 'filterFreq':
            this.nodes.filter.frequency.value = this.calcFreqValue(value);
            break;
          case 'filterQ':
            this.nodes.filter.Q.value = value * Synth.MAX_FILTER_Q;
            break;
          case 'echoTime':
            this.nodes.delay.delayTime.value = value * Synth.MAX_ECHO_DURATION;
            break;
          case 'echoFeedback':
            this.nodes.feedback.gain.value = value;
            break;
          case 'unisonWidth':
            const width = this.getUnisonWidth(value);
            this.oscillators[1].detune.value = -width;
            this.oscillators[2].detune.value = width;
            break;
          default:
            break;
        }
      }
    );

    _defineProperty(this, "getUnisonWidth", amt => amt * Synth.MAX_UNISON_WIDTH);
    _defineProperty(this, "calcFreqValue", amt => Math.max(Synth.MIN_FILTER_FREQ, amt * (Synth.AC.sampleRate / 2)));


    _defineProperty(this, "getADSRValue",
      val => { return val; }
    );

    _defineProperty(this, "getADSRFilterValue",
      val => {
        const tgt = this.calcFreqValue(val);
        const max = this.calcFreqValue(this.params.filterFreq);
        return Math.min(tgt, max);
      }
    );

    _defineProperty(this, "noteOn",

      (freq, t = 0) => {
        Synth.AC.resume();

        //this.killOscillators(t);

        const ct = Synth.AC.currentTime;

        //--

        this.nodes.adsr_envelope.update( {
          //"attack":   this.params.adsrAttack,
          "attack":   2.0,
          //"decay":    this.params.adsrDecay,
          "decay":    0.2,
          //"sustain":  this.params.adsrSustain,
          "sustain":  0.5,
          //"release":  this.params.adsrRelease
          "release":  0.5
        });

        /*
        var adsrTarget = this.nodes.adsr.gain;
        this.nodes.adsr.gain.setValueAtTime(1, ct);
        var atkDuration = this.params.adsrAttack * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setValueAtTime(this.getADSRValue(0), ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRValue(1), ct + atkDuration);

        var decayDuration = this.params.adsrDecay * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setTargetAtTime(this.getADSRValue(this.params.adsrSustain), ct + atkDuration, decayDuration);
        */

        //--

        this.nodes.filter_envelope.update( {
          "attack":   this.params.adsrFilterAttack,
          "decay":    this.params.adsrFilterDecay,
          "sustain":  this.params.adsrFilterSustain,
          "release":  this.params.adsrFilterRelease
        });

        /*
        var adsrTarget = this.nodes.filter.frequency;
        this.nodes.filter.frequency.setValueAtTime(this.calcFreqValue(this.params.filterFreq), ct);
        var atkDuration = this.params.adsrFilterAttack * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setValueAtTime(this.getADSRFilterValue(0), ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRFilterValue(1), ct + atkDuration);

        var decayDuration = this.params.adsrFilterDecay * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setTargetAtTime(this.getADSRFilterValue(this.params.adsrFilterSustain), ct + atkDuration, decayDuration);
        */

        //--

        var width = this.getUnisonWidth(this.params.unisonWidth);

        this.oscillators[0] = this.createOscillator(freq, this.params.waveform);
        this.oscillators[0].start(t);

        //this.oscillators[1] = this.createOscillator(freq, this.params.waveform, -width);
        //this.oscillators[2] = this.createOscillator(freq, this.params.waveform, width);
        //this.oscillators.forEach(osc => osc.start(t));

        this.nodes.adsr_envelope.trigger();
        this.nodes.filter_envelope.trigger();
      }
    );

    _defineProperty(this, "noteOff",

      (t = 0) => {
        const ct = Synth.AC.currentTime;

        this.nodes.adsr_envelope.release(ct);
        this.nodes.filter_envelope.release(ct);

        /*

        var relDuration = (this.params.adsrAttack + this.params.adsrDecay + this.params.adsrRelease) * Synth.MAX_ADSR_STAGE_DURATION;
        var adsrTarget = this.nodes.adsr.gain;
        adsrTarget.setValueAtTime(adsrTarget.value, ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRValue(0), ct + relDuration);

        this.killOscillators(ct + 100*relDuration);
        console.log(">>", ct, relDuration);
        console.log(">>>", ct, ct + 4*relDuration, this.params.adsrAttack, this.params.adsrDecay, this.params.adsrSustain, this.params.adsrRelease);


        relDuration = (this.params.adsrFilterAttack + this.params.adsrFilterDecay + this.params.adsrFilterRelease) * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget = this.nodes.filter.frequency;
        adsrTarget.setValueAtTime(adsrTarget.value, ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRFilterValue(0), ct + relDuration);
        */
      }
    );


    _defineProperty(this, "noteOn_orig",

      (freq, t = 0) => {
        Synth.AC.resume();

        this.killOscillators(t);

        const ct = Synth.AC.currentTime;

        //--

        var adsrTarget = this.nodes.adsr.gain;
        this.nodes.adsr.gain.setValueAtTime(1, ct);
        var atkDuration = this.params.adsrAttack * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setValueAtTime(this.getADSRValue(0), ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRValue(1), ct + atkDuration);

        var decayDuration = this.params.adsrDecay * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setTargetAtTime(this.getADSRValue(this.params.adsrSustain), ct + atkDuration, decayDuration);

        //--

        var adsrTarget = this.nodes.filter.frequency;
        this.nodes.filter.frequency.setValueAtTime(this.calcFreqValue(this.params.filterFreq), ct);
        var atkDuration = this.params.adsrFilterAttack * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setValueAtTime(this.getADSRFilterValue(0), ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRFilterValue(1), ct + atkDuration);

        var decayDuration = this.params.adsrFilterDecay * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget.setTargetAtTime(this.getADSRFilterValue(this.params.adsrFilterSustain), ct + atkDuration, decayDuration);

        //--

        var width = this.getUnisonWidth(this.params.unisonWidth);

        this.oscillators[0] = this.createOscillator(freq, this.params.waveform);
        this.oscillators[1] = this.createOscillator(freq, this.params.waveform, -width);
        this.oscillators[2] = this.createOscillator(freq, this.params.waveform, width);

        this.oscillators.forEach(osc => osc.start(t));
      }
    );


    _defineProperty(this, "noteOff_orig",

      (t = 0) => {
        const ct = Synth.AC.currentTime;



        //const relDuration = this.params.adsrRelease * Synth.MAX_ADSR_STAGE_DURATION;
        //const adsrTarget = this.getADSRTarget();

        var relDuration = (this.params.adsrAttack + this.params.adsrDecay + this.params.adsrRelease) * Synth.MAX_ADSR_STAGE_DURATION;
        var adsrTarget = this.nodes.adsr.gain;
        adsrTarget.setValueAtTime(adsrTarget.value, ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRValue(0), ct + relDuration);

        this.killOscillators(ct + 100*relDuration);
        console.log(">>", ct, relDuration);
        console.log(">>>", ct, ct + 4*relDuration, this.params.adsrAttack, this.params.adsrDecay, this.params.adsrSustain, this.params.adsrRelease);


        relDuration = (this.params.adsrFilterAttack + this.params.adsrFilterDecay + this.params.adsrFilterRelease) * Synth.MAX_ADSR_STAGE_DURATION;
        adsrTarget = this.nodes.filter.frequency;
        adsrTarget.setValueAtTime(adsrTarget.value, ct);
        adsrTarget.linearRampToValueAtTime(this.getADSRFilterValue(0), ct + relDuration);
      }
    );

    _defineProperty(this, "killOscillators",

      (t = 0) => {
        console.log("kill>>", t);
        this.nodes.adsr.gain.cancelScheduledValues(t);
        this.nodes.filter.frequency.cancelScheduledValues(t);
        this.oscillators.forEach(osc => {
          if (osc) osc.stop(t);
        });
      }
    );

    _defineProperty(this, "createOscillator",

      (freq, waveform, detune = 0) => {
        const osc = Synth.AC.createOscillator();
        osc.type = Synth.TYPES[waveform];
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(this.nodes.adsr);
        return osc;
      }
    );

    _defineProperty(this, "timePlus",

      secs => {
        return Synth.AC.currentTime + secs;
      }
    );

    _defineProperty(this, "onStep",

      (stepIndex, stepStartTime) => {
        const note = this.sequence[stepIndex];

        if (note) {
          if (note === 'xxx') {
            this.noteOff(stepStartTime);
          } else {
            this.noteOn(NOTES[note], stepStartTime);
          }
        }

        if (this.stepCallback) this.stepCallback(stepIndex);
      }
    );

    _defineProperty(this, "play",

      stepCallback => {
        this.stepCallback = stepCallback;

        sequencerTimer.registerStepCallback(this.onStep);
        this.isPlaying = true;
        sequencerTimer.start();
      }
    );

    _defineProperty(this, "stop",
      () => {
        this.isPlaying = false;
        sequencerTimer.stop();
        sequencerTimer.unregisterStepCallback(this.onStep);
        this.noteOff();
      }
    );

    if (!Synth.AC) throw 'Synth: Web Audio not supported!';
    console.log('New Synth', Synth.AC.currentTime);
    this.oscillators = new Array(3);
    this.params = { ...Synth.PARAM_DEFAULTS, ...params };
    this.nodes = {};
    this.nodes.volume = Synth.AC.createGain();
    this.setParam('volume');
    this.nodes.adsr = Synth.AC.createGain();
    this.nodes.filter = Synth.AC.createBiquadFilter();
    this.nodes.filter.type = 'lowpass';
    this.setParam('filterFreq');
    this.setParam('filterQ');
    this.nodes.delay = Synth.AC.createDelay(Synth.MAX_ECHO_DURATION);
    this.nodes.feedback = Synth.AC.createGain();
    this.setParam('echoTime');
    this.setParam('echoFeedback');
    this.nodes.analyser = Synth.AC.createAnalyser();
    this.nodes.analyser.smoothingTimeConstant = 0.5;
    this.nodes.analyser.fftSize = 256;
    this.analyserBufferLength = this.nodes.analyser.frequencyBinCount;
    this.analyserData = new Uint8Array(this.analyserBufferLength);
    this.nodes.adsr.connect(this.nodes.filter);

    //this.nodes.filter.connect(this.nodes.delay);

    this.nodes.delay.connect(this.nodes.feedback);
    this.nodes.feedback.connect(this.nodes.delay);
    this.nodes.filter.connect(this.nodes.volume);
    //this.nodes.feedback.connect(this.nodes.volume);

    this.nodes.volume.connect(this.nodes.analyser);
    this.nodes.analyser.connect(Synth.AC.destination);
    this.sequence = ['C-3', 'D#3', 'G-3', 'C-3', 'D-3', 'D#3', 'C-3', 'D-3', 'D#3', 'C-3', 'D#3', 'G#3', 'C-3', 'G-3', 'C-3', 'G-3'];
    this.isPlaying = false;

    this.nodes.adsr_envelope = ADSRNode(Synth.AC, {
      "attack":   this.params.adsrAttack,
      "decay":    this.params.adsrDecay,
      "sustain":  this.params.adsrSustain,
      "release":  this.params.adsrRelease
    });
    this.nodes.adsr_envelope.connect(this.nodes.adsr.gain);
    this.nodes.adsr_envelope.start();

    this.nodes.filter_envelope = ADSRNode(Synth.AC, {
      "attack":   this.params.adsrFilterAttack,
      "decay":    this.params.adsrFilterDecay,
      "sustain":  this.params.adsrFilterSustain,
      "release":  this.params.adsrFilterRelease
    });
    //this.nodes.filter_envelope.connect(this.nodes.filter.frequency);
    this.nodes.filter_envelope.start();


  }
}


/** UI **/
_defineProperty(Synth, "AC", new (AudioContext || webkitAudioContext)());
_defineProperty(Synth, "TYPES", ['sine', 'square', 'triangle', 'sawtooth']);
_defineProperty(Synth, "TYPES_ABBR", ['sin', 'squ', 'tri', 'saw']);
_defineProperty(Synth, "ADSR_TARGETS", ['adsr', 'filter']);
_defineProperty(Synth, "MAX_UNISON_WIDTH", 30);
_defineProperty(Synth, "MAX_ADSR_STAGE_DURATION", 2);
_defineProperty(Synth, "MAX_ECHO_DURATION", 2);
_defineProperty(Synth, "MIN_FILTER_FREQ", 40);
_defineProperty(Synth, "MAX_FILTER_Q", 30);
_defineProperty(Synth, "PARAM_DEFAULTS", {
  unisonWidth: 0.2,
  volume: 0.3,

  adsrAttack: 0.2,
  adsrDecay: 0,
  adsrSustain: 1,
  adsrRelease: 0.2,

  adsrFilterAttack: 0.2,
  adsrFilterDecay: 0,
  adsrFilterSustain: 1,
  adsrFilterRelease: 0.2,

  filterFreq: 0.5,
  filterQ: 0.2,
  echoTime: 0,
  echoFeedback: 0,
  waveform: 3
});

function init() {
  console.log("...init");
}

