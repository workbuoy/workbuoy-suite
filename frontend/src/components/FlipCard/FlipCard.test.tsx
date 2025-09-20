import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FlipCard from "./FlipCard";

describe("FlipCard keyboard handling", () => {
  it("activates connect without flipping when Enter is pressed", () => {
    const onConnect = vi.fn();
    render(<FlipCard onConnect={onConnect} />);

    const frontFace = screen.getByLabelText(/Buoy chat/i);
    expect(frontFace.getAttribute("aria-hidden")).not.toBe("true");

    const connectButton = screen.getByRole("button", { name: /connect/i });
    connectButton.focus();

    fireEvent.keyDown(connectButton, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(connectButton, { key: "Enter", code: "Enter" });

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(frontFace.getAttribute("aria-hidden")).not.toBe("true");
  });
});
