// Procedural Web Audio API Synthesizer for A Expedição dos Guardiões dos Ângulos
// Zero external MP3/WAV dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  }

  public playVertexSelect(isRightAngle: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = isRightAngle ? [523.25, 659.25, 783.99] : [440, 554.37];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isRightAngle ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.055);
      gain.gain.setValueAtTime(0.11, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.24);
    });
  }

  public playToolEquip() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.16, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.34);
    });
  }

  public playPortalActivate() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.68);
    });
  }

  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.22);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Directional Right-Angle Proximity Audio Radar & Subtle Tactile Cues
  private lastSonarPingTime = 0;
  private lastHoverChimeTime = 0;

  /**
   * Plays a distinct, gentle harmonic chime when directly hovering/entering near a 90° right angle.
   * Gives instant tactile feedback so the student can "feel" the square shape before clicking.
   */
  public playRightAngleHoverChime(pan: number = 0) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastHoverChimeTime < 0.22) return;
    this.lastHoverChimeTime = now;

    // Dual-tone harmonic interval: C6 (1046.5Hz) & G6 (1567.98Hz) - classic pure square/right-angle bell
    const notes = [1046.5, 1567.98];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);

      gain.gain.setValueAtTime(0.045, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.28);

      if (typeof ctx.createStereoPanner === 'function') {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.3);
    });
  }

  /**
   * Plays subtle, clear directional audio chimes as the cursor nears a right angle (90°).
   * @param proximity Normalized value 0 (far) to 1 (directly on the 90° right angle vertex)
   * @param pan Stereo panning -1 (left of cursor) to 1 (right of cursor)
   */
  public updateRightAngleProximitySonar(proximity: number, pan: number = 0) {
    if (this.muted) return;
    if (proximity <= 0.04) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ping interval: farther = slower gentle pulses (540ms), closer = rapid crystalline pulses (90ms)
    const pingInterval = 0.54 - proximity * 0.44;
    if (now - this.lastSonarPingTime < pingInterval) {
      return;
    }
    this.lastSonarPingTime = now;

    // Harmonic crystalline frequencies for 90° Right Angle chime (Key of C / E / G chime)
    // When far: warm lower fundamental (523Hz C5); when close: radiant bell harmony (1046Hz C6 + 1318Hz E6)
    const baseFreq = 523.25 + proximity * 523.25; // C5 to C6

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = proximity > 0.7 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);

    // Subtle, gentle volume curve to guide without being intrusive
    const volume = 0.025 + proximity * 0.075;
    const duration = 0.09 + proximity * 0.12;

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Stereo Panner for authentic directional orientation
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + duration + 0.02);

    // Extra harmonic bell overtone when student is extremely close (direct hit on 90°)
    if (proximity > 0.75) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now + 0.015); // Perfect fifth harmonic
      gain2.gain.setValueAtTime(volume * 0.4, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.015);
      osc2.stop(now + duration + 0.03);
    }
  }
}

export const sound = new SoundManager();
