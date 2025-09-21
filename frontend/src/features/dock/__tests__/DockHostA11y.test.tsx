import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DockHost from "../DockHost";
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

describe("DockHost accessibility", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("redirects focus via sentinels", async () => {
    render(
      <DockHost
        open
        onClose={() => undefined}
        front={<div>Front</div>}
        back={<div>Back</div>}
        onConnect={() => undefined}
      />,
    );

    const dialog = await screen.findByRole("dialog", { name: dockStrings.host.title });
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("data-dock-sentinel"));
    expect(focusable.length).toBeGreaterThan(0);

    const startSentinel = dialog.querySelector<HTMLElement>('[data-dock-sentinel="start"]');
    const endSentinel = dialog.querySelector<HTMLElement>('[data-dock-sentinel="end"]');
    expect(startSentinel).toBeTruthy();
    expect(endSentinel).toBeTruthy();

    startSentinel!.focus();
    await waitFor(() => expect(document.activeElement).toBe(focusable[focusable.length - 1]));

    endSentinel!.focus();
    await waitFor(() => expect(document.activeElement).toBe(focusable[0]));
  });

  it("exposes polite aria-live announcements for the active side", async () => {
    render(
      <DockHost
        open
        onClose={() => undefined}
        front={<div>Front</div>}
        back={<div>Back</div>}
        onConnect={() => undefined}
      />,
    );

    const chip = await screen.findByText("Buoy");
    expect(chip.getAttribute("aria-live")).toBe("polite");
  });

  it("closes on escape and restores previous focus", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      useEffect(() => {
        const timer = setTimeout(() => setOpen(true), 0);
        return () => clearTimeout(timer);
      }, []);
      return (
        <>
          <button type="button" data-testid="origin">
            Origin
          </button>
          <DockHost
            open={open}
            onClose={() => setOpen(false)}
            front={<div>Front</div>}
            back={<div>Back</div>}
            onConnect={() => undefined}
          />
        </>
      );
    }

    const { queryByRole } = render(<Harness />);
    const origin = await screen.findByRole("button", { name: "Origin" });
    origin.focus();

    const user = userEvent.setup();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: dockStrings.toolbar.close })).toBeInTheDocument(),
    );
    await user.keyboard("{Escape}");

    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(origin));
  });
});
