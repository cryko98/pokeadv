/**
 * Dynamic Synth Web Audio Engine
 * Generates arcade-style sound effects completely client-side.
 * Resolves any browser autoplay issues smoothly by initializing on first user tap.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBgmSession: { stop: () => void } | null = null;
  private bgmPlaying: boolean = false;

  constructor() {
    // Lazy loaded to handle browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentBgmSession) {
      this.stopBgm();
    } else if (!muted && this.bgmPlaying && !this.currentBgmSession) {
      this.startBgm();
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public playShoot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playBossHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5 arpeggio
    notes.forEach((freq, idx) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + idx * 0.08);
      g.gain.setValueAtTime(0.1, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
      
      o.connect(g);
      g.connect(this.ctx!.destination);
      
      o.start(now + idx * 0.08);
      o.stop(now + idx * 0.08 + 0.15);
    });
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    o.type = 'sine';
    o.frequency.setValueAtTime(987.77, now); // B5
    o.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    o.connect(g);
    g.connect(this.ctx.destination);

    o.start(now);
    o.stop(now + 0.25);
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392, 349, 311, 220]; // G4, F4, Eb4, A3 descent
    notes.forEach((freq, idx) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + idx * 0.15);
      g.gain.setValueAtTime(0.15, now + idx * 0.15);
      g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.25);
      
      o.connect(g);
      g.connect(this.ctx!.destination);
      
      o.start(now + idx * 0.15);
      o.stop(now + idx * 0.15 + 0.25);
    });
  }

  public playBossIntro() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    o1.type = 'sawtooth';
    o1.frequency.setValueAtTime(80, now);
    o1.frequency.linearRampToValueAtTime(60, now + 1.0);

    o2.type = 'sawtooth';
    o2.frequency.setValueAtTime(81, now); // Slightly detuned for fatness
    o2.frequency.linearRampToValueAtTime(61, now + 1.0);

    g.gain.setValueAtTime(0.25, now);
    g.gain.linearRampToValueAtTime(0.01, now + 1.0);

    o1.connect(g);
    o2.connect(g);
    g.connect(this.ctx.destination);

    o1.start(now);
    o1.stop(now + 1.0);
    o2.start(now);
    o2.stop(now + 1.0);
  }

  public startBgm() {
    this.bgmPlaying = true;
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Direct synth sequence play
    const ctx = this.ctx;
    let scheduleTime = ctx.currentTime;
    const stepDuration = 0.2; // 120BPM
    let stepCount = 0;

    // Pikachu / 8-bit chip bass sequence
    const notes = [
      110, 110, 146, 146, 165, 165, 110, 130,
      110, 110, 146, 146, 165, 196, 220, 165
    ]; // G, G, C, C, D, D, G, Bb chip arpeggios

    let isPlaying = true;

    const playStep = () => {
      if (!isPlaying || this.isMuted) return;
      
      const now = ctx.currentTime;
      // Schedule ahead to avoid glitches
      while (scheduleTime < now + 0.1) {
        const noteFreq = notes[stepCount % notes.length];
        
        // Play bass note
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, scheduleTime);
        
        gain.gain.setValueAtTime(0.04, scheduleTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduleTime + stepDuration - 0.02);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduleTime);
        osc.stop(scheduleTime + stepDuration);

        // Subtly schedule tiny high retro chirps on some steps for arcade mood
        if (stepCount % 4 === 1 || stepCount % 8 === 7) {
          const chipOsc = ctx.createOscillator();
          const chipGain = ctx.createGain();
          chipOsc.type = 'sine';
          chipOsc.frequency.setValueAtTime(noteFreq * 4, scheduleTime); // 2 Octaves up
          
          chipGain.gain.setValueAtTime(0.02, scheduleTime);
          chipGain.gain.exponentialRampToValueAtTime(0.001, scheduleTime + 0.08);
          
          chipOsc.connect(chipGain);
          chipGain.connect(ctx.destination);
          chipOsc.start(scheduleTime);
          chipOsc.stop(scheduleTime + 0.08);
        }

        scheduleTime += stepDuration;
        stepCount++;
      }
      setTimeout(playStep, 50);
    };

    playStep();

    this.currentBgmSession = {
      stop: () => {
        isPlaying = false;
        this.currentBgmSession = null;
      }
    };
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.currentBgmSession) {
      this.currentBgmSession.stop();
    }
  }

  public toggleBgm() {
    if (this.currentBgmSession) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }
}

export const audioEngine = new AudioEngine();
