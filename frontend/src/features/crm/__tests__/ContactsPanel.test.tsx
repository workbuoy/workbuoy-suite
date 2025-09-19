import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { ContactsPanel } from "../ContactsPanel";

const mockApiFetch = jest.fn<Promise<any>, [string, RequestInit | undefined]>();

jest.mock("@/api/client", () => ({
  apiFetch: (...args: [string, RequestInit | undefined]) => mockApiFetch(...args),
}));

describe("ContactsPanel", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("renders contacts returned from the API", async () => {
    mockApiFetch.mockResolvedValueOnce([
      { id: "1", name: "Ada Lovelace", email: "ada@example.com", phone: "555-1234" },
      { id: "2", name: "Grace Hopper", email: "grace@example.com", phone: "555-5678" },
    ]);

    render(<ContactsPanel />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(mockApiFetch).toHaveBeenCalledWith("/api/crm/contacts", undefined);
  });

  it("validates the form and creates a contact optimistically", async () => {
    mockApiFetch.mockResolvedValueOnce([]); // initial load

    render(<ContactsPanel />);
    await screen.findByText("No contacts yet.");

    fireEvent.click(screen.getByRole("button", { name: "Add Contact" }));

    const dialog = await screen.findByRole("dialog", { name: "Add Contact" });
    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toHaveFocus();

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(mockApiFetch).toHaveBeenCalledTimes(1);

    mockApiFetch.mockResolvedValueOnce({
      id: "3",
      name: "New Contact",
      email: "new@example.com",
      phone: "12312312",
    });

    fireEvent.change(nameInput, { target: { value: "New Contact" } });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "12312312" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/crm/contacts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "New Contact",
          email: "new@example.com",
          phone: "12312312",
        }),
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("table")).toHaveTextContent("New Contact"),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Add Contact" })).not.toBeInTheDocument(),
    );
  });

  it("reverts optimistic append when creation fails", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    render(<ContactsPanel />);
    await screen.findByText("No contacts yet.");

    fireEvent.click(screen.getByRole("button", { name: "Add Contact" }));
    await screen.findByRole("dialog", { name: "Add Contact" });

    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Temp Contact" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        "/api/crm/contacts",
        expect.objectContaining({ method: "POST" }),
      ),
    );

    await waitFor(() =>
      expect(screen.queryByText("Temp Contact")).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText("Could not create contact. Try again."),
    ).toBeInTheDocument();
  });

  it("deletes a contact after confirmation", async () => {
    mockApiFetch.mockResolvedValueOnce([
      { id: "1", name: "Ada Lovelace", email: "ada@example.com", phone: "555" },
    ]);

    render(<ContactsPanel />);
    await screen.findByText("Ada Lovelace");

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    mockApiFetch.mockResolvedValueOnce({ ok: true });

    fireEvent.click(screen.getByRole("button", { name: "Delete Ada Lovelace" }));

    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );
    expect(mockApiFetch).toHaveBeenLastCalledWith(
      "/api/crm/contacts?id=1",
      expect.objectContaining({ method: "DELETE" }),
    );
    confirmSpy.mockRestore();
  });

  it("restores a contact if deletion fails", async () => {
    mockApiFetch.mockResolvedValueOnce([
      { id: "1", name: "Ada Lovelace", email: "ada@example.com", phone: "555" },
    ]);

    render(<ContactsPanel />);
    await screen.findByText("Ada Lovelace");

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    mockApiFetch.mockRejectedValueOnce(new Error("nope"));

    fireEvent.click(screen.getByRole("button", { name: "Delete Ada Lovelace" }));

    expect(await screen.findByText("Could not delete contact. It has been restored.")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("restores a failed delete without dropping other optimistic updates", async () => {
    mockApiFetch.mockResolvedValueOnce([
      { id: "1", name: "Ada Lovelace", email: "ada@example.com", phone: "555" },
      { id: "2", name: "Grace Hopper", email: "grace@example.com", phone: "777" },
    ]);

    render(<ContactsPanel />);
    await screen.findByText("Ada Lovelace");

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    let rejectDelete: ((reason?: unknown) => void) | undefined;
    mockApiFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectDelete = reject;
        }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Ada Lovelace" }));

    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );

    mockApiFetch.mockResolvedValueOnce({
      id: "3",
      name: "New Contact",
      email: "new@example.com",
      phone: "12312312",
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Contact" }));
    const dialog = await screen.findByRole("dialog", { name: "Add Contact" });

    const nameInput = within(dialog).getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "New Contact" } });
    fireEvent.change(within(dialog).getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(within(dialog).getByLabelText("Phone"), {
      target: { value: "12312312" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByText("New Contact")).toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Add Contact" }),
      ).not.toBeInTheDocument(),
    );

    expect(rejectDelete).toBeDefined();
    act(() => {
      rejectDelete?.(new Error("delete failed"));
    });

    await waitFor(() =>
      expect(
        screen.getByText("Could not delete contact. It has been restored."),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText("Ada Lovelace")).toBeInTheDocument());

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("New Contact")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("closes the dialog when escape is pressed", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    render(<ContactsPanel />);
    await screen.findByText("No contacts yet.");

    fireEvent.click(screen.getByRole("button", { name: "Add Contact" }));
    const dialog = await screen.findByRole("dialog", { name: "Add Contact" });
    expect(dialog).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Add Contact" })).not.toBeInTheDocument(),
    );
  });
});
