import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import GWorkspacePanel from "../gws/GWorkspacePanel";

beforeAll(() => {
  if (!("clipboard" in navigator)) {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
  }
});

test("shows workspace entries and opens why drawer", async () => {
  render(<GWorkspacePanel />);
  expect(screen.getByRole("heading", { name: /Google Workspace/i })).toBeInTheDocument();
  await fireEvent.click(screen.getAllByText("Hvorfor")[0]);
  expect(screen.getByRole("dialog", { name: /Google Workspace/i })).toBeInTheDocument();
});

test("renders empty state when entries missing", () => {
  render(<GWorkspacePanel entries={[]} />);
  expect(screen.getByText(/Ingen dokumenter/i)).toBeInTheDocument();
});
