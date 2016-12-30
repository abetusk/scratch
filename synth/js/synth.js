var voices = new Array();
var audioContext = null;
var isMobile = false;	// we have to disable the convolver on mobile for performance reasons.

// This is the "initial patch"
var currentModWaveform = 0;	// SINE
var currentModFrequency = 2.1; // Hz * 10 = 2.1
var currentModOsc1 = 15;
var currentModOsc2 = 17;

var currentOsc1Waveform = 2; // SAW
var currentOsc1Octave = 0;  // 32'
var currentOsc1Detune = 0;	// 0
var currentOsc1Mix = 50.0;	// 50%

var currentOsc2Waveform = 2; // SAW
var currentOsc2Octave = 0;  // 16'
var currentOsc2Detune = -25;	// fat detune makes pretty analogue-y sound.  :)
var currentOsc2Mix = 50.0;	// 0%

var currentFilterCutoff = 8;
var currentFilterQ = 7.0;
var currentFilterMod = 21;
var currentFilterEnv = 56;

var currentEnvA = 2;
var currentEnvD = 15;
var currentEnvS = 68;
var currentEnvR = 5;

var currentFilterEnvA = 5;
var currentFilterEnvD = 6;
var currentFilterEnvS = 5;
var currentFilterEnvR = 7;

var currentDrive = 38;
var currentRev = 32;
var currentVol = 75;
// end initial patch

var keys = new Array( 256 );
/* old mapping
keys[65] = 60; // = C4 ("middle C")
keys[87] = 61;
keys[83] = 62;
keys[69] = 63;
keys[68] = 64;
keys[70] = 65; // = F4
keys[84] = 66;
keys[71] = 67;
keys[89] = 68;
keys[72] = 69;
keys[85] = 70;
keys[74] = 71;
keys[75] = 72; // = C5
keys[79] = 73;
keys[76] = 74;
keys[80] = 75;
keys[186] = 76;
keys[222] = 77; // = F5
keys[221] = 78;
keys[13] = 79;
keys[220] = 80;
*/

//Lower row: zsxdcvgbhnjm...
keys[16] = 41; // = F2
keys[65] = 42;
keys[90] = 43;
keys[83] = 44;
keys[88] = 45;
keys[68] = 46;
keys[67] = 47;
keys[86] = 48; // = C3
keys[71] = 49;
keys[66] = 50;
keys[72] = 51;
keys[78] = 52;
keys[77] = 53; // = F3
keys[75] = 54;
keys[188] = 55;
keys[76] = 56;
keys[190] = 57;
keys[186] = 58;
keys[191] = 59;

// Upper row: q2w3er5t6y7u...
keys[81] = 60; // = C4 ("middle C")
keys[50] = 61;
keys[87] = 62;
keys[51] = 63;
keys[69] = 64;
keys[82] = 65; // = F4
keys[53] = 66;
keys[84] = 67;
keys[54] = 68;
keys[89] = 69;
keys[55] = 70;
keys[85] = 71;
keys[73] = 72; // = C5
keys[57] = 73;
keys[79] = 74;
keys[48] = 75;
keys[80] = 76;
keys[219] = 77; // = F5
keys[187] = 78;
keys[221] = 79;
keys[220] = 80;

var effectChain = null;
var waveshaper = null;
var volNode = null;
var revNode = null;
var revGain = null;
var revBypassGain = null;
var compressor = null;

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function noteOn( note, velocity ) {
	console.log("note on: " , note, velocity );
	if (voices[note] == null) {
		// Create a new synth node
		voices[note] = new Voice(note, velocity);
		var e = document.getElementById( "k" + note );
		if (e)
			e.classList.add("pressed");
	}
}

function noteOff( note ) {
	if (voices[note] != null) {
		// Shut off the note playing and clear it 
		voices[note].noteOff();
		voices[note] = null;
		var e = document.getElementById( "k" + note );
		if (e)
			e.classList.remove("pressed");
	}

}

function $(id) {
	return document.getElementById(id);
}

