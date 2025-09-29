import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProactivitySwitch } from "./ProactivitySwitch.js";

describe("ProactivitySwitch", () => {
  it("renders with default reactive value", () => {
    render(<ProactivitySwitch />);

    const reactiveButton = screen.getByRole("button", { name: /reactive/i });
    const proactiveButton = screen.getByRole("button", { name: /proactive/i });

    expect(reactiveButton).toHaveAttribute("aria-pressed", "true");
    expect(proactiveButton).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to proactive on click and calls onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ProactivitySwitch onChange={handleChange} />);

    const proactiveButton = screen.getByRole("button", { name: /proactive/i });

    await act(async () => {
      await user.click(proactiveButton);
    });

    expect(proactiveButton).toHaveAttribute("aria-pressed", "true");
    expect(handleChange).toHaveBeenCalledWith("proactive");
  });

  it("handles keyboard arrow navigation", async () => {
    const user = userEvent.setup();

    render(<ProactivitySwitch />);

    await act(async () => {
      await user.tab();
    });
    const reactiveButton = screen.getByRole("button", { name: /reactive/i });
    expect(reactiveButton).toHaveFocus();

    await act(async () => {
      await user.keyboard("{ArrowRight}");
    });
    const proactiveButton = screen.getByRole("button", { name: /proactive/i });
    expect(proactiveButton).toHaveAttribute("aria-pressed", "true");
    expect(proactiveButton).toHaveFocus();

    await act(async () => {
      await user.keyboard("{ArrowLeft}");
    });
    expect(reactiveButton).toHaveAttribute("aria-pressed", "true");
    expect(reactiveButton).toHaveFocus();
  });

  it("toggles with space and enter", async () => {
    const user = userEvent.setup();

    render(<ProactivitySwitch />);

    await act(async () => {
      await user.tab();
    });
    const reactiveButton = screen.getByRole("button", { name: /reactive/i });

    await act(async () => {
      await user.keyboard(" ");
    });
    const proactiveButton = screen.getByRole("button", { name: /proactive/i });
    expect(proactiveButton).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      await user.keyboard("{Enter}");
    });
    expect(reactiveButton).toHaveAttribute("aria-pressed", "true");
  });

  it("notifies change in controlled mode without updating selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ProactivitySwitch value="reactive" onChange={handleChange} />);

    const proactiveButton = screen.getByRole("button", { name: /proactive/i });

    await act(async () => {
      await user.click(proactiveButton);
    });

    expect(handleChange).toHaveBeenCalledWith("proactive");
    expect(proactiveButton).toHaveAttribute("aria-pressed", "false");
  });

  it("sets appropriate accessibility attributes", () => {
    render(<ProactivitySwitch />);

    const group = screen.getByRole("group", { name: /proactivity mode/i });
    const reactiveButton = screen.getByRole("button", { name: /reactive/i });
    const proactiveButton = screen.getByRole("button", { name: /proactive/i });

    expect(group).toBeInTheDocument();
    expect(reactiveButton).toHaveAttribute("aria-pressed", "true");
    expect(proactiveButton).toHaveAttribute("aria-pressed", "false");
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<ProactivitySwitch />);

    expect(asFragment()).toMatchSnapshot();
  });
});
