import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { dockStrings } from "../strings";

vi.mock("@/core/ActiveContext", () => {
  return {
    ActiveContextProvider: ({ children }: { children: ReactNode }) => children,
    useActiveContext: () => ({
      timeOfDay: "morning" as const,
      selectedEntity: null,
      recentIntents: [],
      setSelectedEntity: () => {},
      pushIntent: () => {},
    }),
  };
});

vi.mock("@/store/settings", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  type State = {
    enableDockWidget: boolean;
    dockInitialCollapsed: boolean;
    enablePeripheralCues: boolean;
    dockHotkeys: boolean;
    dockSize: "sm" | "md" | "lg";
    dockPosition: { x: number; y: number };
    fastFlip: boolean;
  };
  const initialState: State = {
    enableDockWidget: true,
    dockInitialCollapsed: true,
    enablePeripheralCues: true,
    dockHotkeys: true,
    dockSize: "sm",
    dockPosition: { x: 0, y: 0 },
    fastFlip: false,
  };
  let state: State = { ...initialState };
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function useSettings<T>(selector: (next: State) => T): T {
    const [selected, setSelected] = React.useState(() => selector(state));
    React.useEffect(() => {
      const handler = () => setSelected(selector(state));
      listeners.add(handler);
      return () => listeners.delete(handler);
    }, [selector]);
    return selected;
  }

  function setDockSize(value: State["dockSize"]) {
    state = { ...state, dockSize: value };
    notify();
  }

  function setDockPosition(value: State["dockPosition"]) {
    state = { ...state, dockPosition: { ...value } };
    notify();
  }

  const settingsStore = {
    reset() {
      state = { ...initialState };
      notify();
    },
    set(key: keyof State, value: boolean) {
      state = { ...state, [key]: value };
      notify();
    },
    setDockSize,
    setDockPosition,
  };

  return { useSettings, settingsStore, setDockSize, setDockPosition };
});

const { settingsStore } = await import("@/store/settings");
const { default: DockWidget } = await import("../DockWidget");

const FrontStub = () => (
  <div>
    <label htmlFor="dock-front-input">Melding</label>
    <input id="dock-front-input" aria-label="Chat input" />
  </div>
);

const BackStub = () => <div>Panel</div>;

describe("DockWidget", () => {
  beforeEach(() => {
    settingsStore.reset();
  });

  function renderWidget() {
    return render(<DockWidget front={<FrontStub />} back={<BackStub />} />);
  }

  async function getFlipCardHost() {
    return waitFor(() => {
      const node = document.querySelector<HTMLElement>('[data-testid="flip-card"]');
      if (!node) throw new Error("Flip card not ready");
      return node;
    });
  }

  it("renders bubble when collapsed", () => {
    act(() => {
      settingsStore.set("dockInitialCollapsed", true);
    });
    renderWidget();
    expect(
      screen.getByRole("button", { name: dockStrings.bubble.openLabel }),
    ).toBeInTheDocument();
    expect(() => screen.getByRole("region", { name: /Workbuoy dock/i })).toThrow();
  });

  it("opens widget with Enter and exposes region role", async () => {
    act(() => {
      settingsStore.set("dockInitialCollapsed", true);
    });
    renderWidget();
    const bubble = screen.getByRole("button", { name: dockStrings.bubble.openLabel });
    await fireEvent.keyDown(bubble, { key: "Enter" });
    await screen.findByRole("region", { name: /Workbuoy dock/i });
    expect(() => screen.getByRole("dialog")).toThrow();
  });

  it("keeps focus on inputs and flips via toolbar controls", async () => {
    act(() => {
      settingsStore.set("dockInitialCollapsed", true);
    });
    renderWidget();
    const bubble = screen.getByRole("button", { name: dockStrings.bubble.openLabel });
    await fireEvent.keyDown(bubble, { key: "Enter" });

    const host = await getFlipCardHost();
    const flipInner = host.querySelector<HTMLDivElement>(".flip-card");
    expect(flipInner?.dataset.side).toBe("front");

    const input = screen.getByLabelText("Chat input");
    await fireEvent.keyDown(input, { key: " " });
    expect(flipInner?.dataset.side).toBe("front");

    const flipButton = screen.getByRole("button", { name: dockStrings.toolbar.flipToNavi });
    await fireEvent.keyDown(flipButton, { key: " " });
    expect(flipInner?.dataset.side).toBe("back");
  });

  it("resizes with shift + arrows", async () => {
    act(() => {
      settingsStore.set("dockInitialCollapsed", true);
    });
    renderWidget();
    const bubble = screen.getByRole("button", { name: dockStrings.bubble.openLabel });
    await fireEvent.keyDown(bubble, { key: "Enter" });

    const host = await getFlipCardHost();
    const flipInner = host.querySelector<HTMLDivElement>(".flip-card");
    expect(host.getAttribute("data-size")).toBe("sm");

    await fireEvent.keyDown(flipInner!, { key: "ArrowRight", shiftKey: true });
    expect(host.getAttribute("data-size")).toBe("md");

    await fireEvent.keyDown(flipInner!, { key: "ArrowLeft", shiftKey: true });
    expect(host.getAttribute("data-size")).toBe("sm");
  });

  it("opens pop out and restores focus to bubble on escape", async () => {
    act(() => {
      settingsStore.set("dockInitialCollapsed", true);
    });
    renderWidget();
    const bubble = screen.getByRole("button", { name: dockStrings.bubble.openLabel });
    await fireEvent.keyDown(bubble, { key: "Enter" });

    const popout = screen.getByRole("button", { name: dockStrings.toolbar.popout });
    await fireEvent.click(popout);
    expect(screen.getByRole("dialog", { name: dockStrings.host.title })).toBeInTheDocument();

    await fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(() => screen.getByRole("dialog")).toThrow());
    await waitFor(() => {
      const target = document.activeElement;
      const surface = document.querySelector<HTMLElement>(".wb-dock__surface");
      expect(target === bubble || target === surface).toBe(true);
    });
  });

  it("hides bubble when widget disabled", () => {
    act(() => {
      settingsStore.set("enableDockWidget", false);
    });
    renderWidget();
    expect(() =>
      screen.getByRole("button", { name: dockStrings.bubble.openLabel }),
    ).toThrow();
  });

  it("reacts to toggling enableDockWidget", async () => {
    renderWidget();
    expect(
      screen.getByRole("button", { name: dockStrings.bubble.openLabel }),
    ).toBeInTheDocument();
    act(() => {
      settingsStore.set("enableDockWidget", false);
    });
    await waitFor(() =>
      expect(() =>
        screen.getByRole("button", { name: dockStrings.bubble.openLabel }),
      ).toThrow(),
    );
  });
});