// 'value' is normalized to 0..1.
function controller( number, value ) {
	switch(number) {
	case 2:
		$("fFreq").setRatioValue(value);
		onUpdateFilterCutoff( 100*value );
		return;
	case 0x0a:
	case 7:
		$("fQ").setValue(20*value);
		onUpdateFilterQ( 20*value );
		return;
	case 1:
		$("fMod").setValue(100*value);
		onUpdateFilterMod(100*value);	
		return;
	case 0x49:
	case 5:
	case 15:
	    $("drive").setValue(100 * value);
	    onUpdateDrive( 100 * value );
	    return;
	case 0x48:
	case 6:
	case 16:
	    $("reverb").setValue(100 * value);
	    onUpdateReverb( 100 * value );
	    return;
	case 0x4a:
	    $("modOsc1").setValue(100 * value);
	    onUpdateModOsc1( 100 * value );
	    return;
	case 0x47:
	    $("modOsc2").setValue(100 * value);
	    onUpdateModOsc2( 100 * value );
	    return;
	case 4:
	case 17:
	    $("mFreq").setValue(10 * value);
	    onUpdateModFrequency( 10 * value );
	    return;
	case 0x5b:
	    $("volume").setValue(100 * value);
	    onUpdateVolume( 100 * value );
	    return;
	case 33: // "x1" button
	case 51:
		moDouble = (value > 0);
		changeModMultiplier();
	    return;
	case 34: // "x2" button
	case 52:
		moQuadruple = (value > 0);
		changeModMultiplier();
	    return;
	}
}

var currentPitchWheel = 0.0;
// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
	var i;

	currentPitchWheel = value;
	for (var i=0; i<255; i++) {
		if (voices[i]) {
			if (voices[i].osc1)
				voices[i].osc1.detune.value = currentOsc1Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
			if (voices[i].osc2)
				voices[i].osc2.detune.value = currentOsc2Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.
		}
	}
}

function polyPressure( noteNumber, value ) {
	if (voices[noteNumber] != null) {
		voices[noteNumber].setFilterQ( value*20 );
	}
}

var waveforms = ["sine","square","sawtooth","triangle"];

function onUpdateModWaveform( ev ) {
	currentModWaveform = ev.target.selectedIndex;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setModWaveform( waveforms[currentModWaveform] );
		}
	}
}

function onUpdateModFrequency( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentModFrequency = value;
	var oscFreq = currentModFrequency * modOscFreqMultiplier;

  //console.log("modfreq>>>", value, "->", oscFreq);

	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModFrequency( oscFreq );
		}
	}
}

function onUpdateModOsc1( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentModOsc1 = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModOsc1( currentModOsc1 );
		}
	}
}

function onUpdateModOsc2( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentModOsc2 = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateModOsc2( currentModOsc2 );
		}
	}
}

function onUpdateFilterCutoff( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
//	console.log( "currentFilterCutoff= " + currentFilterCutoff + "new cutoff= " + value );
	currentFilterCutoff = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterCutoff( value );
		}
	}

  console.log("onUpdateFilterCutoff>>", "value:", value, "currentFilterCutoff:", currentFilterCutoff);

}

function onUpdateFilterQ( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentFilterQ = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterQ( value );
		}
	}

  console.log("onUpdateFilterQ>>", "value:", value, "currentFilterQ:", currentFilterQ);
}

function onUpdateFilterMod( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentFilterMod = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setFilterMod( value );
		}
	}

  console.log("onUpdateFilterMod>>", "value:", value, "currentFilterMod:", currentFilterMod);
}

function onUpdateFilterEnv( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	currentFilterEnv = value;

  console.log("onUpdateFilterEnv>>", "value:", value, "currentFilterEnv:", currentFilterEnv);
}

function onUpdateOsc1Wave( ev ) {
	currentOsc1Waveform = ev.target.selectedIndex;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setOsc1Waveform( waveforms[currentOsc1Waveform] );
		}
	}

  console.log("onUpdateOsc1Wave>>", "currentOsc1Waveform:", currentOsc1Waveform);
}

function onUpdateOsc1Octave( ev ) {
	currentOsc1Octave = ev.target.selectedIndex;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Frequency();
		}
	}

  console.log("onUpdateOsc1Octave>>", "currentOsc1Octave:", currentOsc1Octave);
}

function onUpdateOsc1Detune( value ) {
	//var value = ev.currentTarget.value;
	currentOsc1Detune = ( value.currentTarget ? value.currentTarget.value : value );
	//currentOsc1Detune = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Frequency();
		}
	}

  console.log("onUpdateOsc1Detune>>", "value:", value, "currentOsc1Detune:", currentOsc1Detune);
}

function onUpdateOsc1Mix( value ) {
	if (value.currentTarget)
		value = value.currentTarget.value;
	currentOsc1Mix = value;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc1Mix( value );
		}
	}

  console.log("onUpdateOsc1Mix>>", "value:", value, "currentOsc1Mix:", currentOsc1Mix);
}

function onUpdateOsc2Wave( value ) {
	//currentOsc2Waveform = ev.target.selectedIndex;
	currentOsc2Waveform = ( value.target ? value.target.selectedIndex : value );
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].setOsc2Waveform( waveforms[currentOsc2Waveform] );
		}
	}

  console.log("onUpdateOsc2Wave>>", "currentOsc2Waveform:", currentOsc2Waveform);
}

