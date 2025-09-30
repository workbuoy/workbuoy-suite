import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BuoyDock } from "./BuoyDock.js";

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: (event: MediaQueryListEvent) => {
      listeners.forEach((listener) => listener(event));
      return true;
    },
  }));
}

function getNamedButton(name: RegExp) {
  const elements = screen.getAllByRole("button", { name });
  const button = elements.find((element) => element.tagName === "BUTTON");
  if (!button) {
    throw new Error(`Button with name ${name} not found`);
  }
  return button as HTMLButtonElement;
}

async function findNamedButton(name: RegExp) {
  const elements = await screen.findAllByRole("button", { name });
  const button = elements.find((element) => element.tagName === "BUTTON");
  if (!button) {
    throw new Error(`Button with name ${name} not found`);
  }
  return button as HTMLButtonElement;
}

describe("BuoyDock accessibility", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("flips and expands with keyboard control while managing focus", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <BuoyDock
        titleFront="buoy ai"
        titleBack="Navi"
        ariaLabel="BuoyDock widget"
        childrenFront={<div>Chat content</div>}
        childrenBack={
          <div>
            <button type="button">Handling</button>
          </div>
        }
      />,
    );

    const dock = screen.getByRole("complementary", { name: /buoydock widget/i });
    expect(dock).toHaveAttribute("data-expanded", "false");
    expect(dock).toHaveAccessibleName("BuoyDock widget");

    const flipToBack = getNamedButton(/flip to navi/i);

    await act(async () => {
      await user.click(flipToBack);
    });

    const flipToFront = await findNamedButton(/flip to buoy ai/i);
    expect(flipToFront).toBeVisible();
    expect(dock).toHaveAttribute("data-expanded", "false");

    const expandButton = await findNamedButton(/expand/i);

    await act(async () => {
      await user.click(expandButton);
    });

    const dialog = await screen.findByRole("dialog", { name: /navi/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-expanded", "true");

    const backHeader = within(dialog).getByText("Navi");
    expect(backHeader).toHaveFocus();

    const liveRegion = container.querySelector(".wbui-buoydock__live-region");
    expect(liveRegion?.textContent).toBe("Navi expanded");

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    const collapsedDock = await screen.findByRole("complementary", { name: /buoydock widget/i });
    expect(collapsedDock).toHaveAttribute("data-expanded", "false");
    expect(liveRegion?.textContent).toBe("Navi collapsed");
    expect(expandButton).toHaveFocus();
  });

  it("respects reduced motion preferences", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();

    render(
      <BuoyDock
        titleFront="buoy ai"
        titleBack="Navi"
        ariaLabel="BuoyDock widget"
        childrenFront={<div>Chat</div>}
        childrenBack={<div>Navi</div>}
      />,
    );

    const dock = screen.getByRole("complementary", { name: /buoydock widget/i });

    await waitFor(() => {
      expect(dock).toHaveAttribute("data-reduced-motion", "true");
    });

    const flipToBack = getNamedButton(/flip to navi/i);

    await act(async () => {
      flipToBack.focus();
      await user.keyboard("{Enter}");
    });

    const expandButton = await findNamedButton(/expand/i);

    await act(async () => {
      await user.click(expandButton);
    });

    expect(await screen.findByRole("dialog", { name: /navi/i })).toBeInTheDocument();
  });
});
