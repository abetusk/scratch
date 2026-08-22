(function(){
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // ---------- MASTER ----------
  let masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(audioCtx.destination);

  // ---------- REVERB ----------
  let reverbNode = null;
  function createReverb(decay = 1.0, wet = 0.2) {
    if (reverbNode) {
      try { 
        reverbNode.convolver.disconnect();
        reverbNode.wetGain.disconnect();
        reverbNode.dryGain.disconnect();
      } catch(e) {}
    }
    const convolver = audioCtx.createConvolver();
    const length = audioCtx.sampleRate * decay;
    const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const env = Math.exp(-i / (audioCtx.sampleRate * decay * 0.7));
        data[i] = (Math.random() * 2 - 1) * env * 0.8;
      }
    }
    convolver.buffer = impulse;
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = wet;
    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 1 - wet;
    convolver.connect(wetGain);
    wetGain.connect(masterGain);
    dryGain.connect(masterGain);
    reverbNode = { convolver, wetGain, dryGain };
    return reverbNode;
  }
  let reverb = createReverb(1.0, 0.2);

  document.getElementById('reverbWet').addEventListener('input', (e) => {
    if (reverb) {
      reverb.wetGain.gain.value = parseFloat(e.target.value);
      reverb.dryGain.gain.value = 1 - parseFloat(e.target.value);
    }
  });
  document.getElementById('reverbDecay').addEventListener('input', (e) => {
    const decay = parseFloat(e.target.value);
    const wet = parseFloat(document.getElementById('reverbWet').value);
    const newReverb = createReverb(decay, wet);
    if (filterADSR) {
      filterADSR.disconnect();
      filterADSR.connect(newReverb.convolver);
    }
    reverb = newReverb;
    if (reverbLfoGain) {
      reverbLfoGain.disconnect();
      reverbLfoGain.connect(reverb.wetGain.gain);
    }
  });

  document.getElementById('masterVolume').addEventListener('input', (e) => {
    masterGain.gain.value = parseFloat(e.target.value);
  });

  // ---------- FILTER ----------
  let filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 2000;
  filterNode.Q.value = 1.2;

  let filterADSR = audioCtx.createGain();
  filterADSR.gain.value = 0.001;
  filterNode.connect(filterADSR);
  filterADSR.connect(reverb.convolver);

  let gainEnvelope = audioCtx.createGain();
  gainEnvelope.gain.value = 0.001;
  gainEnvelope.connect(filterNode);

  // ---------- OSCILLATORS (3) ----------
  const oscData = [];
  const oscContainer = document.getElementById('oscContainer');

  function buildOscCard(index) {
    const card = document.createElement('div');
    card.className = 'osc-card';
    card.innerHTML = `
      <h3>OSC ${index+1} <span class="lfo-badge">⚡ LFO</span></h3>
      <div class="control-row">
        <label>wave</label>
        <select class="oscWave">
          <option value="sine">sine</option>
          <option value="square">square</option>
          <option value="sawtooth">sawtooth</option>
          <option value="triangle" selected>triangle</option>
        </select>
        <label>detune</label>
        <input type="range" class="oscDetune" min="-50" max="50" step="0.5" value="${(index-1)*12}">
      </div>
      <div class="control-row">
        <label>vol</label>
        <input type="range" class="oscVolume" min="0" max="1" step="0.05" value="${0.3 + index*0.05}">
        <label>LFO rate</label>
        <input type="range" class="lfoRate" min="0.0" max="12" step="0.1" value="${3.0 + index*0.5}">
        <label>depth</label>
        <input type="range" class="lfoDepth" min="0" max="1" step="0.02" value="${0.2 + index*0.1}">
      </div>
    `;
    return card;
  }

  for (let i = 0; i < 3; i++) {
    const card = buildOscCard(i);
    oscContainer.appendChild(card);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.3 + i*0.05;
    osc.type = 'triangle';
    osc.frequency.value = 440;
    osc.detune.value = (i-1)*12;

    const lfoOsc = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.2 + i*0.1;
    //lfoOsc.frequency.value = 3.0 + i*0.5;
    lfoOsc.frequency.value = 0.0 + i*0.5;
    lfoOsc.type = 'sine';

    lfoOsc.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const data = {
      osc, gain, lfoOsc, lfoGain,
      waveSelect: card.querySelector('.oscWave'),
      detuneRange: card.querySelector('.oscDetune'),
      oscVolume: card.querySelector('.oscVolume'),
      lfoRate: card.querySelector('.lfoRate'),
      lfoDepth: card.querySelector('.lfoDepth')
    };

    osc.connect(gain);
    gain.connect(gainEnvelope);
    osc.start();
    lfoOsc.start();

    data.waveSelect.addEventListener('change', () => { data.osc.type = data.waveSelect.value; });
    data.detuneRange.addEventListener('input', () => { data.osc.detune.value = parseFloat(data.detuneRange.value); });
    data.oscVolume.addEventListener('input', () => { data.gain.gain.value = parseFloat(data.oscVolume.value); });
    data.lfoRate.addEventListener('input', () => { data.lfoOsc.frequency.value = parseFloat(data.lfoRate.value); });
    data.lfoDepth.addEventListener('input', () => { data.lfoGain.gain.value = parseFloat(data.lfoDepth.value); });

    oscData.push(data);
  }

  // ---------- LFOs ----------
  const filterLfo = audioCtx.createOscillator();
  const filterLfoGain = audioCtx.createGain();
  filterLfoGain.gain.value = 150;
  filterLfo.frequency.value = 3.2;
  filterLfo.type = 'sine';
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(filterNode.frequency);
  filterLfo.start();

  document.getElementById('filterLfoRate').addEventListener('input', (e) => { filterLfo.frequency.value = parseFloat(e.target.value); });
  document.getElementById('filterLfoDepth').addEventListener('input', (e) => { filterLfoGain.gain.value = parseFloat(e.target.value); });
  document.getElementById('filterLfoWave').addEventListener('change', (e) => { filterLfo.type = e.target.value; });

  const gainLfo = audioCtx.createOscillator();
  const gainLfoGain = audioCtx.createGain();
  gainLfoGain.gain.value = 0.15;
  gainLfo.frequency.value = 2.7;
  gainLfo.type = 'sine';
  gainLfo.connect(gainLfoGain);
  gainLfoGain.connect(gainEnvelope.gain);
  gainLfo.start();

  document.getElementById('gainLfoRate').addEventListener('input', (e) => { gainLfo.frequency.value = parseFloat(e.target.value); });
  document.getElementById('gainLfoDepth').addEventListener('input', (e) => { gainLfoGain.gain.value = parseFloat(e.target.value); });
  document.getElementById('gainLfoWave').addEventListener('change', (e) => { gainLfo.type = e.target.value; });

  const reverbLfo = audioCtx.createOscillator();
  const reverbLfoGain = audioCtx.createGain();
  reverbLfoGain.gain.value = 0.08;
  reverbLfo.frequency.value = 0.6;
  reverbLfo.type = 'sine';
  reverbLfo.connect(reverbLfoGain);
  reverbLfoGain.connect(reverb.wetGain.gain);
  reverbLfo.start();

  document.getElementById('reverbLfoRate').addEventListener('input', (e) => { reverbLfo.frequency.value = parseFloat(e.target.value); });
  document.getElementById('reverbLfoDepth').addEventListener('input', (e) => { reverbLfoGain.gain.value = parseFloat(e.target.value); });
  document.getElementById('reverbLfoWave').addEventListener('change', (e) => { reverbLfo.type = e.target.value; });

  // ---------- ADSR params ----------
  const fAttack = document.getElementById('fAttack');
  const fDecay = document.getElementById('fDecay');
  const fSustain = document.getElementById('fSustain');
  const fRelease = document.getElementById('fRelease');
  const gAttack = document.getElementById('gAttack');
  const gDecay = document.getElementById('gDecay');
  const gSustain = document.getElementById('gSustain');
  const gRelease = document.getElementById('gRelease');

  // ---------- NOTE MANAGEMENT ----------
  let activeNotes = new Map();

  function triggerNote(frequency, velocity = 0.8) {
    if (activeNotes.has(frequency)) return;
    
    const now = audioCtx.currentTime;
    const fA = parseFloat(fAttack.value);
    const fD = parseFloat(fDecay.value);
    const fS = parseFloat(fSustain.value);
    const fR = parseFloat(fRelease.value);
    const gA = parseFloat(gAttack.value);
    const gD = parseFloat(gDecay.value);
    const gS = parseFloat(gSustain.value);
    const gR = parseFloat(gRelease.value);

    const noteGain = audioCtx.createGain();
    noteGain.gain.value = 0.001;
    noteGain.connect(filterNode);

    const noteFilter = audioCtx.createBiquadFilter();
    noteFilter.type = 'lowpass';
    noteFilter.frequency.value = 2000;
    noteFilter.Q.value = 1.2;
    noteGain.connect(noteFilter);

    const noteFilterEnv = audioCtx.createGain();
    noteFilterEnv.gain.value = 0.001;
    noteFilter.connect(noteFilterEnv);
    noteFilterEnv.connect(reverb.convolver);

    const freqMod = audioCtx.createGain();
    freqMod.gain.value = 100;
    freqMod.connect(noteFilter.frequency);

    oscData.forEach(d => {
      d.gain.disconnect();
      d.gain.connect(noteGain);
      d.osc.frequency.value = frequency;
    });

    const gParam = noteGain.gain;
    gParam.cancelScheduledValues(now);
    gParam.setValueAtTime(0.001, now);
    gParam.linearRampToValueAtTime(velocity * 0.8, now + gA);
    gParam.linearRampToValueAtTime(gS * velocity * 0.8, now + gA + gD);

    const fParam = noteFilterEnv.gain;
    fParam.cancelScheduledValues(now);
    fParam.setValueAtTime(0.001, now);
    fParam.linearRampToValueAtTime(1.0, now + fA);
    fParam.linearRampToValueAtTime(fS * 1.0, now + fA + fD);

    const freqParam = freqMod.gain;
    freqParam.cancelScheduledValues(now);
    freqParam.setValueAtTime(100, now);
    freqParam.linearRampToValueAtTime(1800, now + fA);
    freqParam.linearRampToValueAtTime(500 + fS * 1000, now + fA + fD);

    activeNotes.set(frequency, { noteGain, noteFilter, noteFilterEnv, freqMod, gParam, fParam, freqParam, gR, fR });
  }

  function releaseNote(frequency) {
    const note = activeNotes.get(frequency);
    if (!note) return;

    const now = audioCtx.currentTime;
    const { noteGain, noteFilterEnv, freqParam, gR, fR, gParam, fParam } = note;

    gParam.cancelScheduledValues(now);
    gParam.setValueAtTime(gParam.value, now);
    gParam.linearRampToValueAtTime(0.001, now + gR);

    fParam.cancelScheduledValues(now);
    fParam.setValueAtTime(fParam.value, now);
    fParam.linearRampToValueAtTime(0.001, now + fR);

    freqParam.cancelScheduledValues(now);
    freqParam.setValueAtTime(freqParam.value, now);
    freqParam.linearRampToValueAtTime(100, now + fR);

    setTimeout(() => {
      try {
        noteGain.disconnect();
        noteFilter.disconnect();
        noteFilterEnv.disconnect();
        freqMod.disconnect();
        oscData.forEach(d => {
          d.gain.disconnect();
          d.gain.connect(gainEnvelope);
        });
      } catch(e) {}
    }, (Math.max(gR, fR) * 1000) + 100);

    activeNotes.delete(frequency);
  }

  function panic() {
    activeNotes.forEach((_, freq) => releaseNote(freq));
  }
  document.getElementById('panicBtn').addEventListener('click', panic);

  // ---------- KEYBOARD ----------
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFreq = 261.63;
  const keyboardEl = document.getElementById('keyboard');

  for (let octave = 3; octave <= 6; octave++) {
    for (let i = 0; i < 12; i++) {
      const freq = baseFreq * Math.pow(2, (octave - 4) + (i / 12));
      const isBlack = notes[i].includes('#');
      const key = document.createElement('div');
      key.className = `key${isBlack ? ' black' : ''}`;
      key.dataset.freq = freq;
      key.textContent = notes[i] + octave;
      
      key.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        key.classList.add('active');
        triggerNote(parseFloat(key.dataset.freq), 0.8);
        if (isRecording) {
          recordedNotes.push({ freq: parseFloat(key.dataset.freq), time: performance.now() - recordStart });
        }
      });
      key.addEventListener('mouseup', (e) => {
        e.preventDefault();
        key.classList.remove('active');
        releaseNote(parseFloat(key.dataset.freq));
      });
      key.addEventListener('mouseleave', () => {
        key.classList.remove('active');
        releaseNote(parseFloat(key.dataset.freq));
      });
      key.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        key.classList.add('active');
        triggerNote(parseFloat(key.dataset.freq), 0.8);
        if (isRecording) {
          recordedNotes.push({ freq: parseFloat(key.dataset.freq), time: performance.now() - recordStart });
        }
      });
      key.addEventListener('touchend', (e) => {
        e.preventDefault();
        key.classList.remove('active');
        releaseNote(parseFloat(key.dataset.freq));
      });
      keyboardEl.appendChild(key);
    }
  }

  // ---------- RECORDING & PLAYBACK ----------
  let isRecording = false;
  let recordedNotes = [];
  let recordStart = 0;
  let isPlaying = false;
  const melodyDisplay = document.getElementById('melodyDisplay');

  document.getElementById('recordBtn').addEventListener('click', function() {
    if (isRecording) {
      isRecording = false;
      this.classList.remove('active');
      this.textContent = '⏺ RECORD';
      melodyDisplay.textContent = `📝 Recorded ${recordedNotes.length} notes. Press PLAY to hear them.`;
    } else {
      recordedNotes = [];
      isRecording = true;
      recordStart = performance.now();
      this.classList.add('active');
      this.textContent = '⏹ STOP';
      melodyDisplay.textContent = '🔴 Recording... Play some keys!';
    }
  });

  document.getElementById('clearMelodyBtn').addEventListener('click', () => {
    recordedNotes = [];
    melodyDisplay.textContent = '🗑️ Melody cleared';
    if (isPlaying) {
      isPlaying = false;
      document.getElementById('playMelodyBtn').textContent = '▶ PLAY MELODY';
    }
  });

  document.getElementById('playMelodyBtn').addEventListener('click', () => {
    if (isPlaying) {
      isPlaying = false;
      this.textContent = '▶ PLAY MELODY';
      return;
    }
    if (recordedNotes.length === 0) {
      melodyDisplay.textContent = '⚠️ No notes recorded! Click RECORD and play some keys.';
      return;
    }

    isPlaying = true;
    this.textContent = '⏹ STOP';
    melodyDisplay.textContent = `▶️ Playing ${recordedNotes.length} notes...`;

    const tempo = parseInt(document.getElementById('tempo').value);
    const beatDuration = 60 / tempo;
    let index = 0;
    const startTime = audioCtx.currentTime;
    const firstNoteTime = recordedNotes[0]?.time || 0;

    function scheduleNext() {
      if (!isPlaying || index >= recordedNotes.length) {
        isPlaying = false;
        document.getElementById('playMelodyBtn').textContent = '▶ PLAY MELODY';
        melodyDisplay.textContent = `✅ Playback finished (${recordedNotes.length} notes)`;
        return;
      }

      const note = recordedNotes[index];
      const time = startTime + (note.time - firstNoteTime) / 1000;
      const duration = index < recordedNotes.length - 1 
        ? (recordedNotes[index + 1].time - note.time) / 1000 
        : beatDuration * 0.8;

      const scheduledTime = audioCtx.currentTime + Math.max(0, time - audioCtx.currentTime);
      const freq = note.freq;

      // Schedule note on
      const now = audioCtx.currentTime;
      const fA = parseFloat(fAttack.value);
      const fD = parseFloat(fDecay.value);
      const fS = parseFloat(fSustain.value);
      const fR = parseFloat(fRelease.value);
      const gA = parseFloat(gAttack.value);
      const gD = parseFloat(gDecay.value);
      const gS = parseFloat(gSustain.value);
      const gR = parseFloat(gRelease.value);

      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.001, scheduledTime);
      noteGain.connect(filterNode);

      const noteFilter = audioCtx.createBiquadFilter();
      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(2000, scheduledTime);
      noteFilter.Q.value = 1.2;
      noteGain.connect(noteFilter);

      const noteFilterEnv = audioCtx.createGain();
      noteFilterEnv.gain.setValueAtTime(0.001, scheduledTime);
      noteFilter.connect(noteFilterEnv);
      noteFilterEnv.connect(reverb.convolver);

      const freqMod = audioCtx.createGain();
      freqMod.gain.setValueAtTime(100, scheduledTime);
      freqMod.connect(noteFilter.frequency);

      oscData.forEach(d => {
        d.gain.disconnect();
        d.gain.connect(noteGain);
        d.osc.frequency.setValueAtTime(freq, scheduledTime);
      });

      const gParam = noteGain.gain;
      gParam.linearRampToValueAtTime(0.6, scheduledTime + gA);
      gParam.linearRampToValueAtTime(gS * 0.6, scheduledTime + gA + gD);

      const fParam = noteFilterEnv.gain;
      fParam.linearRampToValueAtTime(1.0, scheduledTime + fA);
      fParam.linearRampToValueAtTime(fS * 1.0, scheduledTime + fA + fD);

      const freqParam = freqMod.gain;
      freqParam.linearRampToValueAtTime(1800, scheduledTime + fA);
      freqParam.linearRampToValueAtTime(500 + fS * 1000, scheduledTime + fA + fD);

      // Schedule note off
      const releaseTime = scheduledTime + Math.max(duration, 0.05);
      setTimeout(() => {
        const now2 = audioCtx.currentTime;
        gParam.cancelScheduledValues(now2);
        gParam.setValueAtTime(gParam.value, now2);
        gParam.linearRampToValueAtTime(0.001, now2 + gR);

        fParam.cancelScheduledValues(now2);
        fParam.setValueAtTime(fParam.value, now2);
        fParam.linearRampToValueAtTime(0.001, now2 + fR);

        freqParam.cancelScheduledValues(now2);
        freqParam.setValueAtTime(freqParam.value, now2);
        freqParam.linearRampToValueAtTime(100, now2 + fR);

        setTimeout(() => {
          try {
            noteGain.disconnect();
            noteFilter.disconnect();
            noteFilterEnv.disconnect();
            freqMod.disconnect();
            oscData.forEach(d => {
              d.gain.disconnect();
              d.gain.connect(gainEnvelope);
            });
          } catch(e) {}
        }, (Math.max(gR, fR) * 1000) + 100);
      }, (releaseTime - audioCtx.currentTime) * 1000);

      index++;
      const nextDelay = index < recordedNotes.length 
        ? Math.max(0, (recordedNotes[index].time - note.time) / 1000)
        : 0.1;
      setTimeout(scheduleNext, nextDelay * 1000 + 50);
    }

    // Start scheduling with a small delay
    setTimeout(scheduleNext, 100);
  });

  // Tempo display
  document.getElementById('tempo').addEventListener('input', (e) => {
    document.getElementById('tempoLabel').textContent = e.target.value;
  });

  // Cleanup
  window.addEventListener('beforeunload', () => {
    try { audioCtx.close(); } catch(e) {}
  });
})();

