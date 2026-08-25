/**
 * WarmWebAudioSynth
 *
 * Small, UI-free polyphonic Web Audio subtractive synthesizer.
 * ES module. No dependencies.
 */

const NOTE_NAMES = new Map([
  ["c", 0], ["c#", 1], ["db", 1], ["d", 2], ["d#", 3], ["eb", 3],
  ["e", 4], ["f", 5], ["f#", 6], ["gb", 6], ["g", 7], ["g#", 8],
  ["ab", 8], ["a", 9], ["a#", 10], ["bb", 10], ["b", 11],
]);

const DEFAULT_PRESETS = {
  warmKeys: {
    name: "Warm Keys",
    master: 0.72,
    osc1: { type: "sawtooth", level: 0.48, detune: -4 },
    osc2: { type: "triangle", level: 0.28, detune: 5 },
    noise: { level: 0.018, color: 0.35 },
    filter: { cutoff: 1850, resonance: 0.7, keyTrack: 0.28, envAmount: 1250 },
    amp: { attack: 0.012, decay: 0.22, sustain: 0.68, release: 0.42 },
    filterEnv: { attack: 0.008, decay: 0.28, sustain: 0.12, release: 0.28 },
    glide: 0.018,
    stereo: 0.12,
  },

  softPad: {
    name: "Soft Pad",
    master: 0.62,
    osc1: { type: "sawtooth", level: 0.34, detune: -9 },
    osc2: { type: "triangle", level: 0.30, detune: 9 },
    noise: { level: 0.006, color: 0.2 },
    filter: { cutoff: 1250, resonance: 0.35, keyTrack: 0.16, envAmount: 900 },
    amp: { attack: 0.55, decay: 0.55, sustain: 0.76, release: 1.25 },
    filterEnv: { attack: 0.35, decay: 0.7, sustain: 0.35, release: 0.8 },
    glide: 0.06,
    stereo: 0.22,
  },

  mellowBass: {
    name: "Mellow Bass",
    master: 0.72,
    osc1: { type: "sawtooth", level: 0.46, detune: -3 },
    osc2: { type: "sine", level: 0.34, detune: 0 },
    noise: { level: 0.004, color: 0.15 },
    filter: { cutoff: 620, resonance: 1.0, keyTrack: 0.18, envAmount: 780 },
    amp: { attack: 0.008, decay: 0.16, sustain: 0.72, release: 0.22 },
    filterEnv: { attack: 0.004, decay: 0.16, sustain: 0.18, release: 0.2 },
    glide: 0.025,
    stereo: 0.05,
  },

  pluck: {
    name: "Warm Pluck",
    master: 0.68,
    osc1: { type: "sawtooth", level: 0.42, detune: -5 },
    osc2: { type: "triangle", level: 0.22, detune: 7 },
    noise: { level: 0.012, color: 0.55 },
    filter: { cutoff: 2100, resonance: 1.5, keyTrack: 0.2, envAmount: 2600 },
    amp: { attack: 0.004, decay: 0.32, sustain: 0.10, release: 0.3 },
    filterEnv: { attack: 0.001, decay: 0.22, sustain: 0.08, release: 0.18 },
    glide: 0.01,
    stereo: 0.14,
  },
};

