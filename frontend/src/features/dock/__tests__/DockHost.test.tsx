import React, { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { dockStrings } from "../strings";

vi.mock("@/core/ActiveContext", () => ({
  ActiveContextProvider: ({ children }: { children: ReactNode }) => children,
  useActiveContext: () => ({
    timeOfDay: "morning" as const,
    selectedEntity: null,
    recentIntents: [],
    setSelectedEntity: () => {},
    pushIntent: () => {},
  }),
}));

const { default: DockHost } = await import("../DockHost");

const frontStub = <div>Front</div>;
const backStub = <div>Back</div>;

function dispatchKey(key: string, options: { ctrl?: boolean; shift?: boolean } = {}) {
  const event = new KeyboardEvent("keydown", {
    key,
    ctrlKey: options.ctrl ?? false,
    shiftKey: options.shift ?? false,
    bubbles: true,
  });
  Object.defineProperty(event, "target", {
    value: document.body,
    configurable: true,
  });
  act(() => {
    window.dispatchEvent(event);
  });
}

function HostHarness({ hotkeysEnabled = true }: { hotkeysEnabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    anchorRef.current?.focus();
    setOpen(true);
  }, []);
  return (
    <>
      <button ref={anchorRef}>anchor</button>
      <DockHost
        open={open}
        onClose={() => setOpen(false)}
        front={frontStub}
        back={backStub}
        onConnect={() => undefined}
        hotkeysEnabled={hotkeysEnabled}
      />
    </>
  );
}

describe("DockHost", () => {
  it("focuses the close button when opened", async () => {
    render(<HostHarness />);
    await waitFor(() => {
      const close = screen.getByRole("button", { name: dockStrings.toolbar.close });
      expect(document.activeElement).toBe(close);
    });
  });

  it("handles hotkeys when enabled", () => {
    const onSideChange = vi.fn();
    render(
      <DockHost
        open
        onClose={() => undefined}
        onSideChange={onSideChange}
        front={frontStub}
        back={backStub}
        onConnect={() => undefined}
        hotkeysEnabled
      />,
    );
    dispatchKey(" ", { ctrl: true });
    expect(onSideChange).toHaveBeenCalledWith("back");
    onSideChange.mockClear();
    dispatchKey(" ", { ctrl: true });
    expect(onSideChange).toHaveBeenCalledWith("front");
    onSideChange.mockClear();
    dispatchKey(" ", { ctrl: true, shift: true });
    expect(onSideChange).toHaveBeenCalledWith("back");
  });

  it("ignores hotkeys when disabled", () => {
    const onSideChange = vi.fn();
    render(
      <DockHost
        open
        onClose={() => undefined}
        onSideChange={onSideChange}
        front={frontStub}
        back={backStub}
        onConnect={() => undefined}
        hotkeysEnabled={false}
      />,
    );
    dispatchKey(" ", { ctrl: true, shift: true });
    expect(onSideChange).not.toHaveBeenCalled();
  });

  it("closes on escape and restores focus", async () => {
    render(<HostHarness />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: dockStrings.toolbar.close }),
      ).toBeInTheDocument(),
    );
    dispatchKey("Escape");
    await waitFor(() => expect(() => screen.getByRole("dialog")).toThrow());
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "anchor" }),
    );
  });
});
