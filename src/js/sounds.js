/**
 * Sound System for Radioactive Froggies
 * Uses Web Audio API to generate sounds synthetically
 */

(function(isNode) {

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.muted = false;
    this.volume = 0.3;

    try {
      if (typeof localStorage !== 'undefined') {
        const savedMute = localStorage.getItem('frog_sound_muted');
        if (savedMute !== null) {
          this.muted = savedMute === 'true';
        }
      }
    } catch (e) {
      console.error('Failed to load sound preferences:', e);
    }
  }

  init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('frog_sound_muted', this.muted.toString());
      }
    } catch (e) {
      console.error('Failed to save sound preferences:', e);
    }
    return this.muted;
  }

  play(soundFunction) {
    if (this.muted) {
      return;
    }
    try {
      this.init();
      soundFunction(this.audioContext, this.volume);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }

  ribbit() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  geigerClick(intensity = 1) {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.3 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    });
  }

  explosion() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.8);
    });
  }

  success() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const startTime = now + i * 0.15;
        gain.gain.setValueAtTime(vol * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }

  failure() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const notes = [392, 369.99, 349.23, 329.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        const startTime = now + i * 0.2;
        gain.gain.setValueAtTime(vol * 0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    });
  }

  radarSweep() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 1);
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol * 0.2, now);
      gain.gain.setValueAtTime(vol * 0.2, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    });
  }

  blip() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'square';
      gain.gain.setValueAtTime(vol * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    });
  }

  achievement() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 987.77, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        const startTime = now + i * 0.08;
        gain.gain.setValueAtTime(vol * 0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    });
  }

  powerup() {
    this.play((ctx, vol) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(vol * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }
}

// Export for Node.js or browser
if (isNode) {
  module.exports = SoundManager;
} else {
  window.SoundManager = SoundManager;
}

})(typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require === 'function');