function onUpdateOsc2Octave( ev ) {
	currentOsc2Octave = ev.target.selectedIndex;
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc2Frequency();
		}
	}

  console.log("onUpdateOsc2Octave>>", "currentOsc2Octave:", currentOsc2Octave);
}

function onUpdateOsc2Detune( value ) {
	//var value = ev.currentTarget.value;
	currentOsc2Detune = ( value.currentTarget ? value.currentTarget.value : value );
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			voices[i].updateOsc2Frequency();
		}
	}

  console.log("onUpdateOsc2Detune>>", "value:", value, "currentOsc2Detune:", currentOsc2Detune);
}

function onUpdateOsc2Mix( value ) {
	//var value = ev.currentTarget.value;
	currentOsc2Mix = ( value.currentTarget ? value.currentTarget.value : value );
	for (var i=0; i<255; i++) {
		if (voices[i] != null) {
			//voices[i].updateOsc2Mix( value );
			voices[i].updateOsc2Mix( currentOsc2Mix );
		}
	}

  console.log("onUpdateOsc2Mix>>", "value:", value, "currentOsc2Mix", currentOsc2Mix);
}

function onUpdateEnvA( value ) {
	//currentEnvA = ev.currentTarget.value;
	currentEnvA = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateEnvA>>", currentEnvA);
}

function onUpdateEnvD( value ) {
	//currentEnvD = ev.currentTarget.value;
	currentEnvD = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateEnvD>>", currentEnvD);
}

function onUpdateEnvS( value ) {
	//currentEnvS = ev.currentTarget.value;
	currentEnvS = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateEnvS>>", currentEnvS);
}

function onUpdateEnvR( value ) {
	//currentEnvR = ev.currentTarget.value;
	currentEnvR = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateEnvR>>", currentEnvR);
}

function onUpdateFilterEnvA( value ) {
	//currentFilterEnvA = ev.currentTarget.value;
	currentFilterEnvA = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateFilterEnvA>>", currentFilterEnvA);
}

function onUpdateFilterEnvD( value ) {
	//currentFilterEnvD = ev.currentTarget.value;
	currentFilterEnvD = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateFilterEnvD>>", currentFilterEnvD);
}

function onUpdateFilterEnvS( value ) {
	//currentFilterEnvS = ev.currentTarget.value;
	currentFilterEnvS = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateFilterEnvS>>", currentFilterEnvS);
}

function onUpdateFilterEnvR( value ) {
	//currentFilterEnvR = ev.currentTarget.value;
	currentFilterEnvR = (value.currentTarget ? value.currentTarget.value : value );

  console.log("onUpdateFilterEnvR>>", currentFilterEnvR);
}

function onUpdateDrive( ev ) {
  var value = ( ev.target ? ev.target.value : ev );
	currentDrive = value;

  console.log("onUpdateDrive", value, currentDrive);

  waveshaper.setDrive( 0.01 + (currentDrive*currentDrive/500.0) );
}

function onUpdateVolume( ev ) {
	volNode.gain.value = (ev.currentTarget ? ev.currentTarget.value : ev)/100;
}

function onUpdateReverb( ev ) {
	var value = ev.currentTarget ? ev.currentTarget.value : ev;
	value = value/100;

	// equal-power crossfade
	var gain1 = Math.cos(value * 0.5*Math.PI);
	var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

	revBypassGain.gain.value = gain1;
	revGain.gain.value = gain2;
}

/*
var FOURIER_SIZE = 2048;
var wave = false;

	if ( wave ) {
		var real = new Float32Array(FOURIER_SIZE);
		var imag = new Float32Array(FOURIER_SIZE);
		real[0] = 0.0;
		imag[0] = 0.0;

		for (var i=1; i<FOURIER_SIZE; i++) {
			real[i]=1.0;
			imag[i]=1.0;
		}

		var wavetable = audioContext.createWaveTable(real, imag);
		oscillatorNode.setWaveTable(wavetable);
	} else {

*/

function filterFrequencyFromCutoff( pitch, cutoff ) {
    var nyquist = 0.5 * audioContext.sampleRate;

//    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
    if (filterFrequency > nyquist)
        filterFrequency = nyquist;
	return filterFrequency;
}

