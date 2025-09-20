import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import CollabPanel from "../chat/CollabPanel";

beforeAll(() => {
  if (!("clipboard" in navigator)) {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
  }
});

test("renders threads and opens why drawer", async () => {
  render(<CollabPanel />);
  expect(screen.getByRole("heading", { name: /Samarbeid/i })).toBeInTheDocument();
  const openButtons = screen.getAllByText("Hvorfor");
  await fireEvent.click(openButtons[0]);
  expect(screen.getByRole("dialog", { name: /Samarbeid/i })).toBeInTheDocument();
});

test("shows empty state when no threads", () => {
  render(<CollabPanel threads={[]} />);
  expect(screen.getByText(/Ingen tråder/i)).toBeInTheDocument();
});
