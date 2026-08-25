// ============================================
// PROFESSIONAL WEB AUDIO SYNTHESIZER
// Sample-accurate scheduling with proper tuning
// ============================================

class SynthEngine1 {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        
        // Voice management
        this.voicePool = [];
        this.activeVoices = new Map();
        this.maxPolyphony = 16;
        this.masterGain = null;
        
        // Scheduling
        this.scheduledEvents = [];
        this.sequenceInterval = null;
        this.nextEventTime = 0;
        this.sequenceActive = false;
        
        // Presets
        this.presets = new Map();
        this.currentPreset = null;
        this.loadDefaultPresets();
        this.currentPreset = this.presets.get('Analog Lead');
        
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
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);
            
            // Initialize voice pool
            this.voicePool = [];
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
        
        // Create nodes with proper gain staging
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        // Configure with musical defaults
        oscillator.type = 'sawtooth';
        oscillator.detune.value = 0;
        
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        filter.gain.value = 1;
        
        // Signal chain
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Start oscillator (runs continuously)
        oscillator.start();
        
        return {
            oscillator,
            gainNode,
            filter,
            isActive: false,
            note: null,
            releaseTime: 0,
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.7,
                release: 0.3
            }
        };
    }
    
    // ========== SAMPLE-ACCURATE NOTE SCHEDULING ==========
    scheduleNoteOn(note, startTime, velocity = 0.8) {
        if (!this.initialized) {
            console.warn('Synth not initialized');
            return false;
        }
        
        const frequency = this.noteToFrequency(note);
        if (!frequency) return false;
        
        const voice = this.acquireVoice();
        if (!voice) return false;
        
        const now = this.audioContext.currentTime;
        const scheduleTime = Math.max(startTime, now);
        
        // Configure voice
        voice.oscillator.frequency.setValueAtTime(frequency, scheduleTime);
        voice.note = note;
        voice.isActive = true;
        voice.releaseTime = 0;
        
        // Store reference for note-off
        this.activeVoices.set(note, voice);
        
        // === ATTACK PHASE ===
        voice.gainNode.gain.cancelScheduledValues(scheduleTime);
        voice.gainNode.gain.setValueAtTime(0, scheduleTime);
        voice.gainNode.gain.linearRampToValueAtTime(
            velocity,
            scheduleTime + voice.envelope.attack
        );
        
        // === DECAY TO SUSTAIN ===
        voice.gainNode.gain.linearRampToValueAtTime(
            velocity * voice.envelope.sustain,
            scheduleTime + voice.envelope.attack + voice.envelope.decay
        );
        
        // === FILTER ENVELOPE ===
        const filterFreq = this.currentPreset?.filter?.frequency || 2000;
        const filterEnv = this.currentPreset?.filter?.envelopeAmount || 0.3;
        voice.filter.frequency.cancelScheduledValues(scheduleTime);
        voice.filter.frequency.setValueAtTime(
            filterFreq + (velocity * filterEnv * 3000),
            scheduleTime + voice.envelope.attack * 0.5
        );
        voice.filter.frequency.linearRampToValueAtTime(
            filterFreq,
            scheduleTime + voice.envelope.attack + voice.envelope.decay
        );
        
        return true;
    }
    
    scheduleNoteOff(note, releaseTime) {
        const voice = this.activeVoices.get(note);
        if (!voice) return false;
        
        const now = this.audioContext.currentTime;
        const scheduleTime = Math.max(releaseTime, now);
        
        // Cancel any pending gain changes
        voice.gainNode.gain.cancelScheduledValues(scheduleTime);
        
        // === RELEASE PHASE ===
        voice.gainNode.gain.setValueAtTime(
            voice.gainNode.gain.value,
            scheduleTime
        );
        voice.gainNode.gain.linearRampToValueAtTime(
            0,
            scheduleTime + voice.envelope.release
        );
        
        // Schedule voice deactivation after release completes
        const deactivateTime = scheduleTime + voice.envelope.release + 0.01;
        const delayMs = (deactivateTime - now) * 1000;
        
        setTimeout(() => {
            if (voice.isActive) {
                voice.isActive = false;
                voice.gainNode.gain.value = 0;
                this.activeVoices.delete(note);
            }
        }, delayMs);
        
        return true;
    }
    
    // ========== IMMEDIATE NOTE CONTROL (Legacy interface) ==========
    noteOn(note, velocity = 0.8) {
        return this.scheduleNoteOn(note, this.audioContext.currentTime, velocity);
    }
    
    noteOff(note) {
        return this.scheduleNoteOff(note, this.audioContext.currentTime);
    }
    
    // ========== VOICE ALLOCATION ==========
    acquireVoice() {
        // Find inactive voice
        for (const voice of this.voicePool) {
            if (!voice.isActive) {
                return voice;
            }
        }
        
        // Steal oldest voice
        const oldest = this.voicePool.shift();
        if (oldest.note) {
            this.activeVoices.delete(oldest.note);
            oldest.gainNode.gain.value = 0;
        }
        this.voicePool.push(oldest);
        return oldest;
    }
    
    // ========== MELODIC SEQUENCING (Sample-Accurate) ==========
    playMelody(sequence, tempo = 120, loop = false) {
        this.stopMelody();
        
        if (!sequence || sequence.length === 0) return false;
        
        this.sequenceActive = true;
        const beatDuration = 60 / tempo;
        const now = this.audioContext.currentTime;
        
        // Pre-schedule all events with sample accuracy
        let currentTime = now + 0.1; // Small buffer for safety
        
        const scheduleNext = (index) => {
            if (!this.sequenceActive) return;
            
            if (index >= sequence.length) {
                if (loop) {
                    scheduleNext(0);
                }
                return;
            }
            
            const event = sequence[index];
            
            // Schedule note on
            if (event.note) {
                const velocity = event.velocity || 0.8;
                this.scheduleNoteOn(event.note, currentTime, velocity);
                
                // Schedule note off if duration specified
                if (event.duration) {
                    const offTime = currentTime + event.duration;
                    this.scheduleNoteOff(event.note, offTime);
                }
            }
            
            // Advance time for next event
            currentTime += beatDuration;
            
            // Schedule next event in the audio thread
            const nextIndex = index + 1;
            const lookahead = 0.1; // seconds
            
            if (nextIndex < sequence.length || loop) {
                const delayMs = (currentTime - this.audioContext.currentTime - lookahead) * 1000;
                
                if (delayMs > 10) {
                    // Schedule ahead with setTimeout for efficiency
                    this.sequenceInterval = setTimeout(() => {
                        scheduleNext(nextIndex);
                    }, delayMs);
                } else {
                    // If time is too tight, schedule immediately
                    requestAnimationFrame(() => {
                        scheduleNext(nextIndex);
                    });
                }
            }
        };
        
        // Start scheduling
        scheduleNext(0);
        
        return true;
    }
    
    stopMelody() {
        this.sequenceActive = false;
        
        if (this.sequenceInterval) {
            clearTimeout(this.sequenceInterval);
            this.sequenceInterval = null;
        }
        
        // Release all active notes with proper timing
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
                filter: { type: 'lowpass', frequency: 2500, Q: 1.2, envelopeAmount: 0.4 },
                envelope: { attack: 0.015, decay: 0.12, sustain: 0.65, release: 0.35 }
            },
            'Warm Bass': {
                name: 'Warm Bass',
                oscillator: { type: 'square', detune: 0 },
                filter: { type: 'lowpass', frequency: 600, Q: 1.8, envelopeAmount: 0.15 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.15 }
            },
            'Soft Pad': {
                name: 'Soft Pad',
                oscillator: { type: 'sawtooth', detune: 4 },
                filter: { type: 'lowpass', frequency: 3500, Q: 0.8, envelopeAmount: 0.1 },
                envelope: { attack: 0.3, decay: 0.3, sustain: 0.85, release: 0.6 }
            },
            'Brass Lead': {
                name: 'Brass Lead',
                oscillator: { type: 'square', detune: 3 },
                filter: { type: 'lowpass', frequency: 1800, Q: 2.0, envelopeAmount: 0.5 },
                envelope: { attack: 0.04, decay: 0.15, sustain: 0.6, release: 0.4 }
            },
            'Pluck': {
                name: 'Pluck',
                oscillator: { type: 'sawtooth', detune: 0 },
                filter: { type: 'lowpass', frequency: 3000, Q: 2.5, envelopeAmount: 0.3 },
                envelope: { attack: 0.002, decay: 0.05, sustain: 0.3, release: 0.1 }
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
        this.masterGain.gain.linearRampToValueAtTime(
            Math.max(0, Math.min(1, value)),
            this.audioContext?.currentTime || 0
        );
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
        
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.initialized = false;
    }
}

// ============================================
// USAGE EXAMPLES
// ============================================

const synth = new SynthEngine1();

// Initialize on user gesture
document.addEventListener('click', () => {
    if (!synth.initialized) {
        synth.initialize();
        console.log('Synth initialized');
    }
}, { once: true });

// === Sample-accurate melody ===
const preciseMelody = [
    { note: 'C4', duration: 0.25, velocity: 0.8 },
    { note: 'E4', duration: 0.25, velocity: 0.7 },
    { note: 'G4', duration: 0.25, velocity: 0.9 },
    { note: 'C5', duration: 0.5, velocity: 0.8 },
    { note: 'B4', duration: 0.25, velocity: 0.7 },
    { note: 'G4', duration: 0.25, velocity: 0.8 },
    { note: 'E4', duration: 0.25, velocity: 0.7 },
    { note: 'C4', duration: 0.5, velocity: 0.8 }
];

function foo() {

  // Play with sample-accurate timing
  synth.playMelody(preciseMelody, 140, true);

  // === Preset switching ===
  synth.applyPreset(synth.getPreset('Warm Bass'));

  // === Export/Import ===
  const exported = synth.exportPreset();
  synth.importPreset(exported);
}