function randomizeInputs() {

  var ui = true;
  var wf_idx = 0, idx=0;
  var ev = {};
  var freq = 0, val = 0;
  var ele = {};
  var intervals0 = ["32'", "16'", "8'"];
  var intervals1 = ["16'", "8'", "4'"];
  var wfs = [ "sine", "square", "saw", "triangle" ];

  // ---
  // mod
  // ---

  wf_idx = Math.floor(Math.random()*waveforms.length);
  ev = { target : { selectedIndex: wf_idx } };
  onUpdateModWaveform(ev);
  if (ui) {
    ele = document.getElementById("modwave");
    ele.value = wfs[wf_idx];
    //$("modwave").setValue(wf_idx);
  }

  freq = Math.random()*10;
  onUpdateModFrequency( freq );
  if (ui) { $("mFreq").setValue(freq); }

  freq = Math.random()*100;
  onUpdateModOsc1( freq );
  if (ui) { $("modOsc1").setValue(freq); }

  freq = Math.random()*100;
  onUpdateModOsc2( freq );
  if (ui) { $("modOsc2").setValue(freq); }

  // ----
  // osc1
  // ----

  wf_idx = Math.floor(Math.random()*waveforms.length);
  onUpdateOsc1Wave( { target : { selectedIndex: wf_idx } } );
  if (ui) {
    ele = document.getElementById("osc1wave");
    ele.value = wfs[wf_idx];
  }

  idx = Math.floor(Math.random()*intervals0.length);
  onUpdateOsc1Octave( { target: { selectedIndex: idx } } );
  if (ui) {
    ele = document.getElementById("osc1int");
    ele.value = intervals0[idx];
  }

  freq = (2*(Math.random()-0.5))*1200;
  onUpdateOsc1Detune( freq );
  if (ui) { $("osc1detune").setValue(freq); }

  freq = Math.random()*100;
  onUpdateOsc1Mix( freq );
  if (ui) { $("osc1mix").setValue(freq); }

  // ----
  // osc2
  // ----

  wf_idx = Math.floor(Math.random()*waveforms.length);
  onUpdateOsc2Wave( { target : { selectedIndex: wf_idx } } );
  if (ui) {
    ele = document.getElementById("osc2wave");
    ele.value = wfs[wf_idx];
  }

  idx = Math.floor(Math.random()*intervals1.length);
  onUpdateOsc2Octave( { target: { selectedIndex: idx } } );
  if (ui) {
    ele = document.getElementById("osc2int");
    ele.value = intervals1[idx];
  }

  freq = (2*(Math.random()-0.5))*1200;
  onUpdateOsc2Detune( freq );
  if (ui) { $("osc2detune").setValue(freq); }

  freq = Math.random()*100;
  onUpdateOsc2Mix( freq );
  if (ui) { $("osc2mix").setValue(freq); }

  // ------
  // filter
  // ------

  var m = Math.log(20)/Math.log(2);
  var M = Math.log(20000)/Math.log(2);
  var dm = M-m;
  var lval = m + (Math.random()*dm);
  val = Math.pow(2, lval);
  onUpdateFilterCutoff(lval);
  if (ui) { $("fFreq").setValue(lval); }

  val = Math.random()*20;
  onUpdateFilterQ(val);
  if (ui) { $("fQ").setValue(val); }

  val = Math.random()*100;
  onUpdateFilterMod(val);
  if (ui) { $("fMod").setValue(val); }

  val = Math.random()*100;
  onUpdateFilterEnv(val);
  if (ui) { $("fEnv").setValue(val); }

  // ---------
  // filterEnv
  // ---------

  val = Math.random()*100;
  onUpdateFilterEnvA(val);
  if (ui) { $("fA").setValue(val); }

  val = Math.random()*100;
  onUpdateFilterEnvD(val);
  if (ui) { $("fD").setValue(val); }

  val = Math.random()*100;
  onUpdateFilterEnvS(val);
  if (ui) { $("fS").setValue(val); }

  val = Math.random()*100;
  onUpdateFilterEnvR(val);
  if (ui) { $("fR").setValue(val); }

  // ---------
  // valumeEnv
  // ---------

  val = Math.random()*100;
  onUpdateEnvA(val);
  if (ui) { $("vA").setValue(val); }

  val = Math.random()*100;
  onUpdateEnvD(val);
  if (ui) { $("vD").setValue(val); }

  val = Math.random()*100;
  onUpdateEnvS(val);
  if (ui) { $("vS").setValue(val); }

  val = Math.random()*100;
  onUpdateEnvR(val);
  if (ui) { $("vR").setValue(val); }

  // ------
  // master
  // ------

  val = Math.random()*100;
  onUpdateDrive(val);
  if (ui) { $("drive").setValue(val); }

  val = Math.random()*100;
  onUpdateReverb(val);
  if (ui) { $("reverb").setValue(val); }

  // unnecessary...
  //val = Math.random()*100;
  //onUpdateVolume(val);
  //if (ui) { $("volume").setValue(val); }


}

