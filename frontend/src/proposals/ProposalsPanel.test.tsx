import React from "react";
import { describe, beforeEach, afterEach, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProposalsPanel from "./ProposalsPanel";
import { ActiveContextProvider, useActiveContext, type ActiveContext } from "@/core/ActiveContext";

type ProposalStub = {
  id: string;
  capabilityId: string;
  createdAt: string;
  status: "proposed";
  preview?: unknown;
  payload?: Record<string, unknown>;
  summary?: string;
};

type ProposalsPayload = { proposals: ProposalStub[] };

type SelectionChange = ActiveContext["selectedEntity"] | null;

function toUrl(input: RequestInfo | URL): URL {
  if (typeof input === "string") {
    return new URL(input, "http://localhost");
  }
  if (input instanceof URL) {
    return input;
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    return new URL(input.url);
  }
  return new URL(String(input), "http://localhost");
}

describe("ProposalsPanel", () => {
  let payload: ProposalsPayload;
  let fetchMock: ReturnType<typeof vi.fn>;
  let intervalSpy: ReturnType<typeof vi.spyOn>;
  let clearIntervalSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    payload = { proposals: [] };
    intervalSpy = vi.spyOn(globalThis, "setInterval").mockImplementation((() => 0) as any);
    clearIntervalSpy = vi.spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = toUrl(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.pathname === "/api/proposals" && method === "GET") {
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      const approveMatch = url.pathname.match(/^\/api\/proposals\/([^/]+)\/approve$/);
      if (approveMatch && method === "POST") {
        const proposal = payload.proposals.find((item) => item.id === approveMatch[1]);
        payload = { proposals: payload.proposals.filter((item) => item.id !== approveMatch[1]) };
        return new Response(
          JSON.stringify({ proposal: proposal ? { ...proposal, status: "approved" } : null }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response("not-found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    intervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  function getRowContainerByName(name: string): HTMLElement {
    const selectButton = screen.getByText(name);
    const container = selectButton.closest("[data-active]");
    if (!container) {
      throw new Error(`Unable to resolve container for ${name}`);
    }
    return container as HTMLElement;
  }

  function getApproveButton(container: HTMLElement): HTMLButtonElement {
    const match = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.toLowerCase().includes("approve"),
    );
    if (!match) {
      throw new Error("Approve button not found");
    }
    return match as HTMLButtonElement;
  }

  function SelectionObserver({ onChange }: { onChange: (value: SelectionChange) => void }) {
    const { selectedEntity } = useActiveContext();
    React.useEffect(() => {
      onChange(selectedEntity ?? null);
    }, [selectedEntity, onChange]);
    return null;
  }

  test("approving the active row selects the next proposal", async () => {
    payload = {
      proposals: [
        {
          id: "p-1",
          capabilityId: "crm.contacts.create",
          createdAt: "2024-07-01T10:00:00.000Z",
          status: "proposed",
          payload: { entity: { type: "contact", id: "c-1", name: "Alpha" } },
        },
        {
          id: "p-2",
          capabilityId: "crm.contacts.update",
          createdAt: "2024-07-01T11:00:00.000Z",
          status: "proposed",
          payload: { entity: { type: "contact", id: "c-2", name: "Bravo" } },
        },
      ],
    };

    const selectionSpy = vi.fn();
    let latestSelection: SelectionChange = null;
    const handleSelectionChange = (value: SelectionChange) => {
      latestSelection = value;
      selectionSpy(value);
    };

    render(
      <ActiveContextProvider>
        <SelectionObserver onChange={handleSelectionChange} />
        <ProposalsPanel />
      </ActiveContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("crm.contacts.create")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(latestSelection?.id).toBe("c-1");
    });

    const firstRow = getRowContainerByName("Alpha");
    const approveButton = getApproveButton(firstRow);
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(latestSelection?.id).toBe("c-2");
    });

    const secondRow = getRowContainerByName("Bravo");
    expect(secondRow.getAttribute("data-active")).toBe("true");
  });

  test("approving the last proposal clears the active selection", async () => {
    payload = {
      proposals: [
        {
          id: "solo",
          capabilityId: "crm.contacts.create",
          createdAt: "2024-07-02T09:00:00.000Z",
          status: "proposed",
          payload: { entity: { type: "contact", id: "c-9", name: "Solo" } },
        },
      ],
    };

    let latestSelection: SelectionChange = null;

    render(
      <ActiveContextProvider>
        <SelectionObserver onChange={(value) => {
          latestSelection = value;
        }} />
        <ProposalsPanel />
      </ActiveContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("crm.contacts.create")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(latestSelection?.id).toBe("c-9");
    });

    const row = getRowContainerByName("Solo");
    const approveButton = getApproveButton(row);
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(latestSelection).toBeNull();
      expect(() => screen.getByText("Solo")).toThrow();
    });
  });
});
