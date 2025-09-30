import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FlipCard from "./FlipCard.js";

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

describe("FlipCard accessibility", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("allows keyboard flipping while keeping focus", async () => {
    const user = userEvent.setup();

    render(<FlipCard front={<div>Front</div>} back={<div>Back</div>} />);

    const card = screen.getByRole("button", { name: /front/i });
    expect(card).toHaveAttribute("aria-pressed", "false");
    expect(card).not.toHaveFocus();

    await act(async () => {
      await user.tab();
    });

    expect(card).toHaveFocus();

    await act(async () => {
      await user.keyboard("{Enter}");
    });

    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(card).toHaveFocus();

    await act(async () => {
      await user.keyboard("{Space}");
    });

    expect(card).toHaveAttribute("aria-pressed", "false");
    expect(card).toHaveFocus();
  });

  it("respects reduced motion preferences without throwing", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();

    render(<FlipCard front={<div>Front</div>} back={<div>Back</div>} />);

    const card = screen.getAllByRole("button", { name: /front/i })[0]!;

    await act(async () => {
      await user.click(card);
    });

    expect(card).toHaveAttribute("aria-pressed", "true");
  });
});