function Voice( note, velocity ) {
	this.originalFrequency = frequencyFromNoteNumber( note );

	// create osc 1
	this.osc1 = audioContext.createOscillator();
	this.updateOsc1Frequency();
	this.osc1.type = waveforms[currentOsc1Waveform];

	this.osc1Gain = audioContext.createGain();
	this.osc1Gain.gain.value = 0.005 * currentOsc1Mix;
//	this.osc1Gain.gain.value = 0.05 + (0.33 * velocity);
	this.osc1.connect( this.osc1Gain );

	// create osc 2
	this.osc2 = audioContext.createOscillator();
	this.updateOsc2Frequency();
	this.osc2.type = waveforms[currentOsc2Waveform];

	this.osc2Gain = audioContext.createGain();
	this.osc2Gain.gain.value = 0.005 * currentOsc2Mix;
//	this.osc2Gain.gain.value = 0.05 + (0.33 * velocity);
	this.osc2.connect( this.osc2Gain );

	// create modulator osc
	this.modOsc = audioContext.createOscillator();
	this.modOsc.type = 	waveforms[currentModWaveform];
	this.modOsc.frequency.value = currentModFrequency * modOscFreqMultiplier;

	this.modOsc1Gain = audioContext.createGain();
	this.modOsc.connect( this.modOsc1Gain );
	this.modOsc1Gain.gain.value = currentModOsc1/10;
	this.modOsc1Gain.connect( this.osc1.frequency );	// tremolo

	this.modOsc2Gain = audioContext.createGain();
	this.modOsc.connect( this.modOsc2Gain );
	this.modOsc2Gain.gain.value = currentModOsc2/10;
	this.modOsc2Gain.connect( this.osc2.frequency );	// tremolo

	// create the LP filter
	this.filter1 = audioContext.createBiquadFilter();
	this.filter1.type = "lowpass";
	this.filter1.Q.value = currentFilterQ;
	this.filter1.frequency.value = Math.pow(2, currentFilterCutoff); 
	// filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff );
//	console.log( "filter frequency: " + this.filter1.frequency.value);
	this.filter2 = audioContext.createBiquadFilter();
	this.filter2.type = "lowpass";
	this.filter2.Q.value = currentFilterQ;
	this.filter2.frequency.value = Math.pow(2, currentFilterCutoff); 

	this.osc1Gain.connect( this.filter1 );
	this.osc2Gain.connect( this.filter1 );
	this.filter1.connect( this.filter2 );

	// connect the modulator to the filters
	this.modFilterGain = audioContext.createGain();
	this.modOsc.connect( this.modFilterGain );
	this.modFilterGain.gain.value = currentFilterMod*24;
//	console.log("modFilterGain=" + currentFilterMod*24);
	this.modFilterGain.connect( this.filter1.detune );	// filter tremolo
	this.modFilterGain.connect( this.filter2.detune );	// filter tremolo

	// create the volume envelope
	this.envelope = audioContext.createGain();
	this.filter2.connect( this.envelope );
	this.envelope.connect( effectChain );

	// set up the volume and filter envelopes
	var now = audioContext.currentTime;
	var envAttackEnd = now + (currentEnvA/20.0);

	this.envelope.gain.value = 0.0;
	this.envelope.gain.setValueAtTime( 0.0, now );
	this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
	this.envelope.gain.setTargetAtTime( (currentEnvS/100.0), envAttackEnd, (currentEnvD/100.0)+0.001 );

	var filterAttackLevel = currentFilterEnv*72;  // Range: 0-7200: 6-octave range
	var filterSustainLevel = filterAttackLevel* currentFilterEnvS / 100.0; // range: 0-7200
	var filterAttackEnd = (currentFilterEnvA/20.0);

/*	console.log( "filterAttackLevel: " + filterAttackLevel + 
				 " filterSustainLevel: " + filterSustainLevel +
				 " filterAttackEnd: " + filterAttackEnd);
*/
	if (!filterAttackEnd) 
				filterAttackEnd=0.05; // tweak to get target decay to work properly
	this.filter1.detune.setValueAtTime( 0, now );
	this.filter1.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );
	this.filter2.detune.setValueAtTime( 0, now );
	this.filter2.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );

  console.log("DEBUG0>>>", filterSustainLevel, now+filterAttackEnd, (currentFilterEnvD/100.0) );
  var end_d = (currentFilterEnvD/100.0);
  if (end_d<1) { end_d = 1; }

	//this.filter1.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (currentFilterEnvD/100.0) );
	//this.filter2.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (currentFilterEnvD/100.0) );

	this.filter1.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, end_d );
	this.filter2.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, end_d );

	this.osc1.start(0);
	this.osc2.start(0);
	this.modOsc.start(0);
}


