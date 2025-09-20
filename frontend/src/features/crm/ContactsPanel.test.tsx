import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { ContactsPanel } from "./ContactsPanel";

const apiFetch = vi.fn();

vi.mock("@/api", () => ({
  apiFetch: (...args: any[]) => apiFetch(...args),
}));

beforeEach(() => {
  apiFetch.mockReset();
});

test("shows undo toast after creating contact and performs undo", async () => {
  apiFetch.mockImplementation((path: string, opts?: RequestInit) => {
    if (path === "/api/crm/contacts" && !opts) {
      return Promise.resolve([]);
    }
    if (path === "/api/crm/contacts" && opts?.method === "POST") {
      return Promise.resolve({ id: "c1", name: "Test", email: "test@example.com", undoToken: "undo-1" });
    }
    if (path === "/core/undo") {
      return Promise.resolve({});
    }
    if (path === "/api/crm/contacts" && opts?.method === "DELETE") {
      return Promise.resolve({ undoToken: "undo-2" });
    }
    return Promise.resolve([]);
  });

  render(<ContactsPanel />);

  fireEvent.click(await screen.findByText("Legg til kontakt"));
  fireEvent.change(screen.getByPlaceholderText("Navn"), { target: { value: "Test" } });
  fireEvent.click(screen.getByText("Lagre"));

  await waitFor(() => screen.getByText(/Kontakt Test ble opprettet/));

  fireEvent.click(screen.getByText("Angre"));

  await waitFor(() => {
    expect(apiFetch).toHaveBeenCalledWith("/core/undo", expect.any(Object));
  });
});
