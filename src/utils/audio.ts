/**
 * Web Audio API Synthesizer & Audio Player for SAKINA
 * Plays authentic uploaded MP3 Adhan audio files with seamless Web Audio Maqam synthesis fallback.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentAdhanOscillators: OscillatorNode[] = [];
  private currentAdhanGains: GainNode[] = [];
  private activeAudio: HTMLAudioElement | null = null;
  private isPlayingAdhan: boolean = false;
  private onAdhanProgressCallback: ((progress: number, elapsed: number, totalDuration: number) => void) | null = null;
  private adhanInterval: any = null;
  private activeUrl: string | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Gentle tactile click/tick for Tasbih and Dhikr counting
   */
  playTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(396, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio playback restrictions fallback
    }
  }

  /**
   * Peaceful harmonious chime for target completion
   */
  playCompletionChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [528, 660, 792];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.3);
      });
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Short gentle pre-prayer chime (15-min warning)
   */
  playPrePrayerReminderChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25]; // A major tranquil triad
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = ctx.currentTime + idx * 0.18;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.16, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.9);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Salawat reminder chime (Gentle harmonic bell)
   */
  playSalawatChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C major spiritual ascent
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startTime = ctx.currentTime + idx * 0.14;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Stop any currently running Adhan playback (both audio element & synthesizer)
   */
  stopAdhan() {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
    }

    this.currentAdhanOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.currentAdhanOscillators = [];
    this.currentAdhanGains = [];
    this.isPlayingAdhan = false;
    this.activeUrl = null;

    if (this.adhanInterval) {
      clearInterval(this.adhanInterval);
      this.adhanInterval = null;
    }
    if (this.onAdhanProgressCallback) {
      this.onAdhanProgressCallback(0, 0, 0);
    }
  }

  getIsPlayingAdhan(): boolean {
    return this.isPlayingAdhan;
  }

  getActiveUrl(): string | null {
    return this.activeUrl;
  }

  /**
   * Play genuine verified Adhan audio file with progress tracking and error reporting.
   * Does not substitute different recordings or synthetic tones on failure.
   */
  playAdhan(
    audioUrl?: string,
    onProgress?: (progress: number, elapsed: number, totalDuration: number) => void,
    onError?: (err: any) => void
  ) {
    this.stopAdhan();

    if (!audioUrl) {
      if (onError) onError(new Error('No genuine audio URL provided'));
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;
      this.activeUrl = audioUrl;
      this.isPlayingAdhan = true;
      this.onAdhanProgressCallback = onProgress || null;

      audio.ontimeupdate = () => {
        if (audio.duration && this.onAdhanProgressCallback) {
          const pct = (audio.currentTime / audio.duration) * 100;
          this.onAdhanProgressCallback(pct, Math.floor(audio.currentTime), Math.floor(audio.duration));
        }
      };

      audio.onended = () => {
        this.stopAdhan();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        this.stopAdhan();
        if (onError) onError(e);
      };

      audio.play().catch((err) => {
        console.warn('Audio autoplay restricted or load failed:', err);
        this.stopAdhan();
        if (onError) onError(err);
      });
    } catch (err) {
      console.warn('Audio initialization error:', err);
      this.stopAdhan();
      if (onError) onError(err);
    }
  }

  /**
   * Synthesize Maqam-based Adhan melody (reliable fallback)
   */
  playAdhanChime(
    baseFreq: number = 440,
    onProgress?: (progress: number, elapsed: number, totalDuration: number) => void
  ) {
    this.stopAdhan();

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.isPlayingAdhan = true;
      this.onAdhanProgressCallback = onProgress || null;

      const f1 = baseFreq;
      const f2 = baseFreq * (9 / 8);
      const f3 = baseFreq * (5 / 4);
      const f4 = baseFreq * (4 / 3);
      const f5 = baseFreq * (3 / 2);

      const phrase = [
        { freq: f1, dur: 0.9, pause: 0.2 }, // الله
        { freq: f2, dur: 1.1, pause: 0.25 }, // أكبر
        { freq: f3, dur: 1.4, pause: 0.3 }, // الله
        { freq: f5, dur: 1.7, pause: 0.35 }, // أكبر
        { freq: f4, dur: 1.2, pause: 0.2 }, // أشهد
        { freq: f3, dur: 1.3, pause: 0.25 }, // أن لا إله
        { freq: f1, dur: 2.2, pause: 0.5 }, // إلا الله
      ];

      const totalDuration = phrase.reduce((acc, p) => acc + p.dur + p.pause, 0);
      let currentTimeOffset = 0;
      let startRealTime = Date.now();

      phrase.forEach((item) => {
        const startTime = ctx.currentTime + currentTimeOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + item.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + item.dur);

        this.currentAdhanOscillators.push(osc);
        this.currentAdhanGains.push(gain);

        currentTimeOffset += item.dur + item.pause;
      });

      this.adhanInterval = setInterval(() => {
        const elapsedSec = (Date.now() - startRealTime) / 1000;
        const pct = Math.min(100, (elapsedSec / totalDuration) * 100);

        if (this.onAdhanProgressCallback) {
          this.onAdhanProgressCallback(pct, Math.floor(elapsedSec), Math.floor(totalDuration));
        }

        if (elapsedSec >= totalDuration) {
          this.stopAdhan();
        }
      }, 100);
    } catch (err) {
      console.warn('Adhan audio synthesis warning:', err);
      this.isPlayingAdhan = false;
    }
  }
}

export const soundManager = new AudioSynthesizer();