Voice.prototype.setModWaveform = function( value ) {
	this.modOsc.type = value;
}

Voice.prototype.updateModFrequency = function( value ) {
	this.modOsc.frequency.value = value;
}

Voice.prototype.updateModOsc1 = function( value ) {
	this.modOsc1Gain.gain.value = value/10;
}

Voice.prototype.updateModOsc2 = function( value ) {
	this.modOsc2Gain.gain.value = value/10;
}

Voice.prototype.setOsc1Waveform = function( value ) {
	this.osc1.type = value;
}

Voice.prototype.updateOsc1Frequency = function( value ) {

  console.log("updateOsc1Frequency>>>", "val", value, "oct", currentOsc1Octave, "dtune", currentOsc1Detune, "wheel", currentPitchWheel);

	this.osc1.frequency.value = (this.originalFrequency*Math.pow(2,currentOsc1Octave-2));  // -2 because osc1 is 32', 16', 8'
	this.osc1.detune.value = currentOsc1Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.

  console.log("osc1 freq", this.osc1.frequency.value);
}

Voice.prototype.updateOsc1Mix = function( value ) {
	this.osc1Gain.gain.value = 0.005 * value;
}

Voice.prototype.setOsc2Waveform = function( value ) {
	this.osc2.type = value;
}

Voice.prototype.updateOsc2Frequency = function( value ) {
	this.osc2.frequency.value = (this.originalFrequency*Math.pow(2,currentOsc2Octave-1));
	this.osc2.detune.value = currentOsc2Detune + currentPitchWheel * 500;	// value in cents - detune major fifth.

  console.log("osc2 freq", this.osc2.frequency.value);

}

Voice.prototype.updateOsc2Mix = function( value ) {

  console.log("updateOsc2Mix>>>", value);

	this.osc2Gain.gain.value = 0.005 * value;
}

Voice.prototype.setFilterCutoff = function( value ) {
	var now =  audioContext.currentTime;
	var filterFrequency = Math.pow(2, value);
//	console.log("Filter cutoff: orig:" + this.filter1.frequency.value + " new:" + filterFrequency + " value: " + value );
	this.filter1.frequency.value = filterFrequency;
	this.filter2.frequency.value = filterFrequency;
}

Voice.prototype.setFilterQ = function( value ) {
	this.filter1.Q.value = value;
	this.filter2.Q.value = value;
}

Voice.prototype.setFilterMod = function( value ) {
	this.modFilterGain.gain.value = currentFilterMod*24;
//	console.log( "filterMod.gain=" + currentFilterMod*24);
}

Voice.prototype.noteOff = function() {
	var now =  audioContext.currentTime;
	var release = now + (currentEnvR/10.0);	
    var initFilter = filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff/100 * (1.0-(currentFilterEnv/100.0)) );

//    console.log("noteoff: now: " + now + " val: " + this.filter1.frequency.value + " initF: " + initFilter + " fR: " + currentFilterEnvR/100 );
	this.envelope.gain.cancelScheduledValues(now);
	this.envelope.gain.setValueAtTime( this.envelope.gain.value, now );  // this is necessary because of the linear ramp

  var env_r = (currentFilterEnvR/100.0);
  if (env_r < 1) { env_r = 1.0; }


	//this.envelope.gain.setTargetAtTime(0.0, now, (currentEnvR/100));
	this.envelope.gain.setTargetAtTime(0.0, now, env_r);
	this.filter1.detune.cancelScheduledValues(now);

	//this.filter1.detune.setTargetAtTime( 0, now, (currentFilterEnvR/100.0) );
	this.filter1.detune.setTargetAtTime( 0, now, env_r);
	this.filter2.detune.cancelScheduledValues(now);
	//this.filter2.detune.setTargetAtTime( 0, now, (currentFilterEnvR/100.0) );
	this.filter2.detune.setTargetAtTime( 0, now, env_r);

	this.osc1.stop( release );
	this.osc2.stop( release );
}

var currentOctave = 3;
var modOscFreqMultiplier = 1;
var moDouble = false;
var moQuadruple = false;

function changeModMultiplier() {
	modOscFreqMultiplier = (moDouble?2:1)*(moQuadruple?4:1);
	onUpdateModFrequency( currentModFrequency );
}

