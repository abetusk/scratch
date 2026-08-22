    // ============================================
    // 1. SYNTH ENGINE (completely separate from GUI)
    // ============================================
    class SynthEngine {
        constructor() {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.activeNotes = new Map();

            // Master
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.value = 0.6;
            this.masterGain.connect(this.audioCtx.destination);

            // Reverb
            this.reverb = null;
            this.createReverb(2.0, 0.45);

            // Filter
            this.filterNode = this.audioCtx.createBiquadFilter();
            this.filterNode.type = 'lowpass';
            this.filterNode.frequency.value = 1200;
            this.filterNode.Q.value = 0.8;

            this.filterADSR = this.audioCtx.createGain();
            this.filterADSR.gain.value = 0.001;
            this.filterNode.connect(this.filterADSR);
            this.filterADSR.connect(this.reverb.convolver);

            // Gain envelope
            this.gainEnvelope = this.audioCtx.createGain();
            this.gainEnvelope.gain.value = 0.001;
            this.gainEnvelope.connect(this.filterNode);

            // Oscillators
            this.oscData = [];
            for (let i = 0; i < 3; i++) {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                gain.gain.value = 0.25 + i*0.05;
                osc.type = i === 0 ? 'sawtooth' : i === 1 ? 'square' : 'triangle';
                osc.frequency.value = 440;
                osc.detune.value = (i-1)*8;

                const lfoOsc = this.audioCtx.createOscillator();
                const lfoGain = this.audioCtx.createGain();
                lfoGain.gain.value = 0.15 + i*0.05;
                lfoOsc.frequency.value = 2.0 + i*0.3;
                lfoOsc.type = 'sine';

                lfoOsc.connect(lfoGain);
                lfoGain.connect(osc.frequency);

                osc.connect(gain);
                gain.connect(this.gainEnvelope);
                osc.start();
                lfoOsc.start();

                this.oscData.push({ osc, gain, lfoOsc, lfoGain });
            }

            // LFOs
            this.filterLfo = this.audioCtx.createOscillator();
            this.filterLfoGain = this.audioCtx.createGain();
            this.filterLfoGain.gain.value = 80;
            this.filterLfo.frequency.value = 1.2;
            this.filterLfo.type = 'triangle';
            this.filterLfo.connect(this.filterLfoGain);
            this.filterLfoGain.connect(this.filterNode.frequency);
            this.filterLfo.start();

            this.gainLfo = this.audioCtx.createOscillator();
            this.gainLfoGain = this.audioCtx.createGain();
            this.gainLfoGain.gain.value = 0.08;
            this.gainLfo.frequency.value = 0.8;
            this.gainLfo.type = 'triangle';
            this.gainLfo.connect(this.gainLfoGain);
            this.gainLfoGain.connect(this.gainEnvelope.gain);
            this.gainLfo.start();

            this.reverbLfo = this.audioCtx.createOscillator();
            this.reverbLfoGain = this.audioCtx.createGain();
            this.reverbLfoGain.gain.value = 0.05;
            this.reverbLfo.frequency.value = 0.4;
            this.reverbLfo.type = 'triangle';
            this.reverbLfo.connect(this.reverbLfoGain);
            this.reverbLfoGain.connect(this.reverb.wetGain.gain);
            this.reverbLfo.start();

            // ADSR params (default dungeon synth)
            this.params = {
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
            };
        }

        createReverb(decay, wet) {
            if (this.reverb) {
                try {
                    this.reverb.convolver.disconnect();
                    this.reverb.wetGain.disconnect();
                    this.reverb.dryGain.disconnect();
                } catch(e) {}
            }
            const convolver = this.audioCtx.createConvolver();
            const length = this.audioCtx.sampleRate * decay;
            const impulse = this.audioCtx.createBuffer(2, length, this.audioCtx.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const data = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const env = Math.exp(-i / (this.audioCtx.sampleRate * decay * 0.7));
                    data[i] = (Math.random() * 2 - 1) * env * 0.8;
                }
            }
            convolver.buffer = impulse;
            const wetGain = this.audioCtx.createGain();
            wetGain.gain.value = wet;
            const dryGain = this.audioCtx.createGain();
            dryGain.gain.value = 1 - wet;
            convolver.connect(wetGain);
            wetGain.connect(this.masterGain);
            dryGain.connect(this.masterGain);
            this.reverb = { convolver, wetGain, dryGain };
        }

        triggerNote(frequency, velocity = 0.7) {
            if (this.activeNotes.has(frequency)) return;

            const now = this.audioCtx.currentTime;
            const p = this.params;

            const noteGain = this.audioCtx.createGain();
            noteGain.gain.value = 0.001;
            noteGain.connect(this.filterNode);

            const noteFilter = this.audioCtx.createBiquadFilter();
            noteFilter.type = 'lowpass';
            noteFilter.frequency.value = p.filterFreq || 1200;
            noteFilter.Q.value = p.filterQ || 0.8;
            noteGain.connect(noteFilter);

            const noteFilterEnv = this.audioCtx.createGain();
            noteFilterEnv.gain.value = 0.001;
            noteFilter.connect(noteFilterEnv);
            noteFilterEnv.connect(this.reverb.convolver);

            const freqMod = this.audioCtx.createGain();
            freqMod.gain.value = 60;
            freqMod.connect(noteFilter.frequency);

            this.oscData.forEach(d => {
                d.gain.disconnect();
                d.gain.connect(noteGain);
                d.osc.frequency.value = frequency;
            });

            const gParam = noteGain.gain;
            gParam.cancelScheduledValues(now);
            gParam.setValueAtTime(0.001, now);
            gParam.linearRampToValueAtTime(velocity * 0.6, now + p.gAttack);
            gParam.linearRampToValueAtTime(p.gSustain * velocity * 0.6, now + p.gAttack + p.gDecay);

            const fParam = noteFilterEnv.gain;
            fParam.cancelScheduledValues(now);
            fParam.setValueAtTime(0.001, now);
            fParam.linearRampToValueAtTime(1.0, now + p.fAttack);
            fParam.linearRampToValueAtTime(p.fSustain * 1.0, now + p.fAttack + p.fDecay);

            const freqParam = freqMod.gain;
            freqParam.cancelScheduledValues(now);
            freqParam.setValueAtTime(60, now);
            freqParam.linearRampToValueAtTime(1200, now + p.fAttack);
            freqParam.linearRampToValueAtTime(400 + p.fSustain * 800, now + p.fAttack + p.fDecay);

            this.activeNotes.set(frequency, { 
                noteGain, noteFilter, noteFilterEnv, freqMod, 
                gParam, fParam, freqParam, 
                gR: p.gRelease, fR: p.fRelease 
            });
        }

        releaseNote(frequency) {
            const note = this.activeNotes.get(frequency);
            if (!note) return;

            const now = this.audioCtx.currentTime;
            const { noteGain, noteFilterEnv, freqMod, gParam, fParam, freqParam, gR, fR } = note;

            gParam.cancelScheduledValues(now);
            gParam.setValueAtTime(gParam.value, now);
            gParam.linearRampToValueAtTime(0.001, now + gR);

            fParam.cancelScheduledValues(now);
            fParam.setValueAtTime(fParam.value, now);
            fParam.linearRampToValueAtTime(0.001, now + fR);

            freqParam.cancelScheduledValues(now);
            freqParam.setValueAtTime(freqParam.value, now);
            freqParam.linearRampToValueAtTime(60, now + fR);

            setTimeout(() => {
                try {
                    noteGain.disconnect();
                    noteFilter.disconnect();
                    noteFilterEnv.disconnect();
                    freqMod.disconnect();
                    this.oscData.forEach(d => {
                        d.gain.disconnect();
                        d.gain.connect(this.gainEnvelope);
                    });
                } catch(e) {}
            }, (Math.max(gR, fR) * 1000) + 100);

            this.activeNotes.delete(frequency);
        }

        panic() {
            this.activeNotes.forEach((_, freq) => this.releaseNote(freq));
        }

        // ----- Preset Management -----
        getPreset() {
            const p = this.params;
            return {
                fAttack: p.fAttack, fDecay: p.fDecay, fSustain: p.fSustain, fRelease: p.fRelease,
                gAttack: p.gAttack, gDecay: p.gDecay, gSustain: p.gSustain, gRelease: p.gRelease,
                reverbWet: p.reverbWet, reverbDecay: p.reverbDecay,
                filterLfoRate: p.filterLfoRate, filterLfoDepth: p.filterLfoDepth, filterLfoWave: p.filterLfoWave,
                gainLfoRate: p.gainLfoRate, gainLfoDepth: p.gainLfoDepth, gainLfoWave: p.gainLfoWave,
                reverbLfoRate: p.reverbLfoRate, reverbLfoDepth: p.reverbLfoDepth, reverbLfoWave: p.reverbLfoWave,
                masterVol: p.masterVol,
                osc1Wave: p.osc1Wave, osc2Wave: p.osc2Wave, osc3Wave: p.osc3Wave,
                osc1Vol: p.osc1Vol, osc2Vol: p.osc2Vol, osc3Vol: p.osc3Vol,
                osc1Detune: p.osc1Detune, osc2Detune: p.osc2Detune, osc3Detune: p.osc3Detune,
                osc1LfoRate: p.osc1LfoRate, osc2LfoRate: p.osc2LfoRate, osc3LfoRate: p.osc3LfoRate,
                osc1LfoDepth: p.osc1LfoDepth, osc2LfoDepth: p.osc2LfoDepth, osc3LfoDepth: p.osc3LfoDepth,
                filterFreq: p.filterFreq, filterQ: p.filterQ
            };
        }

        loadPreset(preset) {
            this.panic();

            // Update params
            Object.assign(this.params, preset);
            const p = this.params;

            // Apply LFOs
            this.filterLfo.frequency.value = p.filterLfoRate;
            this.filterLfoGain.gain.value = p.filterLfoDepth;
            this.filterLfo.type = p.filterLfoWave;
            this.gainLfo.frequency.value = p.gainLfoRate;
            this.gainLfoGain.gain.value = p.gainLfoDepth;
            this.gainLfo.type = p.gainLfoWave;
            this.reverbLfo.frequency.value = p.reverbLfoRate;
            this.reverbLfoGain.gain.value = p.reverbLfoDepth;
            this.reverbLfo.type = p.reverbLfoWave;

            // Apply oscillators
            const oscWaves = [p.osc1Wave, p.osc2Wave, p.osc3Wave];
            const oscVols = [p.osc1Vol, p.osc2Vol, p.osc3Vol];
            const oscDetunes = [p.osc1Detune, p.osc2Detune, p.osc3Detune];
            const oscLfoRates = [p.osc1LfoRate, p.osc2LfoRate, p.osc3LfoRate];
            const oscLfoDepths = [p.osc1LfoDepth, p.osc2LfoDepth, p.osc3LfoDepth];

            this.oscData.forEach((d, i) => {
                d.osc.type = oscWaves[i];
                d.gain.gain.value = oscVols[i];
                d.osc.detune.value = oscDetunes[i];
                d.lfoOsc.frequency.value = oscLfoRates[i];
                d.lfoGain.gain.value = oscLfoDepths[i];
            });

            // Apply filter
            this.filterNode.frequency.value = p.filterFreq;
            this.filterNode.Q.value = p.filterQ;

            // Apply reverb
            this.createReverb(p.reverbDecay, p.reverbWet);
            if (this.filterADSR) {
                this.filterADSR.disconnect();
                this.filterADSR.connect(this.reverb.convolver);
            }
            this.reverbLfoGain.disconnect();
            this.reverbLfoGain.connect(this.reverb.wetGain.gain);

            // Master volume
            this.masterGain.gain.value = p.masterVol;
        }

        // ----- Melody Playback -----
        // notes: array of {freq: number, time: number} (time in ms from start)
        // tempo: BPM for note duration fallback
        playMelody(notes, tempo = 90, callback = null) {
            if (!notes || notes.length === 0) return;

            const beatDuration = 60 / tempo;
            let index = 0;
            const startTime = this.audioCtx.currentTime;
            const firstNoteTime = notes[0]?.time || 0;
            let isPlaying = true;

            const scheduleNext = () => {
                if (!isPlaying || index >= notes.length) {
                    if (callback) callback();
                    return;
                }

                const note = notes[index];
                const time = startTime + (note.time - firstNoteTime) / 1000;
                const duration = index < notes.length - 1 
                    ? (notes[index + 1].time - note.time) / 1000 
                    : beatDuration * 0.6;

                const scheduledTime = this.audioCtx.currentTime + Math.max(0, time - this.audioCtx.currentTime);
                const freq = note.freq;

                const now = this.audioCtx.currentTime;
                const p = this.params;

                const noteGain = this.audioCtx.createGain();
                noteGain.gain.setValueAtTime(0.001, scheduledTime);
                noteGain.connect(this.filterNode);

                const noteFilter = this.audioCtx.createBiquadFilter();
                noteFilter.type = 'lowpass';
                noteFilter.frequency.setValueAtTime(p.filterFreq || 1200, scheduledTime);
                noteFilter.Q.value = p.filterQ || 0.8;
                noteGain.connect(noteFilter);

                const noteFilterEnv = this.audioCtx.createGain();
                noteFilterEnv.gain.setValueAtTime(0.001, scheduledTime);
                noteFilter.connect(noteFilterEnv);
                noteFilterEnv.connect(this.reverb.convolver);

                const freqMod = this.audioCtx.createGain();
                freqMod.gain.setValueAtTime(60, scheduledTime);
                freqMod.connect(noteFilter.frequency);

                this.oscData.forEach(d => {
                    d.gain.disconnect();
                    d.gain.connect(noteGain);
                    d.osc.frequency.setValueAtTime(freq, scheduledTime);
                });

                const gParam = noteGain.gain;
                gParam.linearRampToValueAtTime(0.5, scheduledTime + p.gAttack);
                gParam.linearRampToValueAtTime(p.gSustain * 0.5, scheduledTime + p.gAttack + p.gDecay);

                const fParam = noteFilterEnv.gain;
                fParam.linearRampToValueAtTime(1.0, scheduledTime + p.fAttack);
                fParam.linearRampToValueAtTime(p.fSustain * 1.0, scheduledTime + p.fAttack + p.fDecay);

                const freqParam = freqMod.gain;
                freqParam.linearRampToValueAtTime(1200, scheduledTime + p.fAttack);
                freqParam.linearRampToValueAtTime(400 + p.fSustain * 800, scheduledTime + p.fAttack + p.fDecay);

                const releaseTime = scheduledTime + Math.max(duration, 0.05);
                setTimeout(() => {
                    const now2 = this.audioCtx.currentTime;
                    gParam.cancelScheduledValues(now2);
                    gParam.setValueAtTime(gParam.value, now2);
                    gParam.linearRampToValueAtTime(0.001, now2 + p.gRelease);

                    fParam.cancelScheduledValues(now2);
                    fParam.setValueAtTime(fParam.value, now2);
                    fParam.linearRampToValueAtTime(0.001, now2 + p.fRelease);

                    freqParam.cancelScheduledValues(now2);
                    freqParam.setValueAtTime(freqParam.value, now2);
                    freqParam.linearRampToValueAtTime(60, now2 + p.fRelease);

                    setTimeout(() => {
                        try {
                            noteGain.disconnect();
                            noteFilter.disconnect();
                            noteFilterEnv.disconnect();
                            freqMod.disconnect();
                            this.oscData.forEach(d => {
                                d.gain.disconnect();
                                d.gain.connect(this.gainEnvelope);
                            });
                        } catch(e) {}
                    }, (Math.max(p.gRelease, p.fRelease) * 1000) + 100);
                }, (releaseTime - this.audioCtx.currentTime) * 1000);

                index++;
                const nextDelay = index < notes.length 
                    ? Math.max(0, (notes[index].time - note.time) / 1000)
                    : 0.1;
                setTimeout(scheduleNext, nextDelay * 1000 + 50);
            };

            setTimeout(scheduleNext, 100);

            // Return stop function
            return () => { isPlaying = false; };
        }
    }

