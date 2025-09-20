import React from "react";
import { vi, describe, it, test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlipCard from "./FlipCard";
import { ActiveContextProvider, useActiveContext } from "@/core/ActiveContext";

function renderWithProviders(ui: React.ReactElement) {
  return render(<ActiveContextProvider>{ui}</ActiveContextProvider>);
}

describe("FlipCard", () => {
  test("renders front by default and flips to back", async () => {
    const onFlip = vi.fn();
    renderWithProviders(
      <FlipCard
        front={<div>Front</div>}
        back={<div>Back</div>}
        onFlip={onFlip}
      />,
    );

    expect(screen.getByTestId("flip-card-front").textContent).toContain("Front");
    const flipButton = screen.getByRole("button", { name: /show navi/i });
    fireEvent.click(flipButton);
    await waitFor(() => expect(onFlip).toHaveBeenCalledWith("back"));
    expect(screen.getByTestId("flip-card-back").textContent).toContain("Back");
  });

  test("resizes via keyboard", () => {
    const onResize = vi.fn();
    renderWithProviders(
      <FlipCard
        front={<div>Front</div>}
        back={<div>Back</div>}
        onResize={onResize}
      />,
    );
    const card = screen.getByRole("group", { name: /flip card/i });
    fireEvent.keyDown(card, { key: "ArrowRight", shiftKey: true });
    expect(onResize).toHaveBeenCalled();
  });

  test("connects using selected entity", async () => {
    const onConnect = vi.fn();
    function FrontSetter() {
      const { setSelectedEntity } = useActiveContext();
      React.useEffect(() => {
        setSelectedEntity({ type: "contact", id: "contact-1", name: "Ada" });
      }, [setSelectedEntity]);
      return <div>Front</div>;
    }
    renderWithProviders(
      <FlipCard
        front={<FrontSetter />}
        back={<div>Back</div>}
        onConnect={onConnect}
      />,
    );

    const connectButton = await screen.findByRole("button", {
      name: /connect contact:ada/i,
    });
    fireEvent.click(connectButton);
    await waitFor(() =>
      expect(onConnect).toHaveBeenCalledWith(
        expect.objectContaining({ type: "contact", id: "contact-1" }),
      ),
    );
  });

  it("activates connect without flipping when Enter is pressed (toolbar button)", () => {
    const onConnect = vi.fn();
    renderWithProviders(
      <FlipCard
        front={<div>Front</div>}
        back={<div>Back</div>}
        onConnect={onConnect}
      />,
    );

    // Front face should be visible initially
    const frontSection = screen.getByLabelText(/buoy panel/i);
    expect(frontSection.getAttribute("aria-hidden")).not.toBe("true");

    const connectButton = screen.getByRole("button", { name: /connect/i });
    connectButton.focus();

    // Pressing Enter on the toolbar "Connect" must not flip the card
    fireEvent.keyDown(connectButton, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(connectButton, { key: "Enter", code: "Enter" });

    expect(onConnect).toHaveBeenCalledTimes(1);
    // Still on front
    expect(frontSection.getAttribute("aria-hidden")).not.toBe("true");
  });
});