function keyDown( ev ) {
	if ((ev.keyCode==49)||(ev.keyCode==50)) {
		if (ev.keyCode==49)
			moDouble = true;
		else if (ev.keyCode==50)
			moQuadruple = true;
		changeModMultiplier();
	}

	var note = keys[ev.keyCode];
	if (note)
		noteOn( note + 12*(3-currentOctave), 0.75 );
	console.log( "key down: " + ev.keyCode );

	return false;
}

function keyUp( ev ) {
	if ((ev.keyCode==49)||(ev.keyCode==50)) {
		if (ev.keyCode==49)
			moDouble = false;
		else if (ev.keyCode==50)
			moQuadruple = false;
		changeModMultiplier();
	}

	var note = keys[ev.keyCode];
	if (note)
		noteOff( note + 12*(3-currentOctave) );
//	console.log( "key up: " + ev.keyCode );

	return false;
}

function playNote(inote) {
  var velocity = 0.75;
  // 12 * -3 = -36
  // 12 *  3 =  36
  // 41 - 36 = 5
  //

  console.log("????", inote, velocity);

  noteOn( inote + 12*(3-currentOctave), velocity );
}

function stopNote(inote) {
  noteOff( inote + 12*(3-currentOctave) );
}

var pointers=[];

function touchstart( ev ) {
	for (var i=0; i<ev.targetTouches.length; i++) {
	    var touch = ev.targetTouches[0];
		var element = touch.target;

		var note = parseInt( element.id.substring( 1 ) );
		console.log( "touchstart: id: " + element.id + "identifier: " + touch.identifier + " note:" + note );
		if (!isNaN(note)) {
			noteOn( note + 12*(3-currentOctave), 0.75 );
			var keybox = document.getElementById("keybox")
			pointers[touch.identifier]=note;
		}
	}
	ev.preventDefault();
}

function touchmove( ev ) {
	for (var i=0; i<ev.targetTouches.length; i++) {
	    var touch = ev.targetTouches[0];
		var element = touch.target;

		var note = parseInt( element.id.substring( 1 ) );
		console.log( "touchmove: id: " + element.id + "identifier: " + touch.identifier + " note:" + note );
		if (!isNaN(note) && pointers[touch.identifier] && pointers[touch.identifier]!=note) {
			noteOff(pointers[touch.identifier] + 12*(3-currentOctave));
			noteOn( note + 12*(3-currentOctave), 0.75 );
			var keybox = document.getElementById("keybox")
			pointers[touch.identifier]=note;
		}
	}
	ev.preventDefault();
}

function touchend( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	console.log( "touchend: id: " + ev.target.id + " note:" + note );
	if (note != NaN)
		noteOff( note + 12*(3-currentOctave) );
	pointers[ev.pointerId]=null;
	var keybox = document.getElementById("keybox")
	ev.preventDefault();
}

function touchcancel( ev ) {
	console.log( "touchcancel" );
	ev.preventDefault();
}

function pointerDown( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	if (pointerDebugging)
		console.log( "pointer down: id: " + ev.pointerId
			+ " target: " + ev.target.id + " note:" + note );
	if (!isNaN(note)) {
		noteOn( note + 12*(3-currentOctave), 0.75 );
		var keybox = document.getElementById("keybox")
		pointers[ev.pointerId]=note;
	}
	ev.preventDefault();
}

function pointerMove( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	if (pointerDebugging)
		console.log( "pointer move: id: " + ev.pointerId 
			+ " target: " + ev.target.id + " note:" + note );
	if (!isNaN(note) && pointers[ev.pointerId] && pointers[ev.pointerId]!=note) {
		if (pointers[ev.pointerId])
			noteOff(pointers[ev.pointerId] + 12*(3-currentOctave));
		noteOn( note + 12*(3-currentOctave), 0.75 );
		pointers[ev.pointerId]=note;
	}
	ev.preventDefault();
}

function pointerUp( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	if (pointerDebugging)
		console.log( "pointer up: id: " + ev.pointerId + " note:" + note );
	if (note != NaN)
		noteOff( note + 12*(3-currentOctave) );
	pointers[ev.pointerId]=null;
	var keybox = document.getElementById("keybox")
	ev.preventDefault();
}


function onChangeOctave( ev ) {
	currentOctave = ev.target.selectedIndex;
}


