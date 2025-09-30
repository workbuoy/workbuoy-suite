import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ControlsDemo from "./controls-demo";

describe("ControlsDemo", () => {
  it("renders the proactivity switch and flip controls", () => {
    const { container } = render(<ControlsDemo />);

    const group = screen.getByRole("group", { name: /proactivity mode/i });
    const modeStatus = container.querySelector<HTMLElement>(
      "[data-testid=mode-status]",
    );
    const flipToggle = container.querySelector<HTMLElement>(
      "[data-testid=flip-toggle]",
    );

    expect(group).toBeInstanceOf(HTMLElement);
    expect(modeStatus?.textContent).toMatch(/Reactive mode enabled/i);
    expect(flipToggle?.getAttribute("aria-pressed")).toBe("false");
  });

  it("allows toggling the proactivity switch with keyboard", async () => {
    const user = userEvent.setup();
    render(<ControlsDemo />);

    const reactiveSegment = screen.getByRole("button", { name: /reactive/i });
    reactiveSegment.focus();
    expect(reactiveSegment.getAttribute("aria-pressed")).toBe("true");

    await user.keyboard("{Enter}");
    const modeStatus = document.querySelector<HTMLElement>(
      "[data-testid=mode-status]",
    );
    expect(modeStatus?.textContent).toMatch(/Proactive mode enabled/i);
    const proactiveSegment = screen.getByRole("button", { name: /proactive/i });
    expect(proactiveSegment.getAttribute("aria-pressed")).toBe("true");

    await user.keyboard("[Space]");
    expect(modeStatus?.textContent).toMatch(/Reactive mode enabled/i);
    expect(reactiveSegment.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles the flip card from the external button", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlsDemo />);

    const flipToggle = container.querySelector<HTMLElement>(
      "[data-testid=flip-toggle]",
    );
    if (!flipToggle) {
      throw new Error("Missing flip toggle");
    }
    flipToggle.focus();
    expect(document.activeElement).toBe(flipToggle);

    const reactiveHeading = screen.getByText("Reactive briefing");
    const reactiveFace = reactiveHeading.closest("[aria-hidden]");
    const proactiveHeading = screen.getByText("Proactive plan");
    const proactiveFace = proactiveHeading.closest("[aria-hidden]");

    if (!reactiveFace || !proactiveFace) {
      throw new Error("Missing flip card faces");
    }

    expect(reactiveFace.getAttribute("aria-hidden")).toBe("false");
    expect(proactiveFace.getAttribute("aria-hidden")).toBe("true");

    await user.keyboard("{Enter}");
    expect(flipToggle.getAttribute("aria-pressed")).toBe("true");
    expect(reactiveFace.getAttribute("aria-hidden")).toBe("true");
    expect(proactiveFace.getAttribute("aria-hidden")).toBe("false");

    await user.keyboard("[Space]");
    expect(flipToggle.getAttribute("aria-pressed")).toBe("false");
    expect(reactiveFace.getAttribute("aria-hidden")).toBe("false");
    expect(proactiveFace.getAttribute("aria-hidden")).toBe("true");

    const cardRegionId = flipToggle.getAttribute("aria-controls");
    expect(cardRegionId).toBeTruthy();
    expect(document.getElementById(cardRegionId || "")).not.toBeNull();
  });
});
