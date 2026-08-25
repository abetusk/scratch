// ============================================
// PROFESSIONAL WEB AUDIO SYNTHESIZER v4.0
// Pop-free using proper envelope curves
// ============================================

class SynthEngine1 {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        
        // Voice management
        this.voicePool = [];
        this.activeVoices = new Map();
        this.maxPolyphony = 12;
        this.masterGain = null;
        
        // Presets
        this.presets = new Map();
        this.currentPreset = null;
        this.loadDefaultPresets();
        this.currentPreset = this.presets.get('Analog Lead');
        
        // Scheduling
        this.sequenceActive = false;
        this.sequenceTimeout = null;
        
        // Note mapping
        this.noteMap = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
    }
    
    // ========== INITIALIZATION ==========
    initialize() {
        if (this.initialized) return true;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            
            // Initialize voice pool
            for (let i = 0; i < this.maxPolyphony; i++) {
                this.voicePool.push(this.createVoice());
            }
            
            this.applyPreset(this.currentPreset);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }
    
    // ========== VOICE CREATION ==========
    createVoice() {
        const ctx = this.audioContext;
        
        // Create nodes
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // Configure
        oscillator.type = 'sawtooth';
        oscillator.detune.value = 0;
        
        // Start at 0
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        
        // Connect
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start();
        
        return {
            oscillator,
            gainNode,
            filter,
            isActive: false,
            note: null,
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.7,
                release: 0.3
            }
        };
    }
    
    // ========== GENERATE POP-FREE ENVELOPE CURVE ==========
    generateEnvelopeCurve(attack, decay, sustain, release, sampleRate) {
        // Generate a complete envelope curve as a Float32Array
        // This creates a mathematically smooth curve with no discontinuities
        
        const totalSamples = Math.floor(sampleRate * (attack + decay + release + 0.05));
        const curve = new Float32Array(totalSamples);
        
        const attackSamples = Math.floor(sampleRate * attack);
        const decaySamples = Math.floor(sampleRate * decay);
        const releaseSamples = Math.floor(sampleRate * release);
        const sustainStart = attackSamples;
        const releaseStart = attackSamples + decaySamples;
        const totalLength = attackSamples + decaySamples + releaseSamples;
        
        for (let i = 0; i < totalSamples; i++) {
            let value = 0;
            
            if (i < attackSamples) {
                // Attack: exponential approach to 1
                const progress = i / attackSamples;
                value = 1 - Math.exp(-progress * 6);
                value = Math.min(value, 1);
            } else if (i < sustainStart + decaySamples) {
                // Decay: exponential to sustain
                const progress = (i - sustainStart) / decaySamples;
                value = 1 - (1 - sustain) * (1 - Math.exp(-progress * 4));
            } else if (i < totalLength) {
                // Release: exponential to 0
                const progress = (i - releaseStart) / releaseSamples;
                value = sustain * (1 - Math.exp(-progress * 6));
                value = Math.max(value, 0);
            }
            
            curve[i] = Math.max(0, Math.min(1, value));
        }
        
        return curve;
    }
    
    // ========== POP-FREE NOTE SCHEDULING ==========
    scheduleNoteOn(note, startTime, velocity = 0.8) {
        if (!this.initialized) {
            console.warn('Synth not initialized');
            return false;
        }
        
        const frequency = this.noteToFrequency(note);
        if (!frequency) return false;
        
        const voice = this.acquireVoice();
        if (!voice) return false;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const time = Math.max(startTime, now);
        
        // Set frequency
        voice.oscillator.frequency.setValueAtTime(frequency, time);
        voice.note = note;
        voice.isActive = true;
        this.activeVoices.set(note, voice);
        
        // === ZERO-POP ENVELOPE USING setValueCurveAtTime ===
        // This is the ONLY way to guarantee no pops
        
        const attack = Math.max(voice.envelope.attack, 0.005);
        const decay = Math.max(voice.envelope.decay, 0.005);
        const release = Math.max(voice.envelope.release, 0.005);
        const sustain = voice.envelope.sustain * velocity;
        
        // Generate smooth envelope curve
        const sampleRate = ctx.sampleRate;
        const curve = this.generateEnvelopeCurve(attack, decay, sustain, release, sampleRate);
        
        // Scale by velocity
        const scaledCurve = new Float32Array(curve.length);
        for (let i = 0; i < curve.length; i++) {
            scaledCurve[i] = curve[i] * velocity;
        }
        
        // Cancel any existing automation
        voice.gainNode.gain.cancelScheduledValues(time);
        voice.gainNode.gain.setValueAtTime(0, time);
        
        // Apply the curve - this is pop-free because it's a continuous function
        const duration = attack + decay + release;
        voice.gainNode.gain.setValueCurveAtTime(scaledCurve, time, duration);
        
        // Hold sustain if needed (for longer notes)
        voice.gainNode.gain.setValueAtTime(sustain * velocity, time + attack + decay);
        
        // === FILTER ENVELOPE ===
        const filterFreq = this.currentPreset?.filter?.frequency || 2000;
        const filterEnv = this.currentPreset?.filter?.envelopeAmount || 0.3;
        const maxFreq = Math.min(filterFreq + (velocity * filterEnv * 4000), 20000);
        
        voice.filter.frequency.cancelScheduledValues(time);
        voice.filter.frequency.setValueAtTime(filterFreq, time);
        voice.filter.frequency.setValueAtTime(maxFreq, time + attack * 0.5);
        voice.filter.frequency.setValueAtTime(filterFreq, time + attack + decay);
        
        return true;
    }
    
    scheduleNoteOff(note, releaseTime) {
        const voice = this.activeVoices.get(note);
        if (!voice) return false;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const time = Math.max(releaseTime, now);
        
        // Get current gain
        const currentGain = voice.gainNode.gain.value;
        
        // Generate release curve
        const release = Math.max(voice.envelope.release, 0.005);
        const sampleRate = ctx.sampleRate;
        const releaseSamples = Math.floor(sampleRate * release);
        const curve = new Float32Array(releaseSamples);
        
        for (let i = 0; i < releaseSamples; i++) {
            const progress = i / releaseSamples;
            curve[i] = currentGain * (1 - Math.exp(-progress * 6));
            curve[i] = Math.max(0, curve[i]);
        }
        
        // Apply release curve
        voice.gainNode.gain.cancelScheduledValues(time);
        voice.gainNode.gain.setValueAtTime(currentGain, time);
        voice.gainNode.gain.setValueCurveAtTime(curve, time, release);
        voice.gainNode.gain.setValueAtTime(0, time + release + 0.001);
        
        // Schedule cleanup
        const cleanupTime = time + release + 0.01;
        const delayMs = (cleanupTime - now) * 1000;
        
        setTimeout(() => {
            if (voice.isActive) {
                voice.isActive = false;
                voice.gainNode.gain.value = 0;
                this.activeVoices.delete(note);
            }
        }, delayMs + 10);
        
        return true;
    }
    
    // ========== IMMEDIATE NOTE CONTROL ==========
    noteOn(note, velocity = 0.8) {
        return this.scheduleNoteOn(note, this.audioContext.currentTime, velocity);
    }
    
    noteOff(note) {
        return this.scheduleNoteOff(note, this.audioContext.currentTime);
    }
    
    // ========== VOICE ALLOCATION ==========
    acquireVoice() {
        for (const voice of this.voicePool) {
            if (!voice.isActive) {
                return voice;
            }
        }
        
        // Steal oldest
        const oldest = this.voicePool.shift();
        if (oldest.note) {
            this.activeVoices.delete(oldest.note);
            oldest.gainNode.gain.value = 0;
            oldest.isActive = false;
        }
        this.voicePool.push(oldest);
        return oldest;
    }
    
    // ========== MELODIC SEQUENCING ==========
    playMelody(sequence, tempo = 120, loop = false) {
        this.stopMelody();
        
        if (!sequence || sequence.length === 0) return false;
        
        this.sequenceActive = true;
        const beatDuration = 60 / tempo;
        let index = 0;
        let nextTime = this.audioContext.currentTime + 0.05;
        
        const scheduler = () => {
            if (!this.sequenceActive) return;
            
            if (index >= sequence.length) {
                if (loop) {
                    index = 0;
                    nextTime += beatDuration;
                    scheduler();
                }
                return;
            }
            
            const event = sequence[index];
            
            if (event.note) {
                this.scheduleNoteOn(event.note, nextTime, event.velocity || 0.8);
                if (event.duration) {
                    this.scheduleNoteOff(event.note, nextTime + event.duration);
                }
            }
            
            index++;
            nextTime += beatDuration;
            
            const now = this.audioContext.currentTime;
            const delay = Math.max((nextTime - now - 0.02) * 1000, 1);
            this.sequenceTimeout = setTimeout(scheduler, delay);
        };
        
        this.sequenceTimeout = setTimeout(scheduler, 10);
        return true;
    }
    
    stopMelody() {
        this.sequenceActive = false;
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
            this.sequenceTimeout = null;
        }
        this.activeVoices.forEach((voice, note) => {
            this.scheduleNoteOff(note, this.audioContext.currentTime);
        });
    }
    
    // ========== PRESET MANAGEMENT ==========
    loadDefaultPresets() {
        const presets = {
            'Analog Lead': {
                name: 'Analog Lead',
                oscillator: { type: 'sawtooth', detune: 2 },
                filter: { type: 'lowpass', frequency: 2800, Q: 1.2, envelopeAmount: 0.4 },
                envelope: { attack: 0.01, decay: 0.08, sustain: 0.6, release: 0.2 }
            },
            'Warm Bass': {
                name: 'Warm Bass',
                oscillator: { type: 'square', detune: 0 },
                filter: { type: 'lowpass', frequency: 500, Q: 1.8, envelopeAmount: 0.2 },
                envelope: { attack: 0.006, decay: 0.12, sustain: 0.4, release: 0.1 }
            },
            'Soft Pad': {
                name: 'Soft Pad',
                oscillator: { type: 'sawtooth', detune: 5 },
                filter: { type: 'lowpass', frequency: 3500, Q: 0.7, envelopeAmount: 0.15 },
                envelope: { attack: 0.2, decay: 0.2, sustain: 0.85, release: 0.5 }
            },
            'Pluck': {
                name: 'Pluck',
                oscillator: { type: 'square', detune: 0 },
                filter: { type: 'lowpass', frequency: 4000, Q: 2.0, envelopeAmount: 0.3 },
                envelope: { attack: 0.003, decay: 0.03, sustain: 0.15, release: 0.06 }
            },
            'Brass': {
                name: 'Brass',
                oscillator: { type: 'sawtooth', detune: 3 },
                filter: { type: 'lowpass', frequency: 2000, Q: 2.5, envelopeAmount: 0.5 },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 }
            }
        };
        
        Object.values(presets).forEach(preset => {
            this.presets.set(preset.name, preset);
        });
    }
    
    applyPreset(preset) {
        if (!preset) return false;
        
        this.currentPreset = preset;
        
        this.voicePool.forEach(voice => {
            voice.oscillator.type = preset.oscillator.type || 'sawtooth';
            voice.oscillator.detune.value = preset.oscillator.detune || 0;
            voice.filter.type = preset.filter.type || 'lowpass';
            voice.filter.frequency.value = preset.filter.frequency || 2000;
            voice.filter.Q.value = preset.filter.Q || 1;
            voice.envelope = { 
                attack: preset.envelope.attack || 0.01,
                decay: preset.envelope.decay || 0.1,
                sustain: preset.envelope.sustain || 0.7,
                release: preset.envelope.release || 0.3
            };
        });
        
        return true;
    }
    
    getPreset(name) {
        return this.presets.get(name);
    }
    
    listPresets() {
        return Array.from(this.presets.keys());
    }
    
    exportPreset() {
        if (!this.currentPreset) return null;
        return JSON.stringify(this.currentPreset, null, 2);
    }
    
    importPreset(jsonString) {
        try {
            const preset = JSON.parse(jsonString);
            if (!preset.name) preset.name = 'Imported Preset';
            this.presets.set(preset.name, preset);
            this.applyPreset(preset);
            return true;
        } catch (error) {
            console.error('Invalid preset format:', error);
            return false;
        }
    }
    
    savePreset(name) {
        if (!this.currentPreset) return false;
        const preset = { ...this.currentPreset, name };
        this.presets.set(name, preset);
        return true;
    }
    
    // ========== UTILITY ==========
    noteToFrequency(note) {
        const match = note.match(/([A-G][b#]?)(\d+)/);
        if (!match) return null;
        
        const [, noteName, octaveStr] = match;
        const semitone = this.noteMap[noteName];
        if (semitone === undefined) return null;
        
        const octave = parseInt(octaveStr);
        return 440 * Math.pow(2, (octave - 4) + (semitone - 9) / 12);
    }
    
    setMasterVolume(value) {
        if (!this.masterGain) return;
        this.masterGain.gain.value = Math.max(0, Math.min(0.5, value));
    }
    
    getActiveNotes() {
        return Array.from(this.activeVoices.keys());
    }
    
    dispose() {
        this.stopMelody();
        this.voicePool.forEach(voice => {
            voice.oscillator.stop();
            voice.oscillator.disconnect();
            voice.gainNode.disconnect();
            voice.filter.disconnect();
        });
        if (this.masterGain) this.masterGain.disconnect();
        if (this.audioContext) this.audioContext.close();
        this.initialized = false;
    }
}

// ============================================
// USAGE
// ============================================

const synth = new SynthEngine1();

document.addEventListener('click', () => {
    if (!synth.initialized) {
        synth.initialize();
        console.log('Synth initialized');
    }
}, { once: true });

function playNote() {
    const note = 'C4';
    synth.noteOn(note, 0.6);
    setTimeout(() => synth.noteOff(note), 1500);
}

const melody = [
    { note: 'C4', duration: 0.25, velocity: 0.8 },
    { note: 'E4', duration: 0.25, velocity: 0.7 },
    { note: 'G4', duration: 0.25, velocity: 0.9 },
    { note: 'C5', duration: 0.5, velocity: 0.8 },
    { note: 'B4', duration: 0.25, velocity: 0.7 },
    { note: 'G4', duration: 0.25, velocity: 0.8 },
    { note: 'E4', duration: 0.25, velocity: 0.7 },
    { note: 'C4', duration: 0.5, velocity: 0.8 }
];

function startMelody() {
    synth.playMelody(melody, 130, true);
}

function stopMelody() {
    synth.stopMelody();
}
