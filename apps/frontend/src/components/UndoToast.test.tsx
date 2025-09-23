import { fireEvent, render, screen } from "@testing-library/react";
import React, { act } from "react";
import { vi } from "vitest";
import UndoToast from "./UndoToast";

test("renders message and calls undo handler", async () => {
  const onUndo = vi.fn().mockResolvedValue(true);
  const onClose = vi.fn();
  vi.useFakeTimers();
  try {
    render(
      <UndoToast
        open
        title="Kontakt Test ble opprettet"
        description="Lagret lokalt"
        canUndo
        onUndo={onUndo}
        onClose={onClose}
      />
    );
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Kontakt Test ble opprettet")).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: /Angre|Undo|Undoing/i }));
    await vi.waitFor(() => {
      expect(onUndo).toHaveBeenCalled();
    });
    await act(async () => {
      vi.runAllTimers();
    });
  } finally {
    vi.useRealTimers();
  }
});

test("renders fallback message when cannot undo", () => {
  render(<UndoToast open title="Handling" />);
  expect(screen.getByText("Handling")).toBeInTheDocument();
});
