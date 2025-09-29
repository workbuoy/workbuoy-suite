import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FlipCard from "./FlipCard";

describe("FlipCard", () => {
  it("toggles aria-pressed on click when uncontrolled", async () => {
    const user = userEvent.setup();
    render(<FlipCard front={<div>Front</div>} back={<div>Back</div>} />);

    const card = screen.getByRole("button", { name: /front/i });

    expect(card).toHaveAttribute("aria-pressed", "false");

    await act(async () => {
      await user.click(card);
    });

    expect(card).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      await user.click(card);
    });

    expect(card).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onFlip for keyboard interactions", async () => {
    const onFlip = vi.fn();
    const user = userEvent.setup();

    render(<FlipCard front={<div>Front</div>} back={<div>Back</div>} onFlip={onFlip} />);

    await act(async () => {
      await user.tab();
    });

    const card = screen.getByRole("button", { name: /front/i });
    expect(card).toHaveFocus();

    await act(async () => {
      await user.keyboard("{Enter}");
    });
    await act(async () => {
      await user.keyboard(" ");
    });

    expect(onFlip).toHaveBeenCalledTimes(2);
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <FlipCard
        front={<div>Front Snapshot</div>}
        back={<div>Back Snapshot</div>}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
