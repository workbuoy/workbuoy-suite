import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProactivitySwitch } from "./ProactivitySwitch.js";

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

describe("ProactivitySwitch accessibility", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("exposes role switch with aria-checked updates", async () => {
    const user = userEvent.setup();

    render(<ProactivitySwitch />);

    const toggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await act(async () => {
      await user.click(toggle);
    });

    const updatedToggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;
    expect(updatedToggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/proactive mode active/i)).toBeInTheDocument();
  });

  it("supports keyboard interactions while maintaining focus", async () => {
    const user = userEvent.setup();

    render(<ProactivitySwitch />);

    await act(async () => {
      await user.tab();
    });

    const [toggle] = screen.getAllByRole("switch", { name: /proactivity mode/i });
    expect(document.activeElement).toBe(toggle);

    await act(async () => {
      await user.keyboard("{Space}");
    });

    let activeToggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;
    expect(activeToggle).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(activeToggle);

    await act(async () => {
      await user.keyboard("{Enter}");
    });

    activeToggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;
    expect(activeToggle).toHaveAttribute("aria-checked", "false");
    expect(document.activeElement).toBe(activeToggle);
  });

  it("respects reduced motion when preference is enabled", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();

    render(<ProactivitySwitch />);

    const toggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;

    await act(async () => {
      await user.click(toggle);
    });

    const updatedToggle = screen.getAllByRole("switch", { name: /proactivity mode/i })[0]!;
    expect(updatedToggle).toHaveAttribute("aria-checked", "true");
  });
});
