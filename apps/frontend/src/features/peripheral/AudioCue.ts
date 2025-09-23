export type AudioCueName = 'success' | 'error';

type AudioCueOptions = {
  contextFactory?: () => AudioContext | undefined;
};

const reduceQueries = [
  '(prefers-reduced-motion: reduce)',
  '(prefers-reduced-transparency: reduce)',
  '(prefers-reduced-sound: reduce)',
];

export function prefersReducedAudio(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return reduceQueries.some((query) => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  });
}

export class AudioCue {
  private context?: AudioContext;
  private enabled = false;
  private readonly options: AudioCueOptions;
  private reduced = prefersReducedAudio();

  constructor(options: AudioCueOptions = {}) {
    this.options = options;
    if (typeof window !== 'undefined') {
      reduceQueries.forEach((query) => {
        try {
          const mediaQuery = window.matchMedia(query);
          const listener = () => {
            this.reduced = prefersReducedAudio();
          };
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', listener);
          } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(listener);
          }
        } catch {
          /* noop */
        }
      });
    }
  }

  private ensureContext(): AudioContext | undefined {
    if (this.context) return this.context;
    const factory = this.options.contextFactory;
    if (factory) {
      this.context = factory();
    } else if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.context = new window.AudioContext();
    }
    return this.context;
  }

  setEnabled(next: boolean) {
    this.enabled = next;
    if (!next && this.context) {
      try {
        this.context.close();
      } catch {
        /* ignore */
      }
      this.context = undefined;
    }
  }

  play(name: AudioCueName) {
    if (!this.enabled || this.reduced) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const { frequency, type } = this.resolveSettings(name);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.45);
  }

  private resolveSettings(name: AudioCueName) {
    if (name === 'success') {
      return { frequency: 660, type: 'sine' as OscillatorType };
    }
    return { frequency: 220, type: 'triangle' as OscillatorType };
  }
}

export const audioCue = new AudioCue();
