import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import NaviGrid from "./NaviGrid";

const apiFetch = vi.fn();

vi.mock("@/api", () => ({
  apiFetch: (...args: any[]) => apiFetch(...args),
}));

beforeEach(() => {
  apiFetch.mockReset();
});

test("renders addons from manifest and toggles locally", async () => {
  apiFetch.mockImplementation((path: string) => {
    if (path === "/api/addons") {
      return Promise.resolve([
        { id: "crm", name: "CRM", icon: "📇", category: "core", enabled: true },
        { id: "demo", name: "Demo", icon: "🧪", category: "demo", enabled: false },
      ]);
    }
    return Promise.resolve([]);
  });

  render(<NaviGrid />);

  expect(await screen.findByText("Demo")).toBeInTheDocument();

  const toggle = await screen.findByRole("switch", { name: "Av" });
  expect(toggle).toHaveAttribute("aria-checked", "false");

  fireEvent.click(toggle);

  await waitFor(() => {
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
