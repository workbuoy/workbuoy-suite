import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import VismaImpactPanel from "../visma/VismaImpactPanel";

beforeAll(() => {
  if (!("clipboard" in navigator)) {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
  }
});

test("renders KPI cards and micro charts", () => {
  render(<VismaImpactPanel />);
  expect(screen.getByRole("heading", { name: /Visma ERP/i })).toBeInTheDocument();
  expect(screen.getByText(/mikrograf/i)).toBeInTheDocument();
  expect(screen.getByText(/Inndrevet/)).toBeInTheDocument();
});

test("opens audit drawer when requested", async () => {
  render(<VismaImpactPanel />);
  await fireEvent.click(screen.getByText("Audit"));
  expect(screen.getByRole("dialog", { name: /Visma ERP/i })).toBeInTheDocument();
});