const DEFAULT_PRESET = DEFAULT_PRESETS.warmKeys;

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x));
}

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function noteToMidi(note) {
  if (typeof note === "number") return note;
  if (typeof note !== "string") throw new TypeError("note must be MIDI number or note name");

  const m = note.trim().toLowerCase().match(/^([a-g](?:#|b)?)(-?\d+)$/);
  if (!m || !NOTE_NAMES.has(m[1])) {
    throw new Error(`Invalid note name: ${note}`);
  }
  return NOTE_NAMES.get(m[1]) + (Number(m[2]) + 1) * 12;
}

function normalizeNote(note) {
  if (typeof note === "number") return note;
  return noteToMidi(note);
}

function deepMerge(base, patch) {
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(patch || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) &&
        out[key] && typeof out[key] === "object") {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

class Voice {
  constructor(synth, midi, velocity, when, id) {
    this.synth = synth;
    this.ctx = synth.ctx;
    this.id = id;
    this.midi = midi;
    this.velocity = clamp(velocity, 0, 1);
    this.released = false;

    const p = synth.params;
    const t = Math.max(when, this.ctx.currentTime);
    const hz = midiToHz(midi);
    const keyTrack = Math.pow(2, ((midi - 60) / 12) * p.filter.keyTrack);
    const cutoff = clamp(p.filter.cutoff * keyTrack, 40, 18000);
    const envPeak = clamp(cutoff + p.filter.envAmount, 40, 19000);

    this.output = this.ctx.createGain();
    this.output.gain.setValueAtTime(0.0001, t);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.setValueAtTime(p.filter.resonance, t);
    this.filter.frequency.setValueAtTime(cutoff, t);

    this.pan = this.ctx.createStereoPanner();
    const spread = (Math.random() * 2 - 1) * p.stereo;
    this.pan.pan.setValueAtTime(spread, t);

    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();

    this.osc1.type = p.osc1.type;
    this.osc2.type = p.osc2.type;
    this.osc1.frequency.setValueAtTime(hz, t);
    this.osc2.frequency.setValueAtTime(hz, t);
    this.osc1.detune.setValueAtTime(p.osc1.detune, t);
    this.osc2.detune.setValueAtTime(p.osc2.detune, t);

    this.g1 = this.ctx.createGain();
    this.g2 = this.ctx.createGain();
    this.g1.gain.setValueAtTime(p.osc1.level, t);
    this.g2.gain.setValueAtTime(p.osc2.level, t);

    this.osc1.connect(this.g1).connect(this.filter);
    this.osc2.connect(this.g2).connect(this.filter);

    // Very low-level filtered noise adds transient texture without making
    // the default patches obviously noisy.
    this.noise = null;
    this.noiseGain = null;
    if (p.noise.level > 0) {
      const buffer = synth.noiseBuffer();
      this.noise = this.ctx.createBufferSource();
      this.noise.buffer = buffer;
      this.noise.loop = true;
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(p.noise.level, t);
      this.noise.connect(this.noiseGain).connect(this.filter);
      this.noise.start(t);
    }

    this.filter.connect(this.pan).connect(this.output);
    this.output.connect(synth.voiceBus);

    const a = Math.max(0.001, p.amp.attack);
    const d = Math.max(0.001, p.amp.decay);
    const peak = clamp(this.velocity, 0.0001, 1);

    this.output.gain.cancelScheduledValues(t);
    this.output.gain.setValueAtTime(0.0001, t);
    this.output.gain.linearRampToValueAtTime(peak, t + a);
    this.output.gain.linearRampToValueAtTime(
      Math.max(0.0001, peak * p.amp.sustain),
      t + a + d
    );

    const fa = Math.max(0.001, p.filterEnv.attack);
    const fd = Math.max(0.001, p.filterEnv.decay);
    this.filter.frequency.cancelScheduledValues(t);
    this.filter.frequency.setValueAtTime(cutoff, t);
    this.filter.frequency.linearRampToValueAtTime(envPeak, t + fa);
    this.filter.frequency.linearRampToValueAtTime(
      clamp(cutoff + p.filter.envAmount * p.filterEnv.sustain, 40, 19000),
      t + fa + fd
    );

    this.osc1.start(t);
    this.osc2.start(t);
    this.startedAt = t;
  }

  release(when = this.ctx.currentTime, forced = false) {
    if (this.released) return;
    this.released = true;

    const p = this.synth.params;
    const t = Math.max(when, this.ctx.currentTime);
    const r = forced ? 0.015 : Math.max(0.008, p.amp.release);
    const fr = forced ? 0.015 : Math.max(0.008, p.filterEnv.release);

    const g = this.output.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.exponentialRampToValueAtTime(0.0001, t + r);

    const f = this.filter.frequency;
    f.cancelScheduledValues(t);
    f.setValueAtTime(Math.max(40, f.value), t);
    f.exponentialRampToValueAtTime(40, t + fr);

    const stopAt = t + Math.max(r, fr) + 0.03;
    try {
      this.osc1.stop(stopAt);
      this.osc2.stop(stopAt);
      if (this.noise) this.noise.stop(stopAt);
    } catch (_) {}

    this.cleanupTimer = setTimeout(() => this.dispose(), Math.ceil((stopAt - this.ctx.currentTime) * 1000) + 50);
  }

  dispose() {
    try { this.osc1.disconnect(); } catch (_) {}
    try { this.osc2.disconnect(); } catch (_) {}
    try { this.filter.disconnect(); } catch (_) {}
    try { this.pan.disconnect(); } catch (_) {}
    try { this.output.disconnect(); } catch (_) {}
    if (this.noise) {
      try { this.noise.disconnect(); } catch (_) {}
    }
    this.synth.voices.delete(this.id);
  }
}

export class WarmWebAudioSynth {
  constructor(audioContext, options = {}) {
    if (!audioContext) throw new TypeError("WarmWebAudioSynth requires an AudioContext");

    this.ctx = audioContext;
    this.params = structuredClone(DEFAULT_PRESET);
    this.voices = new Map();
    this.nextVoiceId = 1;
    this.scheduled = new Set();

    this.voiceBus = this.ctx.createGain();
    this.voiceBus.gain.value = 1;

    // Gentle saturation/soft clipping, followed by a compressor.
    this.saturator = this.ctx.createWaveShaper();
    this.saturator.curve = this.makeWarmCurve(1024, 1.8);
    this.saturator.oversample = "2x";

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 2.2;
    this.compressor.attack.value = 0.008;
    this.compressor.release.value = 0.18;

    this.output = this.ctx.createGain();
    this.output.gain.value = this.params.master;

    this.voiceBus.connect(this.saturator)
      .connect(this.compressor)
      .connect(this.output);

    if (options.destination !== false) {
      this.output.connect(options.destination || this.ctx.destination);
    }

    this._noiseBuffer = null;
  }

  makeWarmCurve(n, amount) {
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / (n - 1) - 1;
      curve[i] = Math.tanh(amount * x) / Math.tanh(amount);
    }
    return curve;
  }

  noiseBuffer() {
    if (this._noiseBuffer) return this._noiseBuffer;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * 0.25));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let x = 0;
    // Slightly correlated noise is less "white" and works better as a
    // subtle analog-style transient layer.
    for (let i = 0; i < length; i++) {
      x = x * 0.985 + (Math.random() * 2 - 1) * 0.15;
      data[i] = x;
    }
    this._noiseBuffer = buffer;
    return buffer;
  }

  async start() {
    if (this.ctx.state !== "running") await this.ctx.resume();
    return this;
  }

  connect(destination) {
    this.output.connect(destination);
    return this;
  }

  disconnect() {
    this.output.disconnect();
    return this;
  }

  set(path, value) {
    const parts = String(path).split(".");
    let target = this.params;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in target)) throw new Error(`Unknown parameter: ${path}`);
      target = target[parts[i]];
    }
    const key = parts.at(-1);
    if (!(key in target)) throw new Error(`Unknown parameter: ${path}`);
    target[key] = value;

    if (path === "master") {
      this.output.gain.setTargetAtTime(clamp(value, 0, 1), this.ctx.currentTime, 0.008);
    }
    return this;
  }

  setMany(values) {
    for (const [path, value] of Object.entries(values)) this.set(path, value);
    return this;
  }

  get(path) {
    return String(path).split(".").reduce((obj, key) => obj?.[key], this.params);
  }

  getParameters() {
    return structuredClone(this.params);
  }

  applyPreset(preset) {
    this.params = deepMerge(DEFAULT_PRESET, preset);
    this.output.gain.setTargetAtTime(
      clamp(this.params.master, 0, 1),
      this.ctx.currentTime,
      0.008
    );
    return this;
  }

  loadPreset(nameOrPreset) {
    if (typeof nameOrPreset === "string") {
      const preset = DEFAULT_PRESETS[nameOrPreset];
      if (!preset) throw new Error(`Unknown preset: ${nameOrPreset}`);
      return this.applyPreset(preset);
    }
    return this.applyPreset(nameOrPreset);
  }

  exportPreset() {
    return JSON.stringify(this.params, null, 2);
  }

  importPreset(json) {
    const preset = typeof json === "string" ? JSON.parse(json) : json;
    return this.applyPreset(preset);
  }

  listPresets() {
    return Object.keys(DEFAULT_PRESETS);
  }

  noteOn(note, options = {}) {
    const midi = normalizeNote(note);
    const velocity = options.velocity ?? 0.8;
    const when = options.time ?? this.ctx.currentTime;
    const voice = new Voice(this, midi, velocity, when, this.nextVoiceId++);
    this.voices.set(voice.id, voice);

    if (options.id != null) {
      voice.publicId = options.id;
    }

    return voice.publicId ?? voice.id;
  }

  noteOff(id, time) {
    const matches = [];
    for (const voice of this.voices.values()) {
      if (voice.id === id || voice.publicId === id) matches.push(voice);
    }
    for (const voice of matches) voice.release(time);
    return this;
  }

  allNotesOff(time = this.ctx.currentTime) {
    for (const voice of this.voices.values()) voice.release(time);
    return this;
  }

  /**
   * Play a melody/chord sequence.
   *
   * melody:
   * [
   *   { note: "C4", duration: 0.4, velocity: 0.8 },
   *   { note: "E4", duration: 0.4 },
   *   { note: ["G4", "B4"], duration: 0.8 }
   * ]
   *
   * `time` is an AudioContext time. `gap` is the fraction of each duration
   * during which the note remains held; 0.9 gives a small release gap.
   */
  playMelody(melody, options = {}) {
    const start = options.time ?? this.ctx.currentTime;
    const tempo = options.tempo ?? 120;
    const beat = 60 / tempo;
    const defaultGap = options.gate ?? 0.9;
    let cursor = start;
    const ids = [];

    for (const event of melody) {
      const durationBeats = event.beats ?? (event.duration != null ? event.duration / beat : 1);
      const duration = durationBeats * beat;
      const gate = event.gate ?? defaultGap;
      const noteTime = cursor + (event.offset ?? 0);

      const notes = Array.isArray(event.note) ? event.note : [event.note];
      const eventIds = notes.map((note, i) =>
        this.noteOn(note, {
          velocity: event.velocity ?? options.velocity ?? 0.8,
          time: noteTime,
          id: options.idPrefix != null ? `${options.idPrefix}:${ids.length}:${i}` : undefined,
        })
      );

      const offTime = noteTime + duration * clamp(gate, 0.01, 1.5);
      for (const id of eventIds) {
        this.noteOff(id, offTime);
        ids.push(id);
      }

      cursor += duration;
    }

    return { ids, endTime: cursor };
  }

  static presets() {
    return structuredClone(DEFAULT_PRESETS);
  }

  static noteToMidi(note) {
    return noteToMidi(note);
  }

  static midiToHz(midi) {
    return midiToHz(midi);
  }
}

export { DEFAULT_PRESETS };
