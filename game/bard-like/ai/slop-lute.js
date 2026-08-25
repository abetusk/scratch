    // --------------------------------------------------------------
    // 1. DISASTERPEACE-STYLE CHIPTUNE INSTRUMENT (FIXED)
    //    - Proper envelope reset between notes
    //    - Uses triggerAttack/triggerRelease for better control
    // --------------------------------------------------------------

// usage:
// const lute = new ChiptuneLute({ decay: 0.8, gain: 0.6, detune: 18 });
//
// lute.playMelody( melody, bpm, () => { /* on complete });
// Tone.Transport.stop();
// Tone.Transport.cancel();
//

    class ChiptuneLute {
      constructor(params = {}) {

        if (!("decay" in params)) { params["decay"] = 0.8; }
        if (!("gain" in params)) { params["gain"] = 0.6; }
        if (!("detune" in params)) { params["detune"] = 18; }

        // --- Effects chain ---
        this.gainNode = new Tone.Gain(params.gain ?? 0.6);

        this.chorus = new Tone.Chorus({
          frequency: 2.5,
          delayTime: 3,
          depth: 0.8,
          type: 'sine',
          spread: 200
        });

        this.reverb = new Tone.Reverb({
          decay: 2.0,
          preDelay: 0.03,
          wet: 0.25
        });

        // Routing
        this.effectsBypass = new Tone.Gain(1);
        this.effectsBypass.connect(this.chorus);
        this.chorus.connect(this.reverb);
        this.reverb.connect(Tone.Destination);

        this.dryPath = new Tone.Gain(0);
        this.dryPath.connect(Tone.Destination);

        // --- Voice 1: Main pulse ---
        this.voice1 = new Tone.MonoSynth({
          oscillator: {
            type: 'pulse',
            width: 0.5
          },
          filter: {
            type: 'lowpass',
            frequency: 3000,
            rolloff: -24
          },
          filterEnvelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.6,
            release: 0.05,
            baseFrequency: 1000,
            octaves: 3.0
          },
          envelope: {
            attack: 0.001,
            decay: params.decay ?? 0.8,
            sustain: 0.0,
            release: 0.05
          },
          volume: -8
        });

        // --- Voice 2: Detuned pulse ---
        this.voice2 = new Tone.MonoSynth({
          oscillator: {
            type: 'pulse',
            width: 0.4
          },
          filter: {
            type: 'lowpass',
            frequency: 2800,
            rolloff: -24
          },
          filterEnvelope: {
            attack: 0.002,
            decay: 0.08,
            sustain: 0.5,
            release: 0.04,
            baseFrequency: 800,
            octaves: 2.8
          },
          envelope: {
            attack: 0.002,
            decay: params.decay ?? 0.8,
            sustain: 0.0,
            release: 0.05
          },
          volume: -10
        });

        // --- Voice 3: Wide detuned pulse ---
        this.voice3 = new Tone.MonoSynth({
          oscillator: {
            type: 'pulse',
            width: 0.6
          },
          filter: {
            type: 'lowpass',
            frequency: 2600,
            rolloff: -12
          },
          filterEnvelope: {
            attack: 0.002,
            decay: 0.12,
            sustain: 0.4,
            release: 0.06,
            baseFrequency: 700,
            octaves: 2.5
          },
          envelope: {
            attack: 0.002,
            decay: params.decay ?? 0.8,
            sustain: 0.0,
            release: 0.05
          },
          volume: -11
        });

        // Connect all voices
        this.voice1.connect(this.gainNode);
        this.voice2.connect(this.gainNode);
        this.voice3.connect(this.gainNode);
        this.gainNode.connect(this.effectsBypass);
        this.gainNode.connect(this.dryPath);

        // Store params
        this._decay = params.decay ?? 0.8;
        this._gain = params.gain ?? 0.6;
        this._detuneAmount = params.detune ?? 18;
        this._vibratoEnabled = true;
        this._isPlaying = false;

        // Voice references
        this._osc1 = this.voice1.oscillator;
        this._osc2 = this.voice2.oscillator;
        this._osc3 = this.voice3.oscillator;

        // Vibrato LFOs
        this.vibratoLFO1 = new Tone.LFO({ frequency: 6.0, type: 'sine', min: -3, max: 3 });
        this.vibratoLFO2 = new Tone.LFO({ frequency: 5.5, type: 'sine', min: -2.5, max: 2.5 });
        this.vibratoLFO3 = new Tone.LFO({ frequency: 5.0, type: 'sine', min: -2, max: 2 });
        this._vibratoActive = false;

        // Set initial detune
        this.setDetune(this._detuneAmount);

        // Melody state
        this._melodyEvents = [];
        this._isMelodyPlaying = false;
        this._melodyCallback = null;
      }

      /** Play a note with proper envelope reset */
      playNote(note, decayTime = this._decay, gainValue = this._gain, detune = this._detuneAmount) {
        if (!Tone.context.state || Tone.context.state === 'suspended') {
          Tone.context.resume();
        }

        // Update params
        if (decayTime !== this._decay) this.setDecay(decayTime);
        if (gainValue !== this._gain) this.setGain(gainValue);
        if (detune !== this._detuneAmount) this.setDetune(detune);

        // Force envelope reset by triggering release first
        // This prevents the "stuck" envelope issue
        const now = Tone.now();
        
        // Release any hanging notes
        this.voice1.triggerRelease(now);
        this.voice2.triggerRelease(now);
        this.voice3.triggerRelease(now);

        // Small delay to let envelope reset
        const startTime = now + 0.001;

        // Set detune for all 3 voices
        const detune1 = 0;
        const detune2 = this._detuneAmount * 0.6 + (Math.random() * 4 - 2);
        const detune3 = -this._detuneAmount * 0.8 + (Math.random() * 4 - 2);

        this._osc1.set({ detune: detune1 });
        this._osc2.set({ detune: detune2 });
        this._osc3.set({ detune: detune3 });

        // Pulse width variation
        this._osc1.set({ width: 0.45 + Math.random() * 0.1 });
        this._osc2.set({ width: 0.35 + Math.random() * 0.1 });
        this._osc3.set({ width: 0.55 + Math.random() * 0.1 });

        // Start vibrato
        if (this._vibratoEnabled) {
          this._startVibrato();
        }

        // Trigger all 3 voices with staggered timing
        this.voice1.triggerAttack(note, startTime);
        this.voice2.triggerAttack(note, startTime + 0.004);
        this.voice3.triggerAttack(note, startTime + 0.008);

        // Schedule release after note duration
        const duration = 0.3; // 8th note at default tempo
        this.voice1.triggerRelease(startTime + duration);
        this.voice2.triggerRelease(startTime + duration + 0.004);
        this.voice3.triggerRelease(startTime + duration + 0.008);

        // Schedule vibrato stop
        const stopDelay = Math.max(400, this._decay * 600);
        setTimeout(() => {
          this._stopVibrato();
        }, stopDelay);
      }

      /** Start vibrato */
      _startVibrato() {
        if (this._vibratoActive) return;
        this._vibratoActive = true;
        this.vibratoLFO1.start();
        this.vibratoLFO1.connect(this._osc1.frequency);
        this.vibratoLFO2.start();
        this.vibratoLFO2.connect(this._osc2.frequency);
        this.vibratoLFO3.start();
        this.vibratoLFO3.connect(this._osc3.frequency);
      }

      /** Stop vibrato */
      _stopVibrato() {
        if (!this._vibratoActive) return;
        this._vibratoActive = false;
        this.vibratoLFO1.stop();
        this.vibratoLFO1.disconnect();
        this.vibratoLFO2.stop();
        this.vibratoLFO2.disconnect();
        this.vibratoLFO3.stop();
        this.vibratoLFO3.disconnect();
      }

      /** Set decay time */
      setDecay(time) {
        this._decay = Math.min(2.0, Math.max(0.1, time));
        this.voice1.envelope.decay = this._decay;
        this.voice2.envelope.decay = this._decay;
        this.voice3.envelope.decay = this._decay;
      }

      /** Set gain */
      setGain(val) {
        this._gain = Math.min(1.0, Math.max(0.05, val));
        this.gainNode.gain.value = this._gain;
      }

      /** Set detune amount */
      setDetune(amount) {
        this._detuneAmount = Math.min(30, Math.max(0, amount));
      }

      /** Enable/disable effects */
      setEffectsEnabled(enabled) {
        if (enabled) {
          this.effectsBypass.gain.value = 1;
          this.dryPath.gain.value = 0;
        } else {
          this.effectsBypass.gain.value = 0;
          this.dryPath.gain.value = 1;
        }
      }

      /** Enable/disable vibrato */
      setVibratoEnabled(enabled) {
        this._vibratoEnabled = enabled;
        if (!enabled) {
          this._stopVibrato();
        }
      }

      /** Play arpeggio-style melody */
      playMelody(melodyData, bpm = 130, callback = null) {
        this.stopMelody();

        if (!melodyData || melodyData.length === 0) {
          return { stop: () => {} };
        }

        if (Tone.context.state === 'suspended') {
          Tone.context.resume();
        }

        Tone.Transport.bpm.value = bpm;
        this._melodyCallback = callback;
        this._isMelodyPlaying = true;

        let totalBeats = 0;
        const events = [];

        // playing twice screws things up
        //
        melodyData.forEach((item) => {
          const note = item.note;
          const duration = (item.duration * 60 / bpm) || 0.5;

          const event = Tone.Transport.schedule((time) => {
            if (!this._isMelodyPlaying) return;

            // Force envelope reset
            const now = time ;
            this.voice1.triggerRelease(now);
            this.voice2.triggerRelease(now);
            this.voice3.triggerRelease(now);

            let startTime = now + 0.001;
            startTime = now + 0.05;

            // Set detune
            const detune1 = 0;
            const detune2 = this._detuneAmount * 0.6 + (Math.random() * 4 - 2);
            const detune3 = -this._detuneAmount * 0.8 + (Math.random() * 4 - 2);

            this._osc1.set({ detune: detune1 });
            this._osc2.set({ detune: detune2 });
            this._osc3.set({ detune: detune3 });

            // Pulse width
            this._osc1.set({ width: 0.45 + Math.random() * 0.1 });
            this._osc2.set({ width: 0.35 + Math.random() * 0.1 });
            this._osc3.set({ width: 0.55 + Math.random() * 0.1 });

            // Trigger all 3 voices
            this.voice1.triggerAttack(note, startTime);
            this.voice2.triggerAttack(note, startTime + 0.004);
            this.voice3.triggerAttack(note, startTime + 0.008);

            // Schedule release
            const releaseTime = duration * 0.85;
            this.voice1.triggerRelease(startTime + releaseTime);
            this.voice2.triggerRelease(startTime + releaseTime + 0.004);
            this.voice3.triggerRelease(startTime + releaseTime + 0.008);
          }, totalBeats);

          events.push(event);
          totalBeats += duration;
        });

        this._melodyEvents = events;

        const cleanupEvent = Tone.Transport.schedule(() => {
          this._isMelodyPlaying = false;
          if (this._melodyCallback) {
            this._melodyCallback();
            this._melodyCallback = null;
          }
          // Stop vibrato
          this._stopVibrato();
        }, totalBeats + 0.1);

        this._melodyEvents.push(cleanupEvent);

        if (Tone.Transport.state === 'stopped') {
          Tone.Transport.start();
        }

        return { stop: () => this.stopMelody() };
      }

      /** Stop melody */
      stopMelody() {
        this._melodyEvents.forEach(event => {
          if (event && event.id !== undefined) {
            Tone.Transport.clear(event.id);
          }
        });
        this._melodyEvents = [];
        this._isMelodyPlaying = false;
        this._melodyCallback = null;
        this._stopVibrato();
      }

      isMelodyPlaying() {
        return this._isMelodyPlaying;
      }

      /** Dispose */
      dispose() {
        this.stopMelody();
        this.vibratoLFO1.dispose();
        this.vibratoLFO2.dispose();
        this.vibratoLFO3.dispose();
        this.voice1.dispose();
        this.voice2.dispose();
        this.voice3.dispose();
        this.gainNode.dispose();
        this.chorus.dispose();
        this.reverb.dispose();
        this.effectsBypass.dispose();
        this.dryPath.dispose();
      }
    }

        const furElise = [
                // Bar 1-2: Main theme
                { note: 'E5', duration: 0.25 }, { note: 'D#5', duration: 0.25 },
                { note: 'E5', duration: 0.25 }, { note: 'D#5', duration: 0.25 },
                { note: 'E5', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                { note: 'D5', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                
                // Bar 3-4
                { note: 'A4', duration: 0.25 }, { note: 'C4', duration: 0.25 },
                { note: 'E4', duration: 0.25 }, { note: 'A4', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'G#4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                
                // Bar 5-6
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'G#4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                
                // Bar 7-8
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'D4', duration: 0.25 },
                { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                
                // Bar 9-10
                { note: 'C5', duration: 0.25 }, { note: 'D4', duration: 0.25 },
                { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                
                // Bar 11-12
                { note: 'B4', duration: 0.25 }, { note: 'D4', duration: 0.25 },
                { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                
                // Bar 13-14
                { note: 'B4', duration: 0.25 }, { note: 'F4', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'D5', duration: 0.25 },
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                
                // Bar 15-16
                { note: 'B4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'G#4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                
                // Bar 17-18
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                { note: 'B4', duration: 0.25 }, { note: 'D4', duration: 0.25 },
                { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
                
                // Bar 19-20 (ending)
                { note: 'C5', duration: 0.25 }, { note: 'E4', duration: 0.25 },
                { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 },
                { note: 'E5', duration: 0.5 }, { note: 'E5', duration: 0.5 },
                { note: 'E5', duration: 0.75 },
            ];

          let custom = [
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "G4", "duration": 0.5 },
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "A4", "duration": 0.5 },
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "B4", "duration": 0.5 },
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "G4", "duration": 0.5 },
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "A4", "duration": 0.5 },
              { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.25 }, { "note" : "E4", "duration": 0.5 }
              ];

          let custom1= [
              { "note" : "F4", "duration": 0.125 }, { "note" : "F4", "duration": 0.125 },
              { "note" : "F4", "duration": 0.125 }, { "note" : "F4", "duration": 0.125 },
              { "note" : "A4", "duration": 0.25 }, { "note" : "B4", "duration": 0.25 },

              { "note" : "B4", "duration": 0.25 }, { "note" : "C4", "duration": 0.25 },
              { "note" : "F4", "duration": 0.125 }, { "note" : "F4", "duration": 0.125 },
              { "note" : "A4", "duration": 0.25 },

              { "note" : "A4", "duration": 0.125 }, { "note" : "B4", "duration": 0.125 },
              { "note" : "C4", "duration": 0.125 }, { "note" : "F4", "duration": 0.125 },
              { "note" : "A4", "duration": 0.25 }, { "note" : "A4", "duration": 0.25 },


              { "note" : "C4", "duration": 0.25 }, { "note" : "C4", "duration": 0.25 },
              { "note" : "B4", "duration": 0.125 }, { "note" : "B4", "duration": 0.125 },
              { "note" : "F4", "duration": 0.25 }

              ];


function slop_lute_start_melody(lute, melody, bpm) {
  bpm = ((typeof bpm === "undefined") ? 120 : bpm);
  lute.playMelody(melody, bpm, function() { slop_lute_on_complete(lute); });
}

function slop_lute_stop_melody(lute) {
  lute.stopMelody();
  slop_lute_on_complete(lute);
}

function slop_lute_on_complete(lute) {
  if (Tone.Transport.state == 'started') {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }
}
