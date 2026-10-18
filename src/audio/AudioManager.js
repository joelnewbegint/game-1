/**
 * Aethrava - Procedural Web Audio Sound Engine
 * Generates dynamic volcanic ambient music drone, lava crackle/rumble,
 * and puzzle/quest acoustic chimes without requiring external audio asset downloads.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.8;
    this.isInitialized = false;

    // Audio nodes
    this.masterGain = null;
    this.droneGain = null;
    this.crackleGain = null;
    this.rumbleGain = null;

    // Oscillators
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.rumbleOsc = null;
    this.noiseNode = null;

    // Chords (Volcanic Minor Majesty in D: D2, A2, F3, C4)
    this.chordFrequencies = [
      [73.42, 110.00, 174.61], // Dm
      [87.31, 130.81, 174.61], // F
      [58.27, 116.54, 174.61], // Bb
      [55.00, 110.00, 164.81]  // A
    ];
    this.chordIndex = 0;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this.startAmbient();
    } catch (e) {
      console.warn('[AudioManager] Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(percent) {
    this.masterVolume = Math.max(0, Math.min(1, percent / 100));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  startAmbient() {
    if (!this.ctx) return;
    this.resume();

    // 1. Volcanic Drone (Warm analog low-passed synth pad)
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(73.42, this.ctx.currentTime); // D2

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(110.00, this.ctx.currentTime); // A2

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();

    // Subtle chord progression cycling every 12 seconds
    setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      this.chordIndex = (this.chordIndex + 1) % this.chordFrequencies.length;
      const [f1, f2] = this.chordFrequencies[this.chordIndex];
      const now = this.ctx.currentTime;
      this.droneOsc1.frequency.setTargetAtTime(f1, now, 2.5);
      this.droneOsc2.frequency.setTargetAtTime(f2, now, 2.5);
    }, 12000);

    // 2. Subterranean Lava Rumble
    this.rumbleGain = this.ctx.createGain();
    this.rumbleGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(65, this.ctx.currentTime);

    this.rumbleOsc = this.ctx.createOscillator();
    this.rumbleOsc.type = 'sine';
    this.rumbleOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(this.rumbleGain);
    this.rumbleGain.connect(this.masterGain);
    this.rumbleOsc.start();

    // 3. Fire / Embers Crackle (Filtered White Noise generator)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    crackleFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.crackleGain = this.ctx.createGain();
    this.crackleGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(crackleFilter);
    crackleFilter.connect(this.crackleGain);
    this.crackleGain.connect(this.masterGain);

    whiteNoise.start();
  }

  playChime(type = 'success') {
    if (!this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    gain.connect(this.masterGain);
    osc.connect(gain);

    if (type === 'success' || type === 'puzzle') {
      // Celestial harmonic major arpeggio
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.start(now);
      osc.stop(now + 1.2);
    } else {
      // Warm gong/flame tone
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.start(now);
      osc.stop(now + 1.5);
    }
  }
}