function initAudio() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	try {
    	audioContext = new AudioContext();
  	}
  	catch(e) {
    	alert('The Web Audio API is apparently not supported in this browser.');
  	}

	window.addEventListener('keydown', keyDown, false);
	window.addEventListener('keyup', keyUp, false);
	setupSynthUI();

	isMobile = (navigator.userAgent.indexOf("Android")!=-1)||(navigator.userAgent.indexOf("iPad")!=-1)||(navigator.userAgent.indexOf("iPhone")!=-1);

	// set up the master effects chain for all voices to connect to.
	effectChain = audioContext.createGain();
	waveshaper = new WaveShaper( audioContext );
    effectChain.connect( waveshaper.input );
    onUpdateDrive( currentDrive );

    if (!isMobile)
    	revNode = audioContext.createConvolver();
    else
    	revNode = audioContext.createGain();
	revGain = audioContext.createGain();
	revBypassGain = audioContext.createGain();

    volNode = audioContext.createGain();
    volNode.gain.value = currentVol;
    compressor = audioContext.createDynamicsCompressor();
    waveshaper.output.connect( revNode );
    waveshaper.output.connect( revBypassGain );
    revNode.connect( revGain );
    revGain.connect( volNode );
    revBypassGain.connect( volNode );
    onUpdateReverb( {currentTarget:{value:currentRev}} );

    volNode.connect( compressor );
    compressor.connect(	audioContext.destination );
    onUpdateVolume( {currentTarget:{value:currentVol}} );

    if (!isMobile) {
	  	var irRRequest = new XMLHttpRequest();
		irRRequest.open("GET", "sounds/irRoom.wav", true);
		irRRequest.responseType = "arraybuffer";
		irRRequest.onload = function() {
	  		audioContext.decodeAudioData( irRRequest.response, 
	  			function(buffer) { if (revNode) revNode.buffer = buffer; else console.log("no revNode ready!")} );
		}
		irRRequest.send();
	}

}

var gTune = { tune: [], idx:0, loop:false, chords:{}, arpeggio:{}, dur: 250 };
var prev_dt = null;

function playTune_cb() {
  var n = gTune.tune.length;
  var idx = gTune.idx;
  var dt = Date.now();

  if (prev_dt) {
    console.log(">>", dt - prev_dt);
  }
  prev_dt = dt;

  for (var prev_note in gTune.prev_note) {
    stopNote(parseInt(prev_note));
  }

  if (idx>=n) { return; }

  var notes = {};
  for (var ii=0; ii<gTune.tune[idx].length; ii++) {
    var chord_name = gTune.tune[idx][ii];

    if (!(chord_name in gTune.chords)) { continue; }

    for (var jj=0; jj<gTune.chords[chord_name].length; jj++) {
      notes[ gTune.chords[chord_name][jj] ] = true;
    }

  }
  var a_n = gTune.arpeggio["lydian"].length;
  notes[ gTune.arpeggio["lydian"][idx%a_n] ] = true;


  for (var local_note in notes) {
    console.log("playing", local_note);
    playNote(parseInt(local_note));
  }

  gTune.prev_note = notes;


  gTune.idx++;
  setTimeout(playTune_cb, gTune.dur);
}

function playTune(tune, ref_note, dur) {
  ref_note = ((typeof ref_note === "undefined") ? 60 : ref_note);
  dur = ((typeof dur === "undefined") ? (1000*(1/4)) : dur );
  var R = ref_note;
  var chords = {
    "i" :   [R,     R+4,  R+7],
    "ii":   [R+2,   R+5,  R+9],
    "iii":  [R+4,   R+7,  R+11],
    "iv":   [R+5,   R+9,  R+12],
    "v":    [R+7,   R+11, R+14],
    "vi":   [R+9,   R+12, R+16],
    "vii":  [R+11,  R+14, R+17]
  };


  var arpeggio = {
    "lydian" :      [R, R+2, R+4, R+6, R+7, R+9, R+11],
    "ionian" :      [R, R+2, R+4, R+5, R+7, R+9, R+11],
    "mixolydian" :  [R, R+2, R+4, R+5, R+7, R+9, R+10],
    "dorian" :      [R, R+2, R+3, R+5, R+7, R+9, R+10],
    "aelian" :      [R, R+2, R+3, R+5, R+7, R+8, R+10],
    "phrygian" :    [R, R+1, R+3, R+5, R+7, R+8, R+10],
    "locrian" :     [R, R+1, R+3, R+5, R+6, R+8, R+10],
    "melodic" :     [R, R+2, R+3, R+5, R+7, R+9, R+11],
    "harmonic" :    [R, R+2, R+3, R+5, R+7, R+8, R+11],
  };

  gTune.idx = 0;
  gTune.tune = tune;
  gTune.chords = chords;
  gTune.arpeggio = arpeggio;
  gTune.dur = dur;
  gTune.dur = 500;
  playTune_cb();

}

if('serviceWorker' in navigator) {  
  navigator.serviceWorker  
           .register('./service-worker.js')  
           .then(function() { console.log('Service Worker Registered'); });  
}
window.onload=initAudio;
