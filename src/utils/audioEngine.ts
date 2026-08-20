class MumbaiAudioEngine {
  private ctx: AudioContext | null = null;
  private trackGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isTrackLoopRunning = false;
  private trackInterval: number | null = null;
  private isRainRunning = false;
  private rainSource: AudioBufferSourceNode | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.trackGain = this.ctx.createGain();
      this.trackGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.trackGain.connect(this.masterGain);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch {
      // Audio context might fail before user interaction
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public playTrackClack(speedMultiplier = 1.0) {
    if (!this.ctx || !this.trackGain || this.ctx.state === 'suspended') return;

    const t = this.ctx.currentTime;
    // Characteristic bogie wheel click-clack (pair of dual metallic clicks: click-click ... click-click)
    const playClick = (time: number, freq: number, gain: number) => {
      if (!this.ctx || !this.trackGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);

      oscGain.gain.setValueAtTime(gain, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.trackGain);

      osc.start(time);
      osc.stop(time + 0.1);
    };

    // Front bogie
    playClick(t, 180, 0.5 * speedMultiplier);
    playClick(t + 0.065, 140, 0.35 * speedMultiplier);

    // Rear bogie
    playClick(t + 0.22, 160, 0.4 * speedMultiplier);
    playClick(t + 0.285, 130, 0.28 * speedMultiplier);
  }

  public startTrackSoundLoop() {
    if (this.isTrackLoopRunning) return;
    this.init();
    this.isTrackLoopRunning = true;
    
    const loop = () => {
      if (!this.isTrackLoopRunning) return;
      this.playTrackClack(1.0);
      this.trackInterval = window.setTimeout(loop, 750 + Math.random() * 80);
    };
    loop();
  }

  public stopTrackSoundLoop() {
    this.isTrackLoopRunning = false;
    if (this.trackInterval) {
      clearTimeout(this.trackInterval);
      this.trackInterval = null;
    }
  }

  // Authentic Indian Railways Dual-Tone Horn ("PAAAN-POOON" pneumatic air blast)
  public playTrainHorn() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const duration = 1.35;

    // Dual horn tones: Low ~330Hz (E4), High ~440Hz (A4)
    const tones = [330, 440, 660, 880];
    const gains = [0.4, 0.35, 0.15, 0.08];

    tones.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sawtooth + square mix creates the raspy metallic brass air horn vibration
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, t);
      // Slight pitch wobble for realistic air pressure fluctuation
      osc.frequency.linearRampToValueAtTime(freq * 1.015, t + 0.2);
      osc.frequency.linearRampToValueAtTime(freq * 0.99, t + duration * 0.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, t);
      filter.Q.setValueAtTime(2.5, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(gains[idx], t + 0.08); // fast attack
      gain.gain.setValueAtTime(gains[idx], t + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration); // natural air pressure release

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration);
    });

    // Air rush hiss
    this.playAirHiss(t, duration);
  }

  private playAirHiss(time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  // Classic Indian Railways Station Chime (Ding... Dong... Ding)
  public playStationChime(onComplete?: () => void) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0.0 }, // D5
      { freq: 739.99, time: 0.45 }, // F#5
      { freq: 880.00, time: 0.9 }, // A5
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t + note.time);

      gain.gain.setValueAtTime(0.001, t + note.time);
      gain.gain.linearRampToValueAtTime(0.28, t + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + note.time + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + note.time);
      osc.stop(t + note.time + 0.7);
    });

    if (onComplete) {
      setTimeout(onComplete, 1600);
    }
  }

  // Station Guard Whistle
  public playGuardWhistle() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2400, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2450, t); // beating frequency for shrill whistle

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.setValueAtTime(0.18, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.8);
    osc2.stop(t + 0.8);
  }

  // Monsoon Rain Generator using Web Audio noise buffer
  public startMonsoonRain() {
    if (this.isRainRunning || !this.ctx || !this.rainGain) return;
    this.init();

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      // Pink/Brownish noise for soft ambient rain
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5;
      }

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = buffer;
      this.rainSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      this.rainSource.connect(filter);
      filter.connect(this.rainGain);
      this.rainSource.start();
      this.isRainRunning = true;
    } catch {
      // Audio setup fallback
    }
  }

  public stopMonsoonRain() {
    if (this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch {
        // Ignore
      }
      this.rainSource = null;
    }
    this.isRainRunning = false;
  }

  // Thunder rumble
  public playThunder() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 2.5);
  }

  // Nokia 3310 Classic Monophonic Ringtone ("Gran Vals")
  public playNokiaRingtone() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    // E5, D5, F#4, G#4, C#5, B4, D4, E4, B4, A4, C#4, E4, A4
    const melody = [
      { f: 659.25, d: 0.14 }, // E5
      { f: 587.33, d: 0.14 }, // D5
      { f: 369.99, d: 0.28 }, // F#4
      { f: 415.30, d: 0.28 }, // G#4
      { f: 554.37, d: 0.14 }, // C#5
      { f: 493.88, d: 0.14 }, // B4
      { f: 293.66, d: 0.28 }, // D4
      { f: 329.63, d: 0.28 }, // E4
      { f: 493.88, d: 0.14 }, // B4
      { f: 440.00, d: 0.14 }, // A4
      { f: 277.18, d: 0.28 }, // C#4
      { f: 329.63, d: 0.28 }, // E4
      { f: 440.00, d: 0.55 }, // A4
    ];

    let currentT = t;
    melody.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square'; // authentic 8-bit / monophonic piezo buzzer
      osc.frequency.setValueAtTime(note.f, currentT);

      gain.gain.setValueAtTime(0.12, currentT);
      gain.gain.setValueAtTime(0.12, currentT + note.d - 0.02);
      gain.gain.linearRampToValueAtTime(0.001, currentT + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(currentT);
      osc.stop(currentT + note.d);

      currentT += note.d + 0.02;
    });
  }

  // Cutting Chai steam & clink sound
  public playChaiStallSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Glass clink
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2100, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);

    // Steam hiss
    this.playAirHiss(t + 0.05, 0.6);
  }
}

export const audioEngine = new MumbaiAudioEngine();
