import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { DealsPanel } from "./DealsPanel";

const apiFetch = vi.fn();

vi.mock("@/api", () => ({
  apiFetch: (...args: any[]) => apiFetch(...args),
}));

beforeEach(() => {
  apiFetch.mockReset();
});

test("updates deal status and allows undo", async () => {
  apiFetch.mockImplementation((path: string, opts?: RequestInit) => {
    if (path === "/api/deals" && !opts) {
      return Promise.resolve([{ id: "d1", contactId: "c1", value: 100, status: "open" }]);
    }
    if (path === "/api/deals" && opts?.method === "POST") {
      return Promise.resolve({ undoToken: "undo-deal" });
    }
    if (path === "/core/undo") {
      return Promise.resolve({});
    }
    return Promise.resolve([]);
  });

  render(<DealsPanel />);

  const select = await screen.findByLabelText("Status");
  fireEvent.change(select, { target: { value: "won" } });

  await waitFor(() => screen.getByText(/Avtale d1 satt til won/));

  fireEvent.click(screen.getByText("Angre"));

  await waitFor(() => {
    expect(apiFetch).toHaveBeenCalledWith("/core/undo", expect.any(Object));
  });
});
