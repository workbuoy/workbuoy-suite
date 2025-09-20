import { vi } from "vitest";
import { AudioCue } from "./AudioCue";

declare global {
  // eslint-disable-next-line no-var
  var matchMedia: ((query: string) => MediaQueryList) | undefined;
}

describe("AudioCue", () => {
  const createMockContext = () => {
    const start = vi.fn();
    const stop = vi.fn();
    const oscillator = {
      type: "sine" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start,
      stop,
    } as unknown as OscillatorNode;

    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    } as unknown as GainNode;

    return {
      context: {
        state: "running" as AudioContextState,
        currentTime: 0,
        createOscillator: vi.fn(() => oscillator),
        createGain: vi.fn(() => gain),
        resume: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        destination: {} as AudioDestinationNode,
      } as unknown as AudioContext,
      oscillator,
    };
  };

  beforeEach(() => {
    (global as any).matchMedia = undefined;
  });

  it("plays cue when enabled", () => {
    const mock = createMockContext();
    const cue = new AudioCue({ contextFactory: () => mock.context });
    cue.setEnabled(true);
    cue.play("success");
    expect(mock.context.createOscillator).toHaveBeenCalled();
  });

  it("does not play when disabled", () => {
    const mock = createMockContext();
    const cue = new AudioCue({ contextFactory: () => mock.context });
    cue.setEnabled(false);
    cue.play("success");
    expect(mock.context.createOscillator).not.toHaveBeenCalled();
  });

  it("respects reduced audio preference", () => {
    (global as any).matchMedia = () => ({ matches: true, addEventListener: vi.fn() }) as any;
    const mock = createMockContext();
    const cue = new AudioCue({ contextFactory: () => mock.context });
    cue.setEnabled(true);
    cue.play("success");
    expect(mock.context.createOscillator).not.toHaveBeenCalled();
  });
});
