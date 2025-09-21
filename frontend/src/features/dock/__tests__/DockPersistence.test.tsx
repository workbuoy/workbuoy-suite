import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const storeHarness = vi.hoisted(() => {
  return {
    defaultState: {
      audioCues: true,
      enableO365Panel: false,
      enableCollabPanel: false,
      enableGwsPanel: false,
      enableVismaPanel: false,
      enableDockWidget: true,
      dockInitialCollapsed: true,
      enablePeripheralCues: true,
      dockHotkeys: true,
      reducedMotion: false,
      reducedSound: false,
      systemReducedMotion: false,
      systemReducedSound: false,
      dockSize: "sm" as const,
      dockPosition: { x: 0, y: 0 },
      fastFlip: false,
    },
    state: {} as {
      audioCues: boolean;
      enableO365Panel: boolean;
      enableCollabPanel: boolean;
      enableGwsPanel: boolean;
      enableVismaPanel: boolean;
      enableDockWidget: boolean;
      dockInitialCollapsed: boolean;
      enablePeripheralCues: boolean;
      dockHotkeys: boolean;
      reducedMotion: boolean;
      reducedSound: boolean;
      systemReducedMotion: boolean;
      systemReducedSound: boolean;
      dockSize: "sm" | "md" | "lg";
      dockPosition: { x: number; y: number };
      fastFlip: boolean;
    },
    listeners: new Set<() => void>(),
  };
});

storeHarness.state = { ...storeHarness.defaultState };

vi.mock("@/store/settings", () => {
  const React = require("react");

  const shallowEqual = (a: unknown, b: unknown) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) {
      return false;
    }
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      const aValue = (a as Record<string, unknown>)[key];
      const bValue = (b as Record<string, unknown>)[key];
      if (!Object.is(aValue, bValue)) {
        return false;
      }
    }
    return true;
  };

  const notify = () => {
    for (const listener of storeHarness.listeners) {
      listener();
    }
  };

  const applyPartial = (partial: Partial<typeof storeHarness.state>) => {
    storeHarness.state = { ...storeHarness.state, ...partial };
    notify();
  };

  const useSettings = <T,>(selector: (state: typeof storeHarness.state) => T): T => {
    const selectorRef = React.useRef(selector);
    selectorRef.current = selector;

    const [snapshot, setSnapshot] = React.useState(() => selector(storeHarness.state));

    React.useEffect(() => {
      const handle = () => {
        const next = selectorRef.current(storeHarness.state);
        setSnapshot((prev) => (shallowEqual(prev, next) ? prev : next));
      };
      storeHarness.listeners.add(handle);
      handle();
      return () => {
        storeHarness.listeners.delete(handle);
      };
    }, []);

    return snapshot;
  };

  const setDockSize = (size: "sm" | "md" | "lg") => {
    applyPartial({ dockSize: size });
  };

  const setDockPosition = (position: { x: number; y: number }) => {
    applyPartial({ dockPosition: { x: position.x, y: position.y } });
  };

  const resetDockLayout = () => {
    applyPartial({
      dockSize: storeHarness.defaultState.dockSize,
      dockPosition: { ...storeHarness.defaultState.dockPosition },
    });
  };

  const setSetting = (key: keyof typeof storeHarness.state, value: boolean) => {
    applyPartial({ [key]: value } as Partial<typeof storeHarness.state>);
  };

  const settingsStore = {
    getState: () => storeHarness.state,
    set: setSetting,
    reset: () => {
      storeHarness.state = { ...storeHarness.defaultState };
      notify();
    },
  };

  return {
    useSettings,
    setDockSize,
    setDockPosition,
    resetDockLayout,
    settingsStore,
  };
});

import DockWidget from "../DockWidget";
import {
  settingsStore,
  resetDockLayout,
  setDockSize,
  setDockPosition,
} from "@/store/settings";

vi.mock("@/core/ActiveContext", () => ({
  ActiveContextProvider: ({ children }: { children: React.ReactNode }) => children,
  useActiveContext: () => ({
    timeOfDay: "morning" as const,
    selectedEntity: null,
    recentIntents: [],
    setSelectedEntity: () => {},
    pushIntent: () => {},
  }),
}));

describe("DockWidget persistence", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    settingsStore.reset();
  });

  async function findFlipCard() {
    return await waitFor(() => {
      const element = document.querySelector<HTMLDivElement>('[data-testid="flip-card"]');
      if (!element) {
        throw new Error("flip card not ready");
      }
      return element;
    });
  }

  it("persists size and position across mounts and resets to defaults", async () => {
    if (!window.PointerEvent) {
      class PointerEventPolyfill extends MouseEvent {
        pointerId: number;
        constructor(type: string, params: PointerEventInit & { pointerId: number }) {
          super(type, params);
          this.pointerId = params.pointerId;
        }
      }
      // @ts-expect-error polyfill assignment
      window.PointerEvent = PointerEventPolyfill;
    }

    act(() => {
      setDockSize("md");
      setDockPosition({ x: 48, y: -16 });
      settingsStore.set("dockInitialCollapsed", false);
    });
    const persistedRender = render(<DockWidget front={<div>Front</div>} back={<div>Back</div>} />);
    const persistedCard = await findFlipCard();
    expect(persistedCard.getAttribute("data-size")).toBe("md");
    const persistedPanel = document.querySelector<HTMLElement>(".wb-dock__panel");
    expect(persistedPanel?.style.transform).toContain("48px");
    expect(persistedPanel?.style.transform).toContain("-16px");
    persistedRender.unmount();
    cleanup();

    act(() => {
      settingsStore.reset();
      settingsStore.set("dockInitialCollapsed", false);
    });
    const interactiveRender = render(<DockWidget front={<div>Front</div>} back={<div>Back</div>} />);
    const flipCard = await findFlipCard();
    expect(flipCard.getAttribute("data-size")).toBe("sm");

    const interactiveCard = flipCard.querySelector<HTMLElement>(".flip-card");
    expect(interactiveCard).toBeTruthy();
    interactiveCard!.focus();
    fireEvent.keyDown(interactiveCard!, { key: "ArrowRight", shiftKey: true });
    await waitFor(() => {
      expect(settingsStore.getState().dockSize).toBe("md");
    });

    const panel = document.querySelector<HTMLElement>(".wb-dock__panel");
    expect(panel).toBeTruthy();
    panel!.setPointerCapture = () => {};
    panel!.releasePointerCapture = () => {};
    act(() => {
      panel!.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 1,
          clientX: 100,
          clientY: 120,
          button: 0,
          bubbles: true,
        }),
      );
    });
    act(() => {
      panel!.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX: 160,
          clientY: 90,
          bubbles: true,
        }),
      );
    });
    act(() => {
      panel!.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 1,
          clientX: 160,
          clientY: 90,
          bubbles: true,
        }),
      );
    });
    await waitFor(() => {
      expect(settingsStore.getState().dockPosition).toEqual({ x: 60, y: -30 });
    });

    interactiveRender.unmount();
    cleanup();

    act(() => {
      resetDockLayout();
    });
    expect(settingsStore.getState().dockSize).toBe("sm");
    expect(settingsStore.getState().dockPosition).toEqual({ x: 0, y: 0 });
    cleanup();
  });
});
