import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import NaviGrid from "@/features/navi/NaviGrid";
import { Flags } from "@/lib/flags";

const apiFetch = vi.fn();

vi.mock("@/api", () => ({
  apiFetch: (...args: any[]) => apiFetch(...args),
}));

describe("O365 panel flag", () => {
  const originalFlag = Flags.enableO365Panel;
  beforeEach(() => {
    Flags.enableO365Panel = originalFlag;
    apiFetch.mockReset();
    apiFetch.mockImplementation((path: string) => {
      if (path === "/api/addons") {
        return Promise.resolve([
          { id: "o365", name: "Office 365", icon: "📧", category: "integrasjoner", enabled: true },
        ]);
      }
      return Promise.resolve([]);
    });
  });

  afterAll(() => {
    Flags.enableO365Panel = originalFlag;
  });

  it("does not open panel when flag disabled", async () => {
    Flags.enableO365Panel = false;
    render(<NaviGrid />);
    const tile = await screen.findByText("Office 365");
    fireEvent.click(tile);
    expect(screen.queryByText("Siste e-poster og dokumenter")).not.toBeInTheDocument();
  });

  it("opens panel when flag enabled", async () => {
    Flags.enableO365Panel = true;
    render(<NaviGrid />);
    const tile = await screen.findByText("Office 365");
    fireEvent.click(tile);
    expect(await screen.findByText("Siste e-poster og dokumenter")).toBeInTheDocument();
  });
});
